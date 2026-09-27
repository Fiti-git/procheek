import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'admin',
  title: 'Panel administrativo',
  roleAudience: ['clientAdmin'],
  steps: [
    {
      title: 'Administración de cursos',
      descEs: 'Desde el panel administrativo puedes dar de alta, editar o eliminar cursos del catálogo institucional.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/admin/courses`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.keyboard.press('Escape').catch(() => {});
      },
      waitMs: 800,
      selectors: {
        a: 'button:has-text("Crear curso"), a:has-text("Crear curso"), button:has-text("Nuevo curso")',
        b: 'main table tbody tr',
        c: 'main table thead th:last-child, main table tbody tr td:last-child',
      },
      labels: {
        a: { es: 'Crear curso', desc: 'Abre el formulario para dar de alta un curso nuevo.', color: '#DC2626' },
        b: { es: 'Fila de curso', desc: 'Muestra código, título, industria y estado del curso.', color: '#059669' },
        c: { es: 'Acciones', desc: 'Editar o eliminar el curso desde el mismo renglón.', color: '#2563EB' },
      },
    },
    {
      title: 'Formulario de nuevo curso',
      descEs: 'El formulario captura los datos maestros del curso: código, título, precio, industria y descripción.',
      setup: async (page) => {
        try {
          await page.locator('button:has-text("Crear curso"), a:has-text("Crear curso"), button:has-text("Nuevo curso")').first().click({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(700);
      },
      waitMs: 800,
      selectors: {
        a: '[role="dialog"] input[name*="code" i], [role="dialog"] input[placeholder*="código" i], [role="dialog"] input[placeholder*="codigo" i]',
        b: '[role="dialog"] input[name*="title" i], [role="dialog"] input[placeholder*="título" i], [role="dialog"] input[placeholder*="titulo" i]',
        c: '[role="dialog"] input[name*="price" i], [role="dialog"] input[type="number"], [role="dialog"] input[placeholder*="precio" i]',
        d: '[role="dialog"] select[name*="industry" i], [role="dialog"] [role="combobox"], [role="dialog"] select',
      },
      labels: {
        a: { es: 'Código del curso', desc: 'Identificador corto usado en reportes y constancias.', color: '#059669' },
        b: { es: 'Título', desc: 'Nombre visible del curso en el catálogo.', color: '#2563EB' },
        c: { es: 'Precio', desc: 'Monto en MXN si el curso se vende individualmente.', color: '#FBB601' },
        d: { es: 'Industria', desc: 'Sector al que aplica el curso (construcción, químicos, etc.).', color: '#DC2626' },
      },
    },
    {
      title: 'Administración de certificados',
      descEs: 'La sección de certificados administrativos muestra métricas globales y permite reimprimir o revocar constancias.',
      setup: async (page) => {
        try {
          await page.locator('[role="dialog"] button:has-text("Cerrar"), button[aria-label*="close" i], button[aria-label*="cerrar" i]').first().click({ timeout: 2000 });
        } catch {
          await page.keyboard.press('Escape').catch(() => {});
        }
        await page.waitForTimeout(300);
        await page.goto(`${BASE_URL}/dashboard/admin/certificates`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'main .grid:has(.font-display), main [class*="grid" i]:first-of-type',
        b: 'main table',
        c: 'main table thead th:last-child, main table tbody tr td:last-child',
      },
      labels: {
        a: { es: 'Indicadores globales', desc: 'Total emitidos, vigentes y por vencer en toda la organización.', color: '#059669' },
        b: { es: 'Tabla de constancias', desc: 'Historial completo de DC-3 emitidos por la plataforma.', color: '#2563EB' },
        c: { es: 'Acciones', desc: 'Descargar, reimprimir o revocar una constancia.', color: '#DC2626' },
      },
    },
    {
      title: 'Biblioteca administrativa',
      descEs: 'La biblioteca administra los documentos oficiales (políticas, guías, formatos) que verán todos los usuarios.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/admin/library`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'button:has-text("Subir"), a:has-text("Subir"), button:has-text("Nuevo documento")',
        b: 'main table, main [role="table"]',
        c: 'main table tbody tr td:last-child, main table thead th:last-child',
      },
      labels: {
        a: { es: 'Subir documento', desc: 'Carga un archivo nuevo (PDF, DOCX, XLSX) a la biblioteca.', color: '#DC2626' },
        b: { es: 'Tabla de documentos', desc: 'Listado con nombre, categoría, tamaño y fecha de carga.', color: '#059669' },
        c: { es: 'Acciones por documento', desc: 'Descargar, reemplazar o eliminar el archivo.', color: '#2563EB' },
      },
    },
    {
      title: 'Inscripción masiva',
      descEs: 'La herramienta de inscripción masiva permite asignar un curso a varios colaboradores de una sola vez.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/admin/bulk-assign`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      waitMs: 800,
      selectors: {
        a: 'main select, main [role="combobox"], main label:has-text("Curso") + *',
        b: 'main table, main ul:has(input[type="checkbox"]), main [role="listbox"]',
        c: 'button:has-text("Inscribir"), button[type="submit"]:has-text("Asignar"), button:has-text("Asignar")',
      },
      labels: {
        a: { es: 'Selector de curso', desc: 'Elige el curso que quieres asignar masivamente.', color: '#059669' },
        b: { es: 'Lista de usuarios', desc: 'Selecciona con casillas a los colaboradores destino.', color: '#2563EB' },
        c: { es: 'Inscribir', desc: 'Ejecuta la asignación en lote para todos los seleccionados.', color: '#DC2626' },
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
