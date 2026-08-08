import { test, expect } from "@playwright/test";

test.describe("Certificate lookup (public DC-3 verification)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/certificate-lookup", { waitUntil: "networkidle" });
  });

  test("search input with folio placeholder exists", async ({ page }) => {
    const input = page.locator("input[placeholder*='folio' i], input[placeholder*='Folio']").first();
    await expect(input).toBeVisible();
  });

  test("search button exists", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Verificar|Buscar|Consultar/i }).first();
    await expect(btn).toBeVisible();
  });

  test("result stub card shows key fields", async ({ page }) => {
    // The result stub uses a mix of full labels ("Titular", "Curso") and
    // the DC3Card component ("Trabajador"). Check rendered HTML rather than
    // innerText so we catch labels that are technically off-screen but
    // present in the DOM (some render below the initial viewport).
    const html = await page.content();
    for (const field of ["Folio", "Curso", "NOM-009"]) {
      expect(html).toContain(field);
    }
    // Holder label is either "Titular" (result view) or "Trabajador" (DC3Card).
    const hasHolderLabel =
      html.includes("Titular") || html.includes("Trabajador");
    expect(hasHolderLabel).toBeTruthy();
  });

  test("STPS trust footer appears", async ({ page }) => {
    const body = await page.locator("body").innerText();
    expect(body).toContain("STPS");
    const hasAce = body.includes("Agente Capacitador") || body.includes("ACE-2025");
    expect(hasAce).toBeTruthy();
  });
});
