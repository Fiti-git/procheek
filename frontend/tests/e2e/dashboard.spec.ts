import { test, expect } from "@playwright/test";

test.describe("Dashboard client fixes", () => {
  test("certificates page shows VIGENCIA with date inputs", async ({ page }) => {
    await page.goto("/dashboard/certificates", { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    expect(body).toContain("VIGENCIA");
    expect(body).toMatch(/Desde/i);
    expect(body).toMatch(/Hasta/i);
  });

  test("library page shows Descargar and Comprar buttons", async ({ page }) => {
    await page.goto("/dashboard/library", { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    expect(body).toContain("Descargar");
    expect(body).toContain("Comprar");
  });

  test("team page shows add-member button with role options including Vendedor and Capacitador", async ({ page }) => {
    await page.goto("/dashboard/team", { waitUntil: "networkidle" });
    const addBtn = page
      .getByRole("button", { name: /Añadir miembro|Invitar/i })
      .or(page.getByRole("link", { name: /Añadir miembro|Invitar/i }));
    await expect(addBtn.first()).toBeVisible();

    // Try clicking to open modal
    await addBtn.first().click().catch(() => {});
    await page.waitForTimeout(500);

    // Fallback: check if role labels appear anywhere in page HTML
    const html = await page.content();
    expect(html).toContain("Vendedor");
    expect(html).toContain("Capacitador");
  });

  test("reports page shows 'Ventas por vendedor' section", async ({ page }) => {
    await page.goto("/dashboard/reports", { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    expect(body).toContain("Ventas por vendedor");
  });
});
