import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'reportes',
  title: 'Reportes y KPIs',
  roleAudience: ['clientAdmin'],
  steps: [
    {
      title: 'Dashboard de reportes',
      descEs: 'La sección Reportes concentra los indicadores operativos: usuarios activos, cursos vigentes, certificados emitidos y ventas por mes.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/reports`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'main .grid:has(.font-display), main [class*="grid" i]:first-of-type',
        b: 'main [class*="grid" i] > div:nth-child(2), main .grid > div:nth-child(2)',
        c: 'main [class*="grid" i] > div:nth-child(3), main .grid > div:nth-child(3)',
        d: 'section:has-text("Ventas"), [class*="card" i]:has-text("Ventas"), main :text("Ventas por mes")',
      },
      labels: {
        a: { es: 'Total de usuarios', desc: 'Cuenta a todos los colaboradores dados de alta.', color: '#059669' },
        b: { es: 'Cursos activos', desc: 'Número de cursos publicados y disponibles.', color: '#2563EB' },
        c: { es: 'Certificados emitidos', desc: 'DC-3 generados por la plataforma en el periodo.', color: '#FBB601' },
        d: { es: 'Ventas por mes', desc: 'Gráfica con la evolución de ingresos mensuales.', color: '#DC2626' },
      },
    },
    {
      title: 'Gráfica de ventas por mes',
      descEs: 'La gráfica de ventas por mes muestra la tendencia de ingresos, permitiendo comparar meses y detectar estacionalidad.',
      setup: async (page) => {
        try {
          await page.locator('section:has-text("Ventas"), [class*="card" i]:has-text("Ventas"), main :text("Ventas por mes")').first().scrollIntoViewIfNeeded({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(500);
      },
      waitMs: 800,
      selectors: {
        a: 'section:has-text("Ventas") h2, section:has-text("Ventas") h3, [class*="card" i]:has-text("Ventas") h2, [class*="card" i]:has-text("Ventas") h3',
        b: 'section:has-text("Ventas") svg, [class*="card" i]:has-text("Ventas") svg, main svg[role="img"], main svg',
        c: 'section:has-text("Ventas") svg text, [class*="card" i]:has-text("Ventas") svg text, main svg text',
      },
      labels: {
        a: { es: 'Título de la gráfica', desc: 'Identifica el KPI que se está visualizando.', color: '#059669' },
        b: { es: 'Serie de datos', desc: 'Barras o líneas con los ingresos de cada mes.', color: '#2563EB' },
        c: { es: 'Ejes y etiquetas', desc: 'Etiquetas de meses y valores para leer la gráfica.', color: '#FBB601' },
      },
    },
    {
      title: 'Tablas de detalle',
      descEs: 'Al pie del reporte encontrarás tablas con el desglose por curso, usuario o certificado según el filtro aplicado.',
      setup: async (page) => {
        try {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        } catch {}
        await page.waitForTimeout(500);
      },
      waitMs: 800,
      selectors: {
        a: 'main table',
        b: 'main table thead, main table thead tr',
        c: 'main table tbody tr',
      },
      labels: {
        a: { es: 'Tabla de detalle', desc: 'Datos granulares del reporte seleccionado.', color: '#059669' },
        b: { es: 'Encabezados', desc: 'Columnas con los atributos consultados.', color: '#2563EB' },
        c: { es: 'Renglón de detalle', desc: 'Cada fila representa un registro individual.', color: '#DC2626' },
      },
    },
  ],
};

const { browser, page } = await launch();
try {
  await loginAs(page, USERS.admin);
  await runFlow(flow, page);
} finally {
  await browser.close();
}
