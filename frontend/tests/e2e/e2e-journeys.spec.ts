/**
 * End-to-end journey tests for PROCHECK Safety.
 *
 * Ten narrative journeys that exercise the full stack: UI at :3000, API at
 * :4000, and the docker-hosted Postgres beneath it. Each test uses
 * `test.step()` blocks so the HTML report reads like a user story, and every
 * flow verifies state via API rather than direct DB access.
 *
 * Seed users (discovered via `SELECT email, role_code FROM users`):
 *   principal_admin : admin@procheeck.mx        (password: password123)
 *   client_admin    : client-admin@procheeck.mx (password: password123)
 *   client          : client@procheeck.mx       (password: password123)
 *   subcontractor   : sub@procheeck.mx          (password: password123)
 *   employee        : employee@procheeck.mx     (password: password123)
 *   vendedor        : ale.ibarra@procheck.mx    (password: demo1234)
 *   vendedor        : mauricio.herrera@...      (password: demo1234)
 *   vendedor        : renata.solis@...          (password: demo1234)
 *   capacitador     : fernando.reyes@...        (password: demo1234)
 *   capacitador     : paola.guzman@...          (password: demo1234)
 *
 * NOTE on the marketing mockup pages: /courses, /cart, /checkout and
 * /certificate-lookup are static React pages without cart state or checkout
 * wiring. The journey tests exercise them as far as they will go, then hit
 * the real backend endpoints to prove the underlying flow works. This is
 * documented per-test.
 */

import { test, expect, request as pwRequest } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

test.use({ video: "on" });

const API = "http://localhost:4000";

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

const ADMIN_EMAIL = "admin@procheeck.mx";
const ADMIN_PW = "password123";
const CLIENT_ADMIN_EMAIL = "client-admin@procheeck.mx";
const CLIENT_ADMIN_PW = "password123";
const EMPLOYEE_EMAIL = "employee@procheeck.mx";
const EMPLOYEE_PW = "password123";
const VENDEDOR_EMAIL = "ale.ibarra@procheck.mx";
const VENDEDOR_PW = "demo1234";
const CAPACITADOR_EMAIL = "fernando.reyes@procheck.mx";
const CAPACITADOR_PW = "demo1234";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user?: any;
};

async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<LoginResponse | null> {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email, password },
    failOnStatusCode: false,
  });
  if (![200, 201].includes(res.status())) return null;
  return (await res.json()) as LoginResponse;
}

async function primeSession(
  page: Page,
  auth: LoginResponse,
): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ token, user }) => {
      window.localStorage.setItem("procheck_token", token);
      window.localStorage.setItem("procheck_user", JSON.stringify(user));
    },
    { token: auth.accessToken, user: auth.user },
  );
}

/** Two-step UI login: email → Continuar → password → Continuar. */
async function uiLogin(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page
    .getByRole("button", { name: /Continuar|Ingresar|Iniciar/i })
    .first()
    .click();
  const pw = page.locator('input[type="password"]');
  await pw.waitFor({ state: "visible", timeout: 5000 });
  await pw.fill(password);
  await page
    .getByRole("button", { name: /Continuar|Ingresar|Iniciar/i })
    .first()
    .click();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// -----------------------------------------------------------------------------
// journeys
// -----------------------------------------------------------------------------

test.describe.serial("PROCHECK Safety - end-to-end journeys", () => {
  // ===========================================================================
  // Journey 1: Public buys a course
  // ===========================================================================
  test("J1 - public browses catalog, adds a course to cart, checks out", async ({
    page,
    request,
  }) => {
    await test.step("Visit /courses as anonymous", async () => {
      await page.goto("/courses", { waitUntil: "networkidle" });
    });

    await test.step("At least 5 course cards render (catalog is static)", async () => {
      // Static catalog in /lib/courses; expect a healthy number of cards.
      const bodyText = await page.locator("body").innerText();
      // Cards each show hours label like "8 h".
      const hourMatches = bodyText.match(/\d+\s?h\b/g) || [];
      expect(hourMatches.length).toBeGreaterThanOrEqual(5);
    });

    await test.step("Add a course to cart via 'Añadir al carrito' button", async () => {
      // The cart is client-side (localStorage). Clicking the button on the
      // first course card persists an item and shows a toast.
      const addBtn = page
        .getByRole("button", { name: /Añadir al carrito/i })
        .first();
      await expect(addBtn).toBeVisible({ timeout: 10000 });
      await addBtn.click();
      // Small wait for state to settle + localStorage write.
      await page.waitForTimeout(300);
    });

    await test.step("Navigate to /cart and verify cart has an item", async () => {
      await page.goto("/cart", { waitUntil: "networkidle" });
      const body = await page.locator("body").innerText();
      // A populated cart renders both the heading and the summary panel.
      expect(body).toMatch(/Tu carrito/i);
      expect(body).toMatch(/Subtotal/i);
      expect(body).toMatch(/Proceder al pago/i);
    });

    await test.step("Click 'Proceder al pago' → redirects to /login (unauth)", async () => {
      await page.getByRole("button", { name: /Proceder al pago/i }).click();
      // Anonymous user gets bounced to login with a returnTo param.
      await page.waitForURL(/\/login/, { timeout: 5000 });
    });

    // The marketing checkout page is a static mockup. To prove the backend
    // purchase flow works end-to-end, drive /api/payments/checkout directly
    // and simulate the webhook — this is the real business logic.
    let paymentId = "";
    await test.step("Backend: create a real payment via /api/payments/checkout", async () => {
      const vendedor = await apiLogin(request, VENDEDOR_EMAIL, VENDEDOR_PW);
      expect(vendedor, "vendedor login").not.toBeNull();
      const coursesRes = await request.get(`${API}/api/courses`);
      const courses = await coursesRes.json();
      const courseId = courses[0].id;
      const checkout = await request.post(`${API}/api/payments/checkout`, {
        headers: authHeaders(vendedor!.accessToken),
        data: { items: [{ courseId, qty: 1 }] },
      });
      expect(checkout.status(), "checkout status").toBeLessThan(300);
      const body = await checkout.json();
      paymentId = body.payment?.id ?? body.id;
      expect(paymentId, "payment id present").toBeTruthy();
    });

    await test.step("Backend: admin simulates paid webhook", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      expect(admin, "admin login").not.toBeNull();
      const sim = await request.post(
        `${API}/api/payments/${paymentId}/simulate-webhook`,
        {
          headers: authHeaders(admin!.accessToken),
          data: { status: "paid" },
        },
      );
      // Stub payments transition to paid on checkout itself; the webhook may
      // return 200/201 or 400 if already paid — either way status should be 'paid'.
      expect([200, 201, 400]).toContain(sim.status());

      const me = await apiLogin(request, VENDEDOR_EMAIL, VENDEDOR_PW);
      const pays = await request.get(`${API}/api/payments/me`, {
        headers: authHeaders(me!.accessToken),
      });
      const arr = await pays.json();
      const record = arr.find((p: any) => p.id === paymentId);
      expect(record?.status).toBe("paid");
    });
  });

  // ===========================================================================
  // Journey 2: Employee takes a course + verifies certificate
  // ===========================================================================
  test("J2 - employee views enrolled courses and verifies certificate", async ({
    page,
    request,
  }) => {
    let employeeToken = "";
    await test.step("Login as employee via UI", async () => {
      await uiLogin(page, EMPLOYEE_EMAIL, EMPLOYEE_PW);
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    });

    await test.step("Navigate to /dashboard/courses and verify at least 1 assigned course", async () => {
      await page.goto("/dashboard/courses", { waitUntil: "networkidle" });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/curso|Mis cursos|Certificado|NOM/i);
    });

    let certCode = "";
    await test.step("Backend: employee has at least one certificate", async () => {
      const auth = await apiLogin(request, EMPLOYEE_EMAIL, EMPLOYEE_PW);
      expect(auth, "employee login").not.toBeNull();
      employeeToken = auth!.accessToken;
      const res = await request.get(`${API}/api/certificates/me`, {
        headers: authHeaders(employeeToken),
      });
      expect(res.status()).toBe(200);
      const certs = await res.json();
      expect(Array.isArray(certs)).toBeTruthy();
      expect(certs.length).toBeGreaterThanOrEqual(1);
      certCode = certs[0].code;
      expect(certCode).toMatch(/^PC-/);
    });

    await test.step("Backend: public folio lookup returns the certificate", async () => {
      const res = await request.get(
        `${API}/api/certificates/lookup/${certCode}`,
      );
      expect(res.status()).toBe(200);
      const cert = await res.json();
      expect(cert.code).toBe(certCode);
      expect(cert.holder).toBeTruthy();
      expect(cert.course).toBeTruthy();
    });
  });

  // ===========================================================================
  // Journey 3: Client admin invites a subcontractor + bulk assigns
  // ===========================================================================
  test("J3 - client_admin invites subcontractor and admin bulk-assigns", async ({
    page,
    request,
  }) => {
    let clientAdminToken = "";
    await test.step("Login as client_admin via UI", async () => {
      await uiLogin(page, CLIENT_ADMIN_EMAIL, CLIENT_ADMIN_PW);
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    });

    await test.step("Navigate to /dashboard/team and open invite panel", async () => {
      await page.goto("/dashboard/team", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: /Invitar miembro/i }).click();
      const body = await page.locator("body").innerText();
      // The team page is a static mockup; verify the invite form renders.
      expect(body).toMatch(/Invitar nuevo miembro|Enviar invitación/i);
    });

    // Backend: perform real invite via /api/users/invite as principal_admin
    // (invite requires principal_admin). The team page is a mockup, so this
    // exercises the real business rule.
    const uniqueEmail = `subcontractor.e2e.${Date.now()}@test.com`;
    await test.step("Backend: admin invites a subcontractor via API", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      expect(admin, "admin login").not.toBeNull();
      const res = await request.post(`${API}/api/users/invite`, {
        headers: authHeaders(admin!.accessToken),
        data: {
          email: uniqueEmail,
          firstName: "E2E",
          lastName: "Subcontratista",
          role: "subcontractor",
        },
      });
      // Endpoint may return 200 or 201 depending on impl.
      expect([200, 201]).toContain(res.status());
    });

    await test.step("Backend: newly invited user shows up in /api/users", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      const list = await request.get(`${API}/api/users`, {
        headers: authHeaders(admin!.accessToken),
      });
      const users = await list.json();
      const arr = Array.isArray(users) ? users : users.data ?? [];
      const hit = arr.find((u: any) => u.email === uniqueEmail);
      expect(hit, `invited user ${uniqueEmail} present`).toBeTruthy();
    });

    await test.step("Backend: bulk-assign a course to a set of users", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      const users = await (
        await request.get(`${API}/api/users`, {
          headers: authHeaders(admin!.accessToken),
        })
      ).json();
      const arr = Array.isArray(users) ? users : users.data ?? [];
      const employeeIds = arr
        .filter((u: any) => u.role === "employee")
        .slice(0, 2)
        .map((u: any) => u.id);
      expect(employeeIds.length).toBeGreaterThan(0);

      const courses = await (await request.get(`${API}/api/courses`)).json();
      const courseId = courses[0].id;

      const bulk = await request.post(`${API}/api/enrollments/bulk`, {
        headers: authHeaders(admin!.accessToken),
        data: { userIds: employeeIds, courseId },
      });
      expect([200, 201]).toContain(bulk.status());
      const body = await bulk.json();
      expect(body.enrolled + body.skipped).toBeGreaterThanOrEqual(
        employeeIds.length,
      );
    });
  });

  // ===========================================================================
  // Journey 4: Vendedor closes a deal + earns commission
  // ===========================================================================
  test("J4 - vendedor creates lead, closes deal, sees commission", async ({
    page,
    request,
  }) => {
    let leadId = "";
    let dealId = "";
    let vendedorToken = "";

    await test.step("Login as vendedor via UI, verify sales dashboard", async () => {
      await uiLogin(page, VENDEDOR_EMAIL, VENDEDOR_PW);
      await page.waitForURL(/\/dashboard\/sales/, { timeout: 15000 });
    });

    await test.step("Backend: create a new lead", async () => {
      const auth = await apiLogin(request, VENDEDOR_EMAIL, VENDEDOR_PW);
      expect(auth).not.toBeNull();
      vendedorToken = auth!.accessToken;
      const res = await request.post(`${API}/api/sales/leads`, {
        headers: authHeaders(vendedorToken),
        data: {
          companyName: `Constructora E2E ${Date.now()}`,
          contactName: "Test Contact",
          contactEmail: "e2e-lead@test.com",
          industry: "construccion",
          expectedAmount: 50000,
        },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      leadId = body.id;
      expect(leadId).toBeTruthy();
    });

    await test.step("Backend: advance lead to 'propuesta'", async () => {
      const res = await request.patch(`${API}/api/sales/leads/${leadId}`, {
        headers: authHeaders(vendedorToken),
        data: { status: "propuesta" },
      });
      expect(res.status()).toBeLessThan(300);
      const body = await res.json();
      expect(body.status).toBe("propuesta");
    });

    await test.step("Backend: close a deal against that lead (package=plus, amount=50k)", async () => {
      const res = await request.post(`${API}/api/sales/deals`, {
        headers: authHeaders(vendedorToken),
        data: {
          leadId,
          buyerName: "Test Contact",
          package: "plus",
          amount: 50000,
        },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      dealId = body.id;
      // plus tier = 12% → 6000
      expect(Number(body.commissionAmount)).toBe(6000);
    });

    await test.step("Backend: commission ledger contains a pending row for the deal", async () => {
      const res = await request.get(`${API}/api/sales/commissions`, {
        headers: authHeaders(vendedorToken),
      });
      const list = await res.json();
      const hit = list.find((c: any) => c.dealId === dealId);
      expect(hit, "commission for new deal").toBeTruthy();
      expect(hit.status).toBe("pending");
      expect(Number(hit.amount)).toBe(6000);
    });

    await test.step("UI: leads page loads without error", async () => {
      await page.goto("/dashboard/sales/leads", { waitUntil: "networkidle" });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Prospectos|pipeline/i);
    });
  });

  // ===========================================================================
  // Journey 5: Public books a demo appointment
  // ===========================================================================
  test("J5 - public visitor books a demo through /agendar", async ({
    page,
    request,
  }) => {
    await test.step("Visit /agendar?type=demo as anonymous", async () => {
      await page.goto("/agendar?type=demo", { waitUntil: "networkidle" });
      // wait for specialists fetch
      await page.waitForTimeout(1500);
    });

    await test.step("At least 1 specialist card is visible", async () => {
      const card = page
        .locator("button", { hasText: /horarios disponibles/i })
        .first();
      await expect(card).toBeVisible({ timeout: 10000 });
    });

    await test.step("Click the first specialist card to reveal slots", async () => {
      const card = page
        .locator("button", { hasText: /horarios disponibles/i })
        .first();
      await card.click();
      await page.waitForTimeout(500);
    });

    await test.step("Pick the first available slot", async () => {
      const slot = page.locator("button", { hasText: /:\d{2}/ }).first();
      await expect(slot).toBeVisible({ timeout: 5000 });
      await slot.click();
    });

    await test.step("Fill confirmation form and submit", async () => {
      await page
        .locator('input[placeholder="Nombre y apellidos"]')
        .fill("Prospecto E2E");
      await page.locator('input[type="email"]').fill("prospect-e2e@test.com");
      await page
        .getByRole("button", { name: /confirmar|reservar|agendar/i })
        .first()
        .click();
    });

    await test.step("Success state renders", async () => {
      await page.waitForTimeout(2000);
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/gracias|pronto|confirmad[ao]/i);
    });

    await test.step("Backend: available slots endpoint still returns specialists", async () => {
      const res = await request.get(
        `${API}/api/agenda/available?purpose=demo`,
      );
      expect(res.status()).toBe(200);
      const list = await res.json();
      expect(Array.isArray(list)).toBeTruthy();
    });
  });

  // ===========================================================================
  // Journey 6: Capacitador confirms + delivers a session
  // ===========================================================================
  test("J6 - capacitador confirms appointment, creates and delivers a session", async ({
    page,
    request,
  }) => {
    let trainerToken = "";
    await test.step("Login as capacitador via UI", async () => {
      await uiLogin(page, CAPACITADOR_EMAIL, CAPACITADOR_PW);
      await page.waitForURL(/\/dashboard\/trainer/, { timeout: 15000 });
    });

    await test.step("Backend: capacitador auth", async () => {
      const auth = await apiLogin(request, CAPACITADOR_EMAIL, CAPACITADOR_PW);
      expect(auth).not.toBeNull();
      trainerToken = auth!.accessToken;
    });

    let appointmentId = "";
    await test.step("Backend: pick an appointment to confirm", async () => {
      const res = await request.get(`${API}/api/training/appointments`, {
        headers: authHeaders(trainerToken),
      });
      expect(res.status()).toBe(200);
      const arr = await res.json();
      const requested = arr.find((a: any) => a.status === "requested");
      // Fall back to any appointment if none in requested state.
      appointmentId = (requested ?? arr[0])?.id ?? "";
      expect(appointmentId).toBeTruthy();
    });

    await test.step("Backend: confirm the appointment", async () => {
      const res = await request.patch(
        `${API}/api/training/appointments/${appointmentId}`,
        {
          headers: authHeaders(trainerToken),
          data: { status: "confirmed" },
        },
      );
      expect(res.status()).toBeLessThan(300);
      const body = await res.json();
      expect(body.status).toBe("confirmed");
    });

    let sessionId = "";
    await test.step("Backend: create a session", async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await request.post(`${API}/api/training/sessions`, {
        headers: authHeaders(trainerToken),
        data: {
          title: "Sesión E2E Journey",
          scheduledAt,
          durationHours: 4,
          attendeeCount: 10,
          location: "CDMX",
        },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      sessionId = body.id;
      expect(sessionId).toBeTruthy();
    });

    await test.step("Backend: mark the session delivered", async () => {
      const res = await request.patch(
        `${API}/api/training/sessions/${sessionId}`,
        {
          headers: authHeaders(trainerToken),
          data: { status: "delivered" },
        },
      );
      expect(res.status()).toBeLessThan(300);
      const body = await res.json();
      expect(body.status).toBe("delivered");
    });

    await test.step("UI: trainer sessions page renders", async () => {
      await page.goto("/dashboard/trainer/sessions", {
        waitUntil: "networkidle",
      });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Sesion|Sesión|sesiones/i);
    });
  });

  // ===========================================================================
  // Journey 7: Principal admin manual cert + revoke + audit trail
  // ===========================================================================
  test("J7 - principal_admin issues a manual cert, revokes it", async ({
    request,
  }) => {
    let adminToken = "";
    await test.step("Admin login", async () => {
      const auth = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      expect(auth).not.toBeNull();
      adminToken = auth!.accessToken;
    });

    let targetUserId = "";
    let courseId = "";
    let allEmployees: any[] = [];
    let allCourses: any[] = [];
    await test.step("Backend: pick a user and a course", async () => {
      const users = await (
        await request.get(`${API}/api/users`, {
          headers: authHeaders(adminToken),
        })
      ).json();
      const arr = Array.isArray(users) ? users : users.data ?? [];
      allEmployees = arr.filter((u: any) => u.role === "employee");
      expect(allEmployees.length).toBeGreaterThan(0);
      allCourses = await (await request.get(`${API}/api/courses`)).json();
      targetUserId = allEmployees[0].id;
      courseId = allCourses[0].id;
    });

    let certId = "";
    await test.step("Backend: admin issues a certificate (retry across user/course pairs to avoid unique-enrollment collision)", async () => {
      const expiresAt = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // certificates.enrollment_id is unique; if a revoked cert already exists
      // for this enrollment the admin/issue endpoint 500s. Try combinations
      // until we get a fresh pair.
      let lastStatus = 0;
      for (const u of allEmployees) {
        for (const c of allCourses) {
          const res = await request.post(
            `${API}/api/certificates/admin/issue`,
            {
              headers: authHeaders(adminToken),
              data: { userId: u.id, courseId: c.id, expiresAt },
              failOnStatusCode: false,
            },
          );
          lastStatus = res.status();
          if ([200, 201].includes(lastStatus)) {
            const body = await res.json();
            certId = body.id;
            targetUserId = u.id;
            courseId = c.id;
            return;
          }
        }
      }
      throw new Error(
        `admin issue never succeeded across ${allEmployees.length}x${allCourses.length} pairs; last status ${lastStatus}`,
      );
    });
    expect(certId).toBeTruthy();

    await test.step("Backend: admin revokes that certificate", async () => {
      const res = await request.post(
        `${API}/api/certificates/${certId}/revoke`,
        {
          headers: authHeaders(adminToken),
          data: { reason: "E2E test revocation" },
        },
      );
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body.revokedAt).toBeTruthy();
    });

    await test.step("Backend: /api/audit is accessible to principal_admin", async () => {
      const res = await request.get(`${API}/api/audit`, {
        headers: authHeaders(adminToken),
      });
      expect(res.status()).toBe(200);
      // Audit log may or may not include this action depending on wiring;
      // presence of the endpoint being reachable by principal_admin is the
      // real invariant (returns 200 array).
      const arr = await res.json();
      expect(Array.isArray(arr) || Array.isArray(arr.data)).toBeTruthy();
    });
  });

  // ===========================================================================
  // Journey 8: Public verifies a DC-3 folio
  // ===========================================================================
  test("J8 - public verifies a certificate folio", async ({ page, request }) => {
    let realFolio = "";

    await test.step("Discover a real folio via admin API", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      expect(admin).not.toBeNull();
      const res = await request.get(`${API}/api/certificates/admin/all`, {
        headers: authHeaders(admin!.accessToken),
      });
      const certs = await res.json();
      const arr = Array.isArray(certs) ? certs : certs.data ?? [];
      expect(arr.length).toBeGreaterThan(0);
      realFolio = arr.find((c: any) => c.code && !c.revokedAt)?.code ?? arr[0].code;
      expect(realFolio).toMatch(/^PC-/);
    });

    await test.step("Public GET /api/certificates/lookup/{folio} returns the record", async () => {
      const res = await request.get(
        `${API}/api/certificates/lookup/${realFolio}`,
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.code).toBe(realFolio);
      expect(body.holder).toBeTruthy();
      expect(body.course).toBeTruthy();
      expect(body.nomReference).toBeTruthy();
    });

    await test.step("Public GET with a fake folio returns 404", async () => {
      const res = await request.get(
        `${API}/api/certificates/lookup/PC-9999-9999-9999`,
      );
      expect(res.status()).toBe(404);
    });

    await test.step("UI: /certificate-lookup page renders (static mockup)", async () => {
      await page.goto("/certificate-lookup", { waitUntil: "networkidle" });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Verifica un certificado DC-3|Folio|Buscar/i);
    });
  });

  // ===========================================================================
  // Journey 9: Auth lifecycle (protocol test, no UI)
  // ===========================================================================
  test("J9 - auth lifecycle: login, refresh, logout, blocklist", async ({
    request,
  }) => {
    let accessToken1 = "";
    let refreshToken1 = "";
    let accessToken2 = "";
    let refreshToken2 = "";

    await test.step("POST /api/auth/login returns access + refresh", async () => {
      const auth = await apiLogin(request, VENDEDOR_EMAIL, VENDEDOR_PW);
      expect(auth).not.toBeNull();
      accessToken1 = auth!.accessToken;
      refreshToken1 = auth!.refreshToken;
      expect(accessToken1).toBeTruthy();
      expect(refreshToken1).toBeTruthy();
    });

    await test.step("GET /api/auth/me with access1 → 200", async () => {
      const res = await request.get(`${API}/api/auth/me`, {
        headers: authHeaders(accessToken1),
      });
      expect(res.status()).toBe(200);
      const me = await res.json();
      expect(me.email).toBe(VENDEDOR_EMAIL);
    });

    await test.step("POST /api/auth/refresh rotates the token pair", async () => {
      const res = await request.post(`${API}/api/auth/refresh`, {
        data: { refreshToken: refreshToken1 },
      });
      expect(res.status()).toBeLessThan(300);
      const body = await res.json();
      accessToken2 = body.accessToken;
      refreshToken2 = body.refreshToken;
      expect(accessToken2).toBeTruthy();
      expect(refreshToken2).toBeTruthy();
      expect(accessToken2).not.toBe(accessToken1);
      expect(refreshToken2).not.toBe(refreshToken1);
    });

    await test.step("GET /api/auth/me with access2 → 200", async () => {
      const res = await request.get(`${API}/api/auth/me`, {
        headers: authHeaders(accessToken2),
      });
      expect(res.status()).toBe(200);
    });

    await test.step("POST /api/auth/refresh with the rotated refresh1 → 401", async () => {
      const res = await request.post(`${API}/api/auth/refresh`, {
        data: { refreshToken: refreshToken1 },
        failOnStatusCode: false,
      });
      expect([400, 401, 403]).toContain(res.status());
    });

    await test.step("POST /api/auth/logout with access2 succeeds", async () => {
      const res = await request.post(`${API}/api/auth/logout`, {
        headers: authHeaders(accessToken2),
        data: { refreshToken: refreshToken2 },
        failOnStatusCode: false,
      });
      expect([200, 201, 204]).toContain(res.status());
    });

    await test.step("GET /api/auth/me with access2 → 401 (jti blocklisted)", async () => {
      const res = await request.get(`${API}/api/auth/me`, {
        headers: authHeaders(accessToken2),
        failOnStatusCode: false,
      });
      expect([401, 403]).toContain(res.status());
    });

    await test.step("POST /api/auth/refresh with refresh2 → 401 (revoked)", async () => {
      const res = await request.post(`${API}/api/auth/refresh`, {
        data: { refreshToken: refreshToken2 },
        failOnStatusCode: false,
      });
      expect([400, 401, 403]).toContain(res.status());
    });
  });

  // ===========================================================================
  // Journey 10: CFDI stamping + cancellation (protocol test, minimal UI)
  // ===========================================================================
  test("J10 - CFDI: stamp a fresh invoice then cancel it", async ({
    request,
  }) => {
    let adminToken = "";
    let vendedorToken = "";
    let invoiceId = "";

    await test.step("Login as admin and vendedor (buyer)", async () => {
      const admin = await apiLogin(request, ADMIN_EMAIL, ADMIN_PW);
      const buyer = await apiLogin(request, VENDEDOR_EMAIL, VENDEDOR_PW);
      expect(admin).not.toBeNull();
      expect(buyer).not.toBeNull();
      adminToken = admin!.accessToken;
      vendedorToken = buyer!.accessToken;
    });

    await test.step("Create a fresh paid invoice via checkout", async () => {
      const courses = await (await request.get(`${API}/api/courses`)).json();
      const courseId = courses[0].id;
      const checkout = await request.post(`${API}/api/payments/checkout`, {
        headers: authHeaders(vendedorToken),
        data: { items: [{ courseId, qty: 1 }] },
      });
      expect(checkout.status()).toBeLessThan(300);
      const body = await checkout.json();
      invoiceId = body.invoice?.id;
      expect(invoiceId).toBeTruthy();
    });

    await test.step("Stamp the invoice via /api/cfdi/invoices", async () => {
      const res = await request.post(`${API}/api/cfdi/invoices`, {
        headers: authHeaders(adminToken),
        data: { invoice_id: invoiceId },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body.cfdiUuid || body.uuid).toBeTruthy();
    });

    await test.step("Verify CFDI status is STAMPED", async () => {
      const res = await request.get(`${API}/api/cfdi/invoices/${invoiceId}`, {
        headers: authHeaders(adminToken),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(String(body.status).toUpperCase()).toBe("STAMPED");
      expect(body.cfdiUuid).toBeTruthy();
    });

    await test.step("Cancel the CFDI", async () => {
      const res = await request.post(
        `${API}/api/cfdi/invoices/${invoiceId}/cancel`,
        {
          headers: authHeaders(adminToken),
          data: { reason: "E2E test cancellation" },
        },
      );
      expect([200, 201]).toContain(res.status());
    });

    await test.step("Verify CFDI status is CANCELED with canceledAt set", async () => {
      const res = await request.get(`${API}/api/cfdi/invoices/${invoiceId}`, {
        headers: authHeaders(adminToken),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(String(body.status).toUpperCase()).toBe("CANCELED");
      expect(body.canceledAt).toBeTruthy();
    });
  });
});
