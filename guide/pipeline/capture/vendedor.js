import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'vendedor',
  title: 'Panel del vendedor',
  roleAudience: ['vendedor'],
  steps: [
    {
      title: 'Dashboard de ventas',
      descEs: 'Como vendedor verás tus KPIs comerciales: leads activos, deals cerrados y comisiones proyectadas.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/sales`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1000);
      },
      selectors: {
        a: 'h1',
        b: '.grid > div:has(.font-display)',
        c: 'table, ul, [class*="pipeline"], [class*="deal"]',
      },
      labels: {
        a: { es: 'Encabezado', desc: 'Ubicación actual: panel comercial.', color: '#059669' },
        b: { es: 'KPIs comerciales', desc: 'Pipeline, cierres del mes y comisiones estimadas.', color: '#2563EB' },
        c: { es: 'Pipeline', desc: 'Tus deals abiertos por etapa del embudo.', color: '#FBB601' },
      },
    },
    {
      title: 'Leads (prospectos)',
      descEs: 'Registra y da seguimiento a nuevos prospectos desde la sección Leads.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/sales/leads`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: 'button:has-text("Nuevo"), button:has-text("Crear"), a:has-text("Nuevo")',
        b: 'table tbody tr',
        c: 'button:has(svg), tr button:has(svg)',
      },
      labels: {
        a: { es: 'Crear lead', desc: 'Captura un nuevo prospecto con nombre, empresa y contacto.', color: '#DC2626' },
        b: { es: 'Lead existente', desc: 'Cada fila muestra estado, fuente y siguiente acción.', color: '#059669' },
        c: { es: 'Acciones rápidas', desc: 'Convertir en deal, editar o descartar.', color: '#2563EB' },
      },
    },
    {
      title: 'Deals (oportunidades)',
      descEs: 'Los deals son leads convertidos que ya están en el embudo comercial. Cada uno tiene una etapa.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/sales/deals`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: '[class*="column"], [class*="stage"], .kanban',
        b: '[class*="card"]:has(h3), [class*="deal"]',
        c: 'button:has-text("Nuevo"), a:has-text("Nuevo")',
      },
      labels: {
        a: { es: 'Columnas por etapa', desc: 'Prospección, calificación, propuesta, cierre.', color: '#059669' },
        b: { es: 'Tarjeta de deal', desc: 'Muestra monto estimado, empresa y último contacto.', color: '#2563EB' },
        c: { es: 'Nuevo deal', desc: 'Crea un deal manualmente sin pasar por lead.', color: '#DC2626' },
      },
    },
    {
      title: 'Comisiones',
      descEs: 'La vista Comisiones proyecta lo que ganarás cuando se cierren los deals actuales.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/sales/commissions`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: '.grid > div:has(.font-display)',
        b: 'table',
        c: 'select, [role="combobox"], input[type="date"]',
      },
      labels: {
        a: { es: 'Total proyectado', desc: 'Suma de comisiones esperadas del periodo elegido.', color: '#059669' },
        b: { es: 'Detalle por deal', desc: 'Cada fila muestra deal, cliente, monto y % de comisión.', color: '#2563EB' },
        c: { es: 'Filtro de periodo', desc: 'Cambia entre semana, mes o rango personalizado.', color: '#FBB601' },
      },
    },
    {
      title: 'Citas comerciales',
      descEs: 'Agenda visitas y llamadas con tus prospectos desde la sección Citas.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/sales/appointments`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: 'button:has-text("Agendar"), button:has-text("Nueva"), a:has-text("Agendar")',
        b: 'table tbody tr, ul li',
        c: 'button:has-text("Confirmar"), button:has-text("Cancelar")',
      },
      labels: {
        a: { es: 'Agendar cita', desc: 'Registra una nueva reunión con un prospecto.', color: '#DC2626' },
        b: { es: 'Cita existente', desc: 'Muestra fecha, empresa, contacto y estado.', color: '#059669' },
        c: { es: 'Acciones de cita', desc: 'Confirma, cancela o marca como completada.', color: '#2563EB' },
      },
    },
  ],
};

const { browser, page } = await launch();
try {
  await loginAs(page, USERS.vendedor);
  await runFlow(flow, page);
} finally {
  await browser.close();
}
