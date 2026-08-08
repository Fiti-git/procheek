import { test, expect } from "@playwright/test";

test.describe("Role-aware login redirect", () => {
  test("login page shows demo accounts panel", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    // At least 2 seeded demo emails should be listed
    const emails = [
      "ale.ibarra@procheck.mx",
      "mauricio.herrera@procheck.mx",
      "renata.solis@procheck.mx",
      "fernando.reyes@procheck.mx",
      "paola.guzman@procheck.mx",
    ];
    const present = emails.filter((e) => body.includes(e)).length;
    expect(present, "at least 2 demo emails visible").toBeGreaterThanOrEqual(2);
  });

  test("vendedor login redirects to /dashboard/sales", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    // Step 1: fill email, click Continuar to reveal password
    await page.locator('input[type="email"]').fill("ale.ibarra@procheck.mx");
    await page
      .getByRole("button", { name: /Continuar|Ingresar|Iniciar/i })
      .first()
      .click();

    // Step 2: fill password, click Continuar to submit
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });
    await passwordInput.fill("demo1234");
    await page
      .getByRole("button", { name: /Continuar|Ingresar|Iniciar/i })
      .first()
      .click();

    // Wait for the client-side redirect after login().
    await page.waitForURL(/\/dashboard\/sales/, { timeout: 15000 });
    expect(page.url()).toContain("/dashboard/sales");
  });
});
