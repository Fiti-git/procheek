import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'biblioteca',
  title: 'Biblioteca de documentos',
  roleAudience: ['employee', 'clientAdmin'],
  steps: [
    {
      title: 'Panel de biblioteca',
      descEs: 'La biblioteca reúne reglamentos, procedimientos y materiales publicados por tu organización o por PROCHECK.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/library`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1000);
      },
      selectors: {
        a: 'h1',
        b: 'input[placeholder*="Buscar" i], input[type="search"]',
        c: 'article, [class*="card"], table tbody tr',
      },
      labels: {
        a: { es: 'Encabezado', desc: 'Tu ubicación: sección Biblioteca.', color: '#059669' },
        b: { es: 'Búsqueda', desc: 'Filtra por nombre, categoría o etiqueta.', color: '#FBB601' },
        c: { es: 'Documento', desc: 'Cada tarjeta muestra el documento con opciones de descarga.', color: '#2563EB' },
      },
    },
    {
      title: 'Descarga o compra de material',
      descEs: 'Los documentos públicos son gratuitos; los premium requieren compra puntual.',
      setup: async (page) => {
        await page.waitForTimeout(600);
      },
      waitMs: 500,
      selectors: {
        a: 'button:has-text("Descargar"), a:has-text("Descargar")',
        b: 'button:has-text("Comprar"), a:has-text("Comprar")',
        c: '[class*="tag"], [class*="badge"]',
      },
      labels: {
        a: { es: 'Descargar', desc: 'Descarga el documento en PDF.', color: '#059669' },
        b: { es: 'Comprar', desc: 'Documentos con costo adicional (por ejemplo, plantillas premium).', color: '#DC2626' },
        c: { es: 'Categoría', desc: 'Etiqueta del tipo de documento (reglamento, formato, guía).', color: '#2563EB' },
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
