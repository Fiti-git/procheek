import { launch, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL } from '../config.mjs';

/**
 * Compra pública de cursos. No requiere login previo — el flujo agrega al
 * carrito desde el catálogo y llega hasta la pantalla de éxito.
 */
const flow = {
  slug: 'compra',
  title: 'Comprar un curso',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Catálogo público de cursos',
      descEs: 'Cualquier persona puede ver el catálogo desde procheck.mx/courses sin iniciar sesión.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1200);
      },
      selectors: {
        a: 'h1',
        b: 'article, [class*="card"]:has(img)',
        c: 'a:has-text("Añadir al carrito"), button:has-text("Añadir al carrito"), a:has-text("Ver curso")',
      },
      labels: {
        a: { es: 'Catálogo oficial', desc: '24 cursos NOM-STPS listos para inscribirse.', color: '#059669' },
        b: { es: 'Tarjeta de curso', desc: 'Muestra código, duración, precio y descripción.', color: '#2563EB' },
        c: { es: 'Añadir al carrito', desc: 'Un clic agrega el curso al carrito público.', color: '#DC2626' },
      },
    },
    {
      title: 'Detalle del curso',
      descEs: 'Al hacer clic en un curso ves el temario completo, la duración y el precio con IVA incluido.',
      setup: async (page) => {
        const link = page.locator('a[href*="/courses/"]').first();
        if (await link.count()) {
          await link.click().catch(() => {});
          await page.waitForLoadState('networkidle');
        }
        await page.waitForTimeout(1000);
      },
      waitMs: 500,
      selectors: {
        a: 'h1',
        b: 'button:has-text("Añadir"), button:has-text("Comprar"), a:has-text("Añadir")',
        c: 'section:has(h2), ul, [class*="module"]',
      },
      labels: {
        a: { es: 'Título y precio', desc: 'Nombre completo del curso y costo en pesos mexicanos.', color: '#059669' },
        b: { es: 'Añadir al carrito', desc: 'Agrega este curso al carrito y muestra el ícono con el conteo.', color: '#DC2626' },
        c: { es: 'Temario', desc: 'Lista de módulos que verás una vez inscrito.', color: '#2563EB' },
      },
    },
    {
      title: 'Carrito',
      descEs: 'El carrito muestra los cursos seleccionados con subtotal, IVA y total. Puedes ajustar cantidades.',
      setup: async (page) => {
        const cta = page.locator('button:has-text("Añadir"), a:has-text("Añadir")').first();
        if (await cta.count()) await cta.click().catch(() => {});
        await page.waitForTimeout(700);
        await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      },
      waitMs: 500,
      selectors: {
        a: '[class*="line-item"], article:has(img), tr:has(img)',
        b: 'aside, [class*="summary"], [class*="Resumen"]',
        c: 'a:has-text("Ir al pago"), button:has-text("Ir al pago"), a:has-text("Pagar"), button:has-text("Pagar")',
      },
      labels: {
        a: { es: 'Curso en el carrito', desc: 'Miniatura, título y precio del curso agregado.', color: '#059669' },
        b: { es: 'Resumen del pedido', desc: 'Subtotal, IVA (16%) y total a pagar.', color: '#2563EB' },
        c: { es: 'Ir al pago', desc: 'Continúa al formulario de checkout.', color: '#DC2626' },
      },
    },
    {
      title: 'Pantalla de checkout',
      descEs: 'Captura tus datos fiscales (opcional) y avanza al procesador de pagos.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      },
      waitMs: 500,
      selectors: {
        a: 'input[type="email"]',
        b: 'input[placeholder*="RFC" i], input[name*="rfc" i]',
        c: 'button[type="submit"], button:has-text("Pagar"), button:has-text("Continuar")',
      },
      labels: {
        a: { es: 'Correo del comprador', desc: 'Recibirás confirmación y accesos en este correo.', color: '#2563EB' },
        b: { es: 'RFC (opcional)', desc: 'Requerido si necesitas factura CFDI para deducir el gasto.', color: '#FBB601' },
        c: { es: 'Continuar al pago', desc: 'Va al procesador de pagos seguro.', color: '#DC2626' },
      },
    },
    {
      title: 'Confirmación de compra',
      descEs: 'Al concretar el pago verás la confirmación con el ID del pedido. Un correo llegará con los accesos.',
      setup: async (page) => {
        // We can't complete a real payment, so we visit the success stub if it works with query params.
        await page.goto(`${BASE_URL}/checkout/success?paymentId=demo-guide`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      },
      waitMs: 500,
      selectors: {
        a: 'h1',
        b: '[class*="mono"], .font-mono, code',
        c: 'a:has-text("Iniciar"), a:has-text("Cursos"), a[href*="dashboard"], a[href*="login"]',
      },
      labels: {
        a: { es: 'Pedido confirmado', desc: 'Mensaje de éxito con el estatus final.', color: '#059669' },
        b: { es: 'ID de pedido', desc: 'Referencia única del pago. Consérvala para soporte.', color: '#2563EB' },
        c: { es: 'Ir al panel', desc: 'Accede a tu curso desde tu cuenta.', color: '#DC2626' },
      },
    },
  ],
};

const { browser, page } = await launch();
try {
  await runFlow(flow, page);
} finally {
  await browser.close();
}
