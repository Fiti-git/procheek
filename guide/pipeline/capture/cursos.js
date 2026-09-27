import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'cursos',
  title: 'Cursos y aprendizaje',
  roleAudience: ['employee', 'clientAdmin'],
  steps: [
    {
      title: 'Mis cursos inscritos',
      descEs: 'Al abrir Cursos verás primero los cursos en los que estás inscrito. Desde aquí puedes retomar tu avance o revisar tu catálogo asignado.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/courses`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'main [class*="grid" i], main ul, main section:has(a[href*="/dashboard/courses/"])',
        b: 'button:has-text("Cursos disponibles"), [role="tab"]:has-text("disponibles")',
        c: 'a[href*="/dashboard/courses/"]',
      },
      labels: {
        a: { es: 'Cursos inscritos', desc: 'Listado de los cursos en los que ya estás participando.', color: '#059669' },
        b: { es: 'Cursos disponibles', desc: 'Cambia a la pestaña del catálogo para inscribirte a nuevos cursos.', color: '#2563EB' },
        c: { es: 'Tarjeta de curso', desc: 'Abre el curso para retomar tu progreso o iniciar el temario.', color: '#DC2626' },
      },
    },
    {
      title: 'Catálogo de cursos disponibles',
      descEs: 'En Cursos disponibles verás el catálogo completo de la organización. Cada tarjeta te permite inscribirte con un solo clic.',
      setup: async (page) => {
        try {
          await page.locator('button:has-text("Cursos disponibles"), [role="tab"]:has-text("disponibles")').first().click({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(600);
      },
      waitMs: 800,
      selectors: {
        a: 'main [class*="grid" i], main section',
        b: 'main a[href*="/dashboard/courses/"], main [class*="card" i]',
        c: 'button:has-text("Inscribirme"), button:has-text("Inscribir"), a:has-text("Inscribirme")',
      },
      labels: {
        a: { es: 'Catálogo disponible', desc: 'Cursos ofertados por tu organización según tu perfil.', color: '#059669' },
        b: { es: 'Tarjeta de curso', desc: 'Muestra título, duración, nivel y estado de inscripción.', color: '#FBB601' },
        c: { es: 'Botón Inscribirme', desc: 'Te inscribe al curso al momento y agrega el temario a tus cursos.', color: '#DC2626' },
      },
    },
    {
      title: 'Página del curso',
      descEs: 'La página del curso muestra el encabezado con metadatos y el temario dividido en módulos.',
      setup: async (page) => {
        try {
          await page.locator('main a[href*="/dashboard/courses/"]').first().click({ timeout: 3000 });
          await page.waitForLoadState('networkidle', { timeout: 8000 });
        } catch {}
        await page.waitForTimeout(600);
      },
      waitMs: 800,
      selectors: {
        a: 'main h1, main header',
        b: 'main ol, main ul:has(a), main [class*="module" i]',
        c: 'main ol a, main ul a, main [class*="module" i] a',
      },
      labels: {
        a: { es: 'Encabezado del curso', desc: 'Nombre, duración, nivel y descripción general del curso.', color: '#059669' },
        b: { es: 'Temario', desc: 'Lista de módulos ordenados que debes completar.', color: '#2563EB' },
        c: { es: 'Primer módulo', desc: 'Abre el primer módulo para comenzar a estudiar.', color: '#DC2626' },
      },
    },
    {
      title: 'Contenido del módulo',
      descEs: 'Al abrir un módulo verás el contenido de estudio (texto o video) y los controles para marcarlo como completado o avanzar al siguiente.',
      setup: async (page) => {
        try {
          await page.locator('main ol a, main ul a, main [class*="module" i] a').first().click({ timeout: 3000 });
          await page.waitForLoadState('networkidle', { timeout: 8000 });
        } catch {}
        await page.waitForTimeout(600);
      },
      waitMs: 800,
      selectors: {
        a: 'main h1, main h2',
        b: 'main article, main [class*="prose" i], main [class*="content" i]',
        c: 'button:has-text("Marcar"), button:has-text("completado")',
        d: 'a:has-text("Siguiente"), button:has-text("Siguiente")',
      },
      labels: {
        a: { es: 'Título del módulo', desc: 'Identifica el módulo que estás estudiando.', color: '#059669' },
        b: { es: 'Contenido del módulo', desc: 'Cuerpo con lectura o video de estudio.', color: '#2563EB' },
        c: { es: 'Marcar como completado', desc: 'Registra tu avance en el módulo actual.', color: '#DC2626' },
        d: { es: 'Siguiente módulo', desc: 'Continúa con el siguiente módulo del temario.', color: '#FBB601' },
      },
    },
    {
      title: 'Evaluación del curso',
      descEs: 'Al final del temario deberás responder la evaluación. Cada pregunta tiene opciones de respuesta única; envía tus respuestas al terminar.',
      setup: async (page) => {
        try {
          const url = page.url();
          const base = url.replace(/\/[^/]*$/, '');
          await page.goto(`${base}/quiz`, { waitUntil: 'networkidle', timeout: 8000 });
        } catch {}
        await page.waitForTimeout(600);
      },
      waitMs: 800,
      selectors: {
        a: 'main h1, main h2, main [class*="question" i]',
        b: 'main [role="radiogroup"], main ul:has(input), main form',
        c: 'button[type="submit"], button:has-text("Enviar"), button:has-text("Finalizar")',
      },
      labels: {
        a: { es: 'Pregunta', desc: 'Enunciado de la pregunta actual.', color: '#059669' },
        b: { es: 'Opciones de respuesta', desc: 'Selecciona la respuesta que consideres correcta.', color: '#2563EB' },
        c: { es: 'Enviar evaluación', desc: 'Envía tus respuestas para calificar el examen.', color: '#DC2626' },
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
