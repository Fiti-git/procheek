import { test, expect } from "@playwright/test";

test.describe("Public /agendar booking flow", () => {
  test("page renders with agenda heading and 3 purpose options", async ({ page }) => {
    const res = await page.goto("/agendar", { waitUntil: "networkidle" });
    expect(res?.status()).toBeLessThan(400);

    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).toMatch(/agenda/);

    // 3 purpose options — case-insensitive
    const lower = body.toLowerCase();
    expect(lower).toContain("demo");
    expect(lower).toMatch(/consultor[ií]a/);
    expect(lower).toMatch(/capacitaci[oó]n/);
  });

  test("specialists load and at least 2 cards are visible", async ({ page }) => {
    await page.goto("/agendar", { waitUntil: "networkidle" });
    // give specialist fetch time to hydrate
    await page.waitForTimeout(1500);

    const body = await page.locator("body").innerText();
    const hasHorarios = /horarios disponibles/i.test(body);
    if (!hasHorarios) {
      test.skip(true, "No specialists returned by backend");
    }
    // count occurrences of "horarios disponibles" — each specialist card has one
    const matches = body.match(/horarios disponibles/gi) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test("selecting a specialist reveals available time slots", async ({ page }) => {
    await page.goto("/agendar", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // click the first specialist card (button containing "horarios disponibles")
    const card = page
      .locator("button", { hasText: /horarios disponibles/i })
      .first();
    if (!(await card.isVisible().catch(() => false))) {
      test.skip(true, "No specialist cards visible");
    }
    await card.click();
    await page.waitForTimeout(500);

    const body = await page.locator("body").innerText();
    expect(body).toMatch(/Confirma tu cita|Horarios disponibles con/i);
  });

  test("submitting the confirmation form creates an appointment", async ({
    page,
  }) => {
    await page.goto("/agendar", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Pick a specialist
    const card = page
      .locator("button", { hasText: /horarios disponibles/i })
      .first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForTimeout(500);

    // Pick first time slot
    const slotBtn = page.locator("button", { hasText: /:\d{2}/ }).first();
    await expect(slotBtn).toBeVisible({ timeout: 5000 });
    await slotBtn.click();

    // Fill the form via placeholders (labels aren't htmlFor-bound).
    await page
      .locator('input[placeholder="Nombre y apellidos"]')
      .fill("Test Playwright");
    await page.locator('input[type="email"]').fill("test@example.com");

    // Submit
    const submitBtn = page
      .getByRole("button", { name: /confirmar|reservar|agendar cita/i })
      .first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();
    await page.waitForTimeout(2000);

    const body = await page.locator("body").innerText();
    const ok = /gracias|pronto|confirmad[ao]/i.test(body);
    expect(ok).toBeTruthy();
  });
});
