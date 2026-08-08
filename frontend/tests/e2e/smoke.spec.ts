import { test, expect } from "@playwright/test";

const routes: Array<{ path: string; expectAny: string[] }> = [
  { path: "/", expectAny: ["Capacita a tu equipo", "La forma moderna"] },
  { path: "/courses", expectAny: ["Catálogo de cursos"] },
  { path: "/consulting", expectAny: ["Consultoría", "cumplimiento total"] },
  { path: "/software", expectAny: ["plataforma", "gestión"] },
  { path: "/certificate-lookup", expectAny: ["Verifica un certificado"] },
  // Empty cart renders "Tu carrito"; populated cart also renders "Subtotal".
  { path: "/cart", expectAny: ["Tu carrito", "Carrito", "Subtotal"] },
  // Checkout requires auth + non-empty cart; anonymous with empty cart redirects to /cart.
  { path: "/checkout", expectAny: ["Datos de facturación", "Método de pago", "Tu carrito"] },
  { path: "/login", expectAny: ["Bienvenido de nuevo"] },
  { path: "/forgot-password", expectAny: ["Recuperar contraseña"] },
  { path: "/reset-password", expectAny: ["contraseña"] },
  { path: "/dashboard/courses", expectAny: ["Mis cursos"] },
  { path: "/dashboard/certificates", expectAny: ["Certificados"] },
  { path: "/dashboard/library", expectAny: ["Biblioteca"] },
  { path: "/dashboard/team", expectAny: ["Equipo"] },
  { path: "/dashboard/reports", expectAny: ["Reportes"] },
];

for (const route of routes) {
  test(`route ${route.path} loads and renders expected content`, async ({ page }) => {
    const response = await page.goto(route.path, { waitUntil: "networkidle" });
    expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);

    const body = await page.locator("body").innerText();
    const found = route.expectAny.some((s) => body.includes(s));
    expect(found, `expected one of ${JSON.stringify(route.expectAny)} on ${route.path}`).toBeTruthy();

    if (route.path === "/dashboard/certificates") {
      expect(body).toContain("VIGENCIA");
    }
    if (route.path === "/dashboard/library") {
      expect(body).toContain("Comprar");
    }
  });
}
