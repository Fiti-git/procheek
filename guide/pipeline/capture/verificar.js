import { launch, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL } from '../config.mjs';

/**
 * Verificación pública de un certificado DC-3. Cualquier persona (inspector
 * STPS, empleador, cliente) puede consultar la validez desde procheck.mx/
 * certificate-lookup sin credenciales.
 */
const flow = {
  slug: 'verificar',
  title: 'Verificar un certificado DC-3',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Pantalla pública de verificación',
      descEs: 'La verificación pública está disponible sin login en procheck.mx/certificate-lookup.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/certificate-lookup`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1000);
      },
      selectors: {
        a: 'h1',
        b: 'input[type="text"], input[placeholder*="Folio" i]',
        c: 'button[type="submit"], button:has-text("Buscar")',
      },
      labels: {
        a: { es: 'Verificación oficial', desc: 'Pantalla pública para validar cualquier DC-3 emitido por PROCHECK.', color: '#059669' },
        b: { es: 'Folio o CURP', desc: 'Acepta el folio DC-3 (PCH-YYYY-XXXXXX) o el código de verificación (PC-XXXX-XXXX-XXXX).', color: '#2563EB' },
        c: { es: 'Buscar', desc: 'Consulta el registro oficial en tiempo real.', color: '#DC2626' },
      },
    },
    {
      title: 'Resultado vigente',
      descEs: 'Si el certificado es válido, PROCHECK muestra los datos del titular, curso, folio y vigencia.',
      setup: async (page) => {
        await page.fill('input[type="text"], input[placeholder*="Folio" i]', 'PC-F627-FB66-6258').catch(() => {});
        const btn = page.locator('button[type="submit"], button:has-text("Buscar")').first();
        if (await btn.count()) await btn.click().catch(() => {});
        await page.waitForTimeout(2000);
      },
      waitMs: 500,
      selectors: {
        a: '[class*="badge"]:has-text("Vencido"), [class*="badge"]:has-text("Vigente"), .rounded-full:has-text("VENCIDO"), .rounded-full:has-text("VIGENTE")',
        b: 'h2',
        c: 'button:has-text("Descargar"), a:has-text("Descargar")',
      },
      labels: {
        a: { es: 'Estado', desc: 'Vigente, por vencer o vencido — calculado en tiempo real.', color: '#DC2626' },
        b: { es: 'Titular', desc: 'Nombre completo de la persona certificada.', color: '#059669' },
        c: { es: 'Descargar PDF DC-3', desc: 'Descarga el PDF oficial con formato STPS válido para inspección.', color: '#2563EB' },
      },
    },
    {
      title: 'Certificado no encontrado',
      descEs: 'Si el folio no existe o está mal escrito, verás un mensaje claro sin exponer datos.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/certificate-lookup`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(700);
        await page.fill('input[type="text"], input[placeholder*="Folio" i]', 'PCH-9999-999999').catch(() => {});
        const btn = page.locator('button[type="submit"], button:has-text("Buscar")').first();
        if (await btn.count()) await btn.click().catch(() => {});
        await page.waitForTimeout(1800);
      },
      waitMs: 500,
      selectors: {
        a: 'h2, .alert, [class*="danger"], [class*="error"]',
        b: '.font-mono, code',
        c: 'button:has-text("Nueva"), a:has-text("Nueva")',
      },
      labels: {
        a: { es: 'No encontrado', desc: 'Mensaje claro cuando el folio no está registrado en PROCHECK.', color: '#DC2626' },
        b: { es: 'Consulta realizada', desc: 'Muestra exactamente lo que buscaste para verificar la escritura.', color: '#2563EB' },
        c: { es: 'Nueva búsqueda', desc: 'Reintenta con otro folio o CURP.', color: '#059669' },
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
