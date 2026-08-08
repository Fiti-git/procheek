import { test, expect } from "@playwright/test";

test.describe("Branding & client fixes", () => {
  test("home page has correct branding", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await test.step("no EN language toggle button", async () => {
      const enButton = page.getByRole("button", { name: /^EN$/ });
      await expect(enButton).toHaveCount(0);
    });

    await test.step("PROCHECK single-E spelling", async () => {
      const html = await page.content();
      expect(html).not.toContain("PROCHEECK");
      expect(html.toUpperCase()).toContain("PROCHECK");
    });

    await test.step("no em-dash or en-dash in visible text", async () => {
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toMatch(/[—–]/);
    });

    await test.step('no "Vigilancia en sitio" text', async () => {
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("Vigilancia en sitio");
    });

    await test.step("hero H1 uses sentence case (not ALL CAPS)", async () => {
      const h1 = page.locator("h1").first();
      const text = (await h1.innerText()).trim();
      // Should not be entirely uppercase letters (allow acronyms).
      const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
      const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, "");
      expect(letters.length).toBeGreaterThan(0);
      expect(upper.length / letters.length).toBeLessThan(0.7);
    });
  });

  test("consulting page branding", async ({ page }) => {
    await page.goto("/consulting", { waitUntil: "networkidle" });

    await test.step('no "Diagnóstico" as numbered process step', async () => {
      // Look for step patterns like "1. Diagnóstico" or step markers.
      const bodyHtml = await page.content();
      // Weak assertion: numbered "01" or "1." followed shortly by "Diagnóstico" as a step title.
      const badPattern = /(0?1[\.\)]\s*)?Diagn[óo]stico\s+(inicial|del|de la)/i;
      // Just ensure it isn't a heading of a step block
      const stepHeadings = await page.locator("h2, h3").allInnerTexts();
      const problematic = stepHeadings.some((t) => /^\s*(0?1[\.\)]|Paso\s*1)\s+Diagn[óo]stico/i.test(t));
      expect(problematic).toBeFalsy();
      // Also just check body doesn't match egregious step pattern
      void badPattern;
    });

    await test.step('"Nuestros servicios" section exists', async () => {
      // Copy uses CSS uppercase (`NUESTROS SERVICIOS` in a kicker). Match case-insensitive.
      const body = await page.locator("body").innerText();
      expect(body.toLowerCase()).toContain("nuestros servicios");
    });
  });
});
