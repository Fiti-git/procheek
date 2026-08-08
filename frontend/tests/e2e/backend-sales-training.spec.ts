import { test, expect } from "@playwright/test";

const API = "http://localhost:4000";

async function login(request: any, email: string, password: string) {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email, password },
    failOnStatusCode: false,
  });
  const raw = (await res.json().catch(() => ({}))) as any;
  // Backend returns `accessToken`; some paths may return `token`. Normalize.
  const token = raw.token || raw.accessToken;
  const json = { ...raw, token };
  return { status: res.status(), json };
}

test.describe("Backend sales + training API smoke", () => {
  test("GET /api/agenda/available?purpose=demo returns specialists array", async ({
    request,
  }) => {
    const res = await request.get(`${API}/api/agenda/available?purpose=demo`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBeTruthy();
    expect(json.length).toBeGreaterThanOrEqual(2);
    for (const item of json.slice(0, 2)) {
      expect(item).toHaveProperty("id");
      // API uses display_name; frontend maps it to name. Accept either.
      const hasName =
        "name" in item || "display_name" in item;
      expect(hasName).toBeTruthy();
      const hasSlots = "slots" in item || "available_slots" in item;
      expect(hasSlots).toBeTruthy();
    }
  });

  test("POST /api/agenda/appointments (public) creates appointment", async ({
    request,
  }) => {
    // Fetch a valid specialist + slot first
    const listRes = await request.get(
      `${API}/api/agenda/available?purpose=demo`,
    );
    const list = await listRes.json();
    const first = Array.isArray(list) ? list[0] : null;
    const slots: string[] = first?.slots || first?.available_slots || [];
    if (!first || slots.length === 0) {
      throw new Error("agenda returned no specialists or slots");
    }
    const specialist = first;
    const slot = slots[0];

    const res = await request.post(`${API}/api/agenda/appointments`, {
      data: {
        requester_kind: "public",
        requester_email: "e2e-test@example.com",
        requester_contact_name: "E2E Test",
        purpose: "demo",
        scheduled_at: slot,
        assigned_user_id: specialist.id,
      },
      failOnStatusCode: false,
    });
    expect([200, 201]).toContain(res.status());
    const json = await res.json().catch(() => ({}));
    // Should return the created row with some identifiable field
    expect(JSON.stringify(json)).toMatch(/id|scheduled_at|assigned/i);
  });

  test("POST /api/auth/login with ale.ibarra returns token + vendedor role", async ({
    request,
  }) => {
    const { status, json } = await login(
      request,
      "ale.ibarra@procheck.mx",
      "demo1234",
    );
    expect([200, 201]).toContain(status);
    expect(json).toHaveProperty("token");
    expect(json.user?.role).toBe("vendedor");
  });

  test("GET /api/sales/leads returns Ale's leads (>=2)", async ({ request }) => {
    const { json } = await login(
      request,
      "ale.ibarra@procheck.mx",
      "demo1234",
    );
    const token = json.token;
    if (!token) test.skip(true, "login did not return a token");

    const res = await request.get(`${API}/api/sales/leads`, {
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.items || data.data || [];
    expect(Array.isArray(arr)).toBeTruthy();
    expect(arr.length).toBeGreaterThanOrEqual(2);
  });

  test("GET /api/sales/dashboard/summary returns expected keys", async ({
    request,
  }) => {
    const { json } = await login(
      request,
      "ale.ibarra@procheck.mx",
      "demo1234",
    );
    const token = json.token;
    if (!token) test.skip(true, "login did not return a token");

    const res = await request.get(`${API}/api/sales/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    const s = await res.json();
    for (const k of [
      "quota_mtd",
      "sold_mtd",
      "pipeline_value",
      "active_leads",
      "commission_pending",
    ]) {
      expect(s, `summary should have ${k}`).toHaveProperty(k);
    }
  });

  test("POST /api/sales/commissions/preview flat rule computes 10% of 1000 = 100", async ({
    request,
  }) => {
    const { json: auth } = await login(
      request,
      "ale.ibarra@procheck.mx",
      "demo1234",
    );
    const token = auth.token;
    if (!token) test.skip(true, "no auth token");

    const res = await request.post(`${API}/api/sales/commissions/preview`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        rule: { type: "flat", flat_pct: 10 },
        amount: 1000,
      },
      failOnStatusCode: false,
    });
    expect([200, 201]).toContain(res.status());
    const json = await res.json();
    expect(json.pct).toBe(10);
    expect(json.amount).toBe(100);
  });

  test("POST /api/sales/commissions/preview package_tier computes 12% of 5000 = 600", async ({
    request,
  }) => {
    const { json: auth } = await login(
      request,
      "ale.ibarra@procheck.mx",
      "demo1234",
    );
    const token = auth.token;
    if (!token) test.skip(true, "no auth token");

    const res = await request.post(`${API}/api/sales/commissions/preview`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        rule: {
          type: "package_tier",
          package_tiers: [{ package: "plus", pct: 12 }],
        },
        amount: 5000,
        package: "plus",
      },
      failOnStatusCode: false,
    });
    expect([200, 201]).toContain(res.status());
    const json = await res.json();
    expect(json.pct).toBe(12);
    expect(json.amount).toBe(600);
  });

  test("POST /api/auth/login with fernando.reyes returns capacitador role", async ({
    request,
  }) => {
    const { status, json } = await login(
      request,
      "fernando.reyes@procheck.mx",
      "demo1234",
    );
    expect([200, 201]).toContain(status);
    expect(json).toHaveProperty("token");
    expect(json.user?.role).toBe("capacitador");
  });

  test("GET /api/training/sessions returns an array", async ({ request }) => {
    const { json } = await login(
      request,
      "fernando.reyes@procheck.mx",
      "demo1234",
    );
    const token = json.token;
    if (!token) test.skip(true, "login did not return a token");

    const res = await request.get(`${API}/api/training/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.items || data.data || [];
    expect(Array.isArray(arr)).toBeTruthy();
  });

  test("GET /api/training/dashboard/summary returns expected keys", async ({
    request,
  }) => {
    const { json } = await login(
      request,
      "fernando.reyes@procheck.mx",
      "demo1234",
    );
    const token = json.token;
    if (!token) test.skip(true, "login did not return a token");

    const res = await request.get(`${API}/api/training/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
    const s = await res.json();
    for (const k of [
      "sessions_this_month",
      "hours_delivered",
      "upcoming_appointments",
      "avg_attendees",
    ]) {
      expect(s, `summary should have ${k}`).toHaveProperty(k);
    }
  });
});
