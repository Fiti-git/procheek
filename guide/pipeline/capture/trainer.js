import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'trainer',
  title: 'Panel del capacitador',
  roleAudience: ['trainer'],
  steps: [
    {
      title: 'Dashboard del capacitador',
      descEs: 'Al iniciar sesión como capacitador verás tus sesiones próximas, citas pendientes y KPIs personales.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/trainer`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1000);
      },
      selectors: {
        a: 'h1',
        b: '.grid > div:has(.font-display)',
        c: 'table, ul li, [class*="session"]',
      },
      labels: {
        a: { es: 'Encabezado', desc: 'Tu ubicación actual: panel del capacitador.', color: '#059669' },
        b: { es: 'KPIs personales', desc: 'Sesiones activas, citas hoy y calificación promedio.', color: '#2563EB' },
        c: { es: 'Próximas actividades', desc: 'Lista de sesiones y citas cercanas.', color: '#FBB601' },
      },
    },
    {
      title: 'Sesiones programadas',
      descEs: 'La sección Sesiones muestra el listado completo de cursos que tienes asignados como instructor.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/trainer/sessions`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: 'button:has-text("Crear"), button:has-text("Nueva sesión"), a:has-text("Crear")',
        b: 'table tbody tr, [class*="card"]:has(h3)',
        c: 'button:has(svg), a[href*="sessions"]:has(svg)',
      },
      labels: {
        a: { es: 'Crear sesión', desc: 'Programa una nueva sesión presencial o en línea.', color: '#DC2626' },
        b: { es: 'Sesión existente', desc: 'Muestra curso, fecha, sede y cupo.', color: '#059669' },
        c: { es: 'Acciones', desc: 'Editar, cancelar o pasar lista.', color: '#2563EB' },
      },
    },
    {
      title: 'Citas del día',
      descEs: 'Las citas concentran las reuniones 1:1 y visitas agendadas por tus alumnos.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/trainer/appointments`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: 'h1, h2',
        b: 'table tbody tr, ul li',
        c: 'button:has-text("Confirmar"), button:has-text("Cancelar"), button:has-text("Reprogramar")',
      },
      labels: {
        a: { es: 'Título Citas', desc: 'Lista de próximas reuniones o visitas.', color: '#059669' },
        b: { es: 'Cita', desc: 'Cada fila incluye alumno, curso y hora.', color: '#2563EB' },
        c: { es: 'Acciones de cita', desc: 'Confirma, cancela o reprograma según necesites.', color: '#DC2626' },
      },
    },
    {
      title: 'Perfil del capacitador',
      descEs: 'Actualiza tu bio, foto y datos de contacto para que los alumnos te ubiquen fácil.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/trainer/profile`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);
      },
      waitMs: 500,
      selectors: {
        a: 'input[name*="name" i], input[type="text"]',
        b: 'textarea, [contenteditable="true"]',
        c: 'button[type="submit"], button:has-text("Guardar")',
      },
      labels: {
        a: { es: 'Datos de contacto', desc: 'Nombre público, teléfono y correo del capacitador.', color: '#2563EB' },
        b: { es: 'Biografía', desc: 'Descripción larga visible en tu ficha pública.', color: '#059669' },
        c: { es: 'Guardar cambios', desc: 'Persiste el perfil en la plataforma.', color: '#DC2626' },
      },
    },
  ],
};

const { browser, page } = await launch();
try {
  await loginAs(page, USERS.trainer);
  await runFlow(flow, page);
} finally {
  await browser.close();
}
