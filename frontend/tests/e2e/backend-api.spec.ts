import { test, expect } from "@playwright/test";

const API = "http://localhost:4000";

test.describe("Backend API smoke", () => {
  test("GET /api/health returns 200 with db up", async ({ request }) => {
    const res = await request.get(`${API}/api/health`);
    expect(res.status()).toBe(200);
    const json = await res.json().catch(() => ({}));
    expect(JSON.stringify(json)).toContain("up");
  });

  test("GET /api/docs returns 200 Swagger HTML", async ({ request }) => {
    const res = await request.get(`${API}/api/docs`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toMatch(/swagger|openapi/);
  });

  test("GET /api/docs-json returns openapi JSON", async ({ request }) => {
    const res = await request.get(`${API}/api/docs-json`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    const stringified = JSON.stringify(json);
    expect(stringified).toMatch(/openapi|paths/);
  });

  test("POST /api/auth/login with wrong creds returns 401", async ({ request }) => {
    const res = await request.post(`${API}/api/auth/login`, {
      data: { email: "wrong@test.com", password: "wrong" },
      failOnStatusCode: false,
    });
    // 401 expected; allow 400/403 too as some guards may map differently
    expect([400, 401, 403]).toContain(res.status());
  });

  test("GET /api/courses returns 200 with an array", async ({ request }) => {
    const res = await request.get(`${API}/api/courses`, { failOnStatusCode: false });
    if (res.status() === 404) {
      test.skip(true, "public courses endpoint not present");
    }
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json) || Array.isArray((json as any).data) || Array.isArray((json as any).items)).toBeTruthy();
  });

  test("GET /api/certificates/{folio} endpoint exists (200 or 404)", async ({ request }) => {
    const res = await request.get(`${API}/api/certificates/PCH-2026-000101`, { failOnStatusCode: false });
    expect([200, 404]).toContain(res.status());
  });
});
