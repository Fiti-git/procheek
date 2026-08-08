import { test } from "@playwright/test";

const routes = ["/", "/courses", "/consulting", "/software", "/certificate-lookup", "/cart", "/login"];

for (const route of routes) {
  test(`screenshot ${route}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route, { waitUntil: "networkidle" });
    const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
    const buffer = await page.screenshot({ fullPage: true });
    await testInfo.attach(`${name}.png`, { body: buffer, contentType: "image/png" });
  });
}
