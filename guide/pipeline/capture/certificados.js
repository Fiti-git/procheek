import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'certificados',
  title: 'Certificados DC-3',
  roleAudience: ['employee', 'clientAdmin'],
  steps: [
    {
      title: 'Mis certificados',
      descEs: 'La sección de certificados concentra todos los DC-3 emitidos a tu nombre, con indicadores rápidos de vigencia y una tabla detallada.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/certificates`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'main .grid:has(.font-display), main [class*="grid" i]:has([class*="kpi" i]), main [class*="grid" i]:first-of-type',
        b: 'main input[type="search"], main input[placeholder*="Buscar" i], main input[type="text"]',
        c: 'main table tbody tr',
      },
      labels: {
        a: { es: 'Indicadores de vigencia', desc: 'Totales de constancias vigentes, por vencer y vencidas.', color: '#059669' },
        b: { es: 'Buscador', desc: 'Filtra tus constancias por folio, curso o fecha.', color: '#2563EB' },
        c: { es: 'Fila de certificado', desc: 'Cada renglón representa una constancia con sus acciones.', color: '#FBB601' },
      },
    },
    {
      title: 'Detalle de la constancia',
      descEs: 'Desde el ícono de ojo puedes abrir el detalle completo de una constancia y descargar el PDF oficial DC-3.',
      setup: async (page) => {
        try {
          await page.locator('button[title="Ver detalle"], button[aria-label*="detalle" i]').first().click({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(700);
      },
      waitMs: 800,
      selectors: {
        a: '[role="dialog"] h2, [role="dialog"] h3, .modal-title, [class*="modal" i] h2',
        b: '[role="dialog"] :text("Folio"), [role="dialog"] :text-matches("PC-", "i")',
        c: '[role="dialog"] button:has-text("Descargar"), [role="dialog"] a:has-text("PDF"), [role="dialog"] button:has-text("PDF")',
      },
      labels: {
        a: { es: 'Título del detalle', desc: 'Confirma el nombre del curso emitido.', color: '#059669' },
        b: { es: 'Folio DC-3', desc: 'Identificador único de la constancia emitida.', color: '#2563EB' },
        c: { es: 'Descargar PDF', desc: 'Obtén el documento oficial firmado para tu expediente.', color: '#DC2626' },
      },
    },
    {
      title: 'Verificación pública de constancias',
      descEs: 'PROCHECK expone un buscador público para que cualquier persona pueda validar una constancia con el folio impreso.',
      setup: async (page) => {
        try {
          await page.locator('[role="dialog"] button:has-text("Cerrar"), button[aria-label*="close" i], button[aria-label*="cerrar" i]').first().click({ timeout: 2000 });
        } catch {
          await page.keyboard.press('Escape').catch(() => {});
        }
        await page.waitForTimeout(300);
        await page.goto(`${BASE_URL}/certificate-lookup`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'input[type="text"], input[placeholder*="folio" i], input[name*="folio" i]',
        b: 'form :text-matches("PC-", "i"), form small, form p, main :text("formato")',
        c: 'button[type="submit"], button:has-text("Buscar"), button:has-text("Verificar")',
      },
      labels: {
        a: { es: 'Campo de folio', desc: 'Escribe el folio impreso en la constancia.', color: '#2563EB' },
        b: { es: 'Formato esperado', desc: 'Ayuda al usuario con el patrón del folio (PC-XXXX-XXXX-XXXX).', color: '#059669' },
        c: { es: 'Buscar', desc: 'Ejecuta la verificación pública contra el registro oficial.', color: '#DC2626' },
      },
    },
    {
      title: 'Resultado de verificación',
      descEs: 'Al enviar un folio válido, la plataforma devuelve el estatus de la constancia, el titular, el folio y un enlace de descarga.',
      setup: async (page) => {
        try {
          await page.fill('input[type="text"], input[placeholder*="folio" i], input[name*="folio" i]', 'PC-F627-FB66-6258');
          await page.locator('button[type="submit"], button:has-text("Buscar"), button:has-text("Verificar")').first().click({ timeout: 3000 });
          await page.waitForLoadState('networkidle', { timeout: 8000 });
        } catch {}
        await page.waitForTimeout(800);
      },
      waitMs: 800,
      selectors: {
        a: 'main [class*="badge" i], main [class*="status" i], main :text("Vigente"), main :text("Vencido")',
        b: 'main h1, main h2, main :text("Titular"), main [class*="name" i]',
        c: 'main :text("PC-"), main [class*="folio" i]',
        d: 'main a:has-text("PDF"), main button:has-text("Descargar"), main a:has-text("Descargar")',
      },
      labels: {
        a: { es: 'Estatus de la constancia', desc: 'Indica si la constancia está vigente o ya venció.', color: '#059669' },
        b: { es: 'Titular', desc: 'Nombre completo del trabajador certificado.', color: '#2563EB' },
        c: { es: 'Folio verificado', desc: 'Confirma el folio consultado contra el registro oficial.', color: '#FBB601' },
        d: { es: 'Descargar PDF', desc: 'Descarga la copia oficial del DC-3 verificado.', color: '#DC2626' },
      },
    },
  ],
};

const { browser, page } = await launch();
try {
  await loginAs(page, USERS.employee);
  await runFlow(flow, page);
} finally {
  await browser.close();
}
