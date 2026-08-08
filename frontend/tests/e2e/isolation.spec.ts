import { test, expect } from "@playwright/test";

const API = "http://localhost:4000";

/**
 * Multi-tenant isolation test suite for PROCHECK Safety.
 *
 * Discovered seeded users (via `SELECT email, role_code FROM users`):
 *   Vendedores       : ale.ibarra@procheck.mx, mauricio.herrera@procheck.mx, renata.solis@procheck.mx  (demo1234)
 *   Capacitadores    : fernando.reyes@procheck.mx, paola.guzman@procheck.mx                            (demo1234)
 *   Principal admin  : admin@procheeck.mx                                                              (password123)
 *   Employees        : employee@procheeck.mx, nueva.persona@procheck.mx, nuevo.empleado@procheck.mx,
 *                      backend.test@procheeck.mx                                                       (password123)
 *   Client           : client@procheeck.mx                                                             (password123)
 *   Client admin     : client-admin@procheeck.mx                                                       (password123)
 *   Subcontractor    : sub@procheeck.mx                                                                (password123)
 *
 * Backend note: There is no `GET /sales/leads/:id` route. Isolation for individual leads
 * is verified via PATCH and DELETE (which do exist and are the only mutation vectors).
 */

async function login(request: any, email: string, password: string): Promise<{ token: string; userId?: string; role?: string }> {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email, password },
    failOnStatusCode: false,
  });
  const json = (await res.json().catch(() => ({}))) as any;
  const token = json.accessToken || json.token || "";
  return { token, userId: json.user?.id, role: json.user?.role };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function fetchArr(request: any, url: string, token: string): Promise<any[]> {
  const res = await request.get(url, { headers: authHeaders(token), failOnStatusCode: false });
  if (res.status() !== 200) return [];
  const data = await res.json().catch(() => ([]));
  return Array.isArray(data) ? data : data.items || data.data || [];
}

const FORBIDDEN = [401, 403, 404];

test.describe("Multi-tenant isolation", () => {
  // ==========================================================================
  // Group 1: Vendedor isolation
  // ==========================================================================

  test("1. Vendedor A GET /sales/leads returns only own leads (disjoint from B)", async ({ request }) => {
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const mau = await login(request, "mauricio.herrera@procheck.mx", "demo1234");
    expect(ale.token).toBeTruthy();
    expect(mau.token).toBeTruthy();

    const aleLeads = await fetchArr(request, `${API}/api/sales/leads`, ale.token);
    const mauLeads = await fetchArr(request, `${API}/api/sales/leads`, mau.token);

    // Every returned lead must belong to the querying vendedor
    for (const lead of aleLeads) {
      expect(lead.vendedorId || lead.vendedor_id).toBe(ale.userId);
    }
    for (const lead of mauLeads) {
      expect(lead.vendedorId || lead.vendedor_id).toBe(mau.userId);
    }
    // Disjoint sets (no ids overlap)
    const aleIds = new Set(aleLeads.map((l: any) => l.id));
    for (const lead of mauLeads) {
      expect(aleIds.has(lead.id)).toBeFalsy();
    }
  });

  test("2. Vendedor A cannot access Vendedor B's lead via any id-based endpoint", async ({ request }) => {
    // No GET /sales/leads/:id exists — use PATCH as read-and-write probe (with no-op body).
    const mau = await login(request, "mauricio.herrera@procheck.mx", "demo1234");
    const ale = await login(request, "ale.ibarra@procheek.mx".replace("procheek", "procheck"), "demo1234");
    const mauLeads = await fetchArr(request, `${API}/api/sales/leads`, mau.token);
    if (mauLeads.length === 0) {
      console.log("[iso#2] no mauricio leads seeded; skipping id probe");
      return;
    }
    const target = mauLeads[0];
    const res = await request.patch(`${API}/api/sales/leads/${target.id}`, {
      headers: authHeaders(ale.token),
      data: { notes: "iso-test-probe" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("3. Vendedor A cannot PATCH Vendedor B's lead status", async ({ request }) => {
    const mau = await login(request, "mauricio.herrera@procheck.mx", "demo1234");
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const mauLeads = await fetchArr(request, `${API}/api/sales/leads`, mau.token);
    if (mauLeads.length === 0) {
      console.log("[iso#3] no mauricio leads to attack");
      return;
    }
    const res = await request.patch(`${API}/api/sales/leads/${mauLeads[0].id}`, {
      headers: authHeaders(ale.token),
      data: { status: "cerrado_ganado" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("4. Vendedor A cannot DELETE Vendedor B's lead", async ({ request }) => {
    const mau = await login(request, "mauricio.herrera@procheck.mx", "demo1234");
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const mauLeadsBefore = await fetchArr(request, `${API}/api/sales/leads`, mau.token);
    if (mauLeadsBefore.length === 0) {
      console.log("[iso#4] no mauricio leads");
      return;
    }
    const targetId = mauLeadsBefore[0].id;
    const res = await request.delete(`${API}/api/sales/leads/${targetId}`, {
      headers: authHeaders(ale.token),
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
    // And still present on Mauricio's side
    const mauLeadsAfter = await fetchArr(request, `${API}/api/sales/leads`, mau.token);
    const stillThere = mauLeadsAfter.some((l: any) => l.id === targetId);
    expect(stillThere).toBeTruthy();
  });

  test("5. Vendedor A GET /sales/commissions returns only own", async ({ request }) => {
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const rows = await fetchArr(request, `${API}/api/sales/commissions`, ale.token);
    for (const row of rows) {
      expect(row.vendedorId || row.vendedor_id).toBe(ale.userId);
    }
  });

  // ==========================================================================
  // Group 2: Capacitador isolation
  // ==========================================================================

  test("6. Capacitador A GET /training/sessions returns only own", async ({ request }) => {
    const fer = await login(request, "fernando.reyes@procheck.mx", "demo1234");
    const pao = await login(request, "paola.guzman@procheck.mx", "demo1234");

    const ferSess = await fetchArr(request, `${API}/api/training/sessions`, fer.token);
    const paoSess = await fetchArr(request, `${API}/api/training/sessions`, pao.token);

    for (const s of ferSess) {
      const owner = s.trainerId || s.trainer_id || s.capacitadorId || s.capacitador_id;
      // Some sessions might not encode trainer on payload — fall back to disjoint check only.
      if (owner) expect(owner).toBe(fer.userId);
    }
    const ferIds = new Set(ferSess.map((s: any) => s.id));
    for (const s of paoSess) {
      expect(ferIds.has(s.id)).toBeFalsy();
    }
  });

  test("7. Capacitador A GET /training/appointments returns only own", async ({ request }) => {
    const fer = await login(request, "fernando.reyes@procheck.mx", "demo1234");
    const pao = await login(request, "paola.guzman@procheck.mx", "demo1234");

    const ferApps = await fetchArr(request, `${API}/api/training/appointments`, fer.token);
    const paoApps = await fetchArr(request, `${API}/api/training/appointments`, pao.token);

    for (const a of ferApps) {
      const assignee = a.assignedUserId || a.assigned_user_id;
      if (assignee) expect(assignee).toBe(fer.userId);
    }
    const ferIds = new Set(ferApps.map((a: any) => a.id));
    for (const a of paoApps) {
      expect(ferIds.has(a.id)).toBeFalsy();
    }
  });

  test("8. Capacitador A cannot PATCH Capacitador B's session", async ({ request }) => {
    const pao = await login(request, "paola.guzman@procheck.mx", "demo1234");
    const fer = await login(request, "fernando.reyes@procheck.mx", "demo1234");
    const paoSess = await fetchArr(request, `${API}/api/training/sessions`, pao.token);
    if (paoSess.length === 0) {
      console.log("[iso#8] no paola sessions to attack");
      return;
    }
    const res = await request.patch(`${API}/api/training/sessions/${paoSess[0].id}`, {
      headers: authHeaders(fer.token),
      data: { notes: "iso-probe" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  // ==========================================================================
  // Group 3: Role-based endpoint access
  // ==========================================================================

  test("9. Vendedor cannot POST /training/sessions (capacitador-only) → 403", async ({ request }) => {
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const res = await request.post(`${API}/api/training/sessions`, {
      headers: authHeaders(ale.token),
      data: { title: "iso-test", scheduled_at: new Date().toISOString() },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("10. Capacitador cannot POST /sales/leads (vendedor-only) → 403", async ({ request }) => {
    const fer = await login(request, "fernando.reyes@procheck.mx", "demo1234");
    const res = await request.post(`${API}/api/sales/leads`, {
      headers: authHeaders(fer.token),
      data: { companyName: "IsoTest", contactName: "X", packageTier: "basic" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("11. Vendedor cannot PATCH /sales/commissions/:id (admin-only) → 403", async ({ request }) => {
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const commissions = await fetchArr(request, `${API}/api/sales/commissions`, ale.token);
    // Use a real id if available; otherwise use a random valid uuid.
    const targetId = commissions[0]?.id || "00000000-0000-4000-8000-000000000000";
    const res = await request.patch(`${API}/api/sales/commissions/${targetId}`, {
      headers: authHeaders(ale.token),
      data: { status: "paid" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("12. Employee cannot GET /audit (admin-only) → 403", async ({ request }) => {
    const emp = await login(request, "employee@procheeck.mx", "password123");
    if (!emp.token) {
      console.log("[iso#12] employee login failed — trying alt");
      const alt = await login(request, "backend.test@procheeck.mx", "password123");
      const res = await request.get(`${API}/api/audit`, { headers: authHeaders(alt.token), failOnStatusCode: false });
      expect(FORBIDDEN).toContain(res.status());
      return;
    }
    const res = await request.get(`${API}/api/audit`, { headers: authHeaders(emp.token), failOnStatusCode: false });
    expect(FORBIDDEN).toContain(res.status());
  });

  test("13. Employee cannot POST /certificates/admin/issue (admin-only) → 403", async ({ request }) => {
    const emp = await login(request, "employee@procheeck.mx", "password123");
    const token = emp.token || (await login(request, "backend.test@procheeck.mx", "password123")).token;
    const res = await request.post(`${API}/api/certificates/admin/issue`, {
      headers: authHeaders(token),
      data: { userId: "00000000-0000-0000-0000-000000000000", courseId: "00000000-0000-0000-0000-000000000000" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  // ==========================================================================
  // Group 4: Public / anon access
  // ==========================================================================

  test("14. Anonymous cannot GET /users/me → 401", async ({ request }) => {
    const res = await request.get(`${API}/api/users/me`, { failOnStatusCode: false });
    expect([401, 403]).toContain(res.status());
  });

  test("15. Anonymous cannot GET /sales/leads → 401", async ({ request }) => {
    const res = await request.get(`${API}/api/sales/leads`, { failOnStatusCode: false });
    expect([401, 403]).toContain(res.status());
  });

  test("16. Anonymous CAN GET /courses (200)", async ({ request }) => {
    const res = await request.get(`${API}/api/courses`, { failOnStatusCode: false });
    expect(res.status()).toBe(200);
    const data = await res.json().catch(() => ([]));
    const arr = Array.isArray(data) ? data : data.items || data.data || [];
    expect(Array.isArray(arr)).toBeTruthy();
  });

  // ==========================================================================
  // Group 5: Cross-user isolation via ownership check
  // ==========================================================================

  test("17. User A GET /enrollments returns only own; /enrollments/me is JWT-scoped", async ({ request }) => {
    const emp = await login(request, "employee@procheeck.mx", "password123");
    if (!emp.token) {
      console.log("[iso#17] employee login failed — using alt");
    }
    const token = emp.token || (await login(request, "backend.test@procheeck.mx", "password123")).token;
    const res = await request.get(`${API}/api/enrollments/me`, { headers: authHeaders(token), failOnStatusCode: false });
    // Should be 200 with only own enrollments — or 403/401 if role gates apply
    expect([200, 401, 403]).toContain(res.status());
    if (res.status() === 200) {
      const data = await res.json().catch(() => ([]));
      const arr = Array.isArray(data) ? data : data.items || data.data || [];
      // Every enrollment must belong to the requesting user (if the shape exposes user_id)
      for (const e of arr) {
        const uid = e.userId || e.user_id;
        if (uid && emp.userId) expect(uid).toBe(emp.userId);
      }
    }
  });

  test("18. User A cannot PATCH User B's user record → 403/404", async ({ request }) => {
    // Vendedor Ale tries to modify Vendedor Mauricio.
    const ale = await login(request, "ale.ibarra@procheck.mx", "demo1234");
    const mau = await login(request, "mauricio.herrera@procheck.mx", "demo1234");
    if (!mau.userId) {
      console.log("[iso#18] cannot resolve mauricio userId; login shape lacked user.id");
      return;
    }
    const res = await request.patch(`${API}/api/users/${mau.userId}`, {
      headers: authHeaders(ale.token),
      data: { firstName: "Hacked" },
      failOnStatusCode: false,
    });
    expect(FORBIDDEN).toContain(res.status());
  });

  // ==========================================================================
  // Group 6: Public certificate verification
  // ==========================================================================

  test("19. Anonymous CAN verify a real certificate code (200)", async ({ request }) => {
    // Real code seeded: PC-3798-CA33-62F8
    const res = await request.get(`${API}/api/certificates/lookup/PC-3798-CA33-62F8`, {
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    const json = await res.json().catch(() => ({}));
    expect(json).toBeTruthy();
    // Should surface at least a code or folio-like field
    expect(JSON.stringify(json)).toMatch(/code|folio|user|course/i);
  });

  test("20. Verifying a non-existent code returns 404 (not 500)", async ({ request }) => {
    const res = await request.get(`${API}/api/certificates/lookup/PC-DEAD-BEEF-0000`, {
      failOnStatusCode: false,
    });
    expect([404, 400]).toContain(res.status());
  });
});
