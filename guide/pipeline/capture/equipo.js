import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'equipo',
  title: 'Gestión de equipo',
  roleAudience: ['clientAdmin'],
  steps: [
    {
      title: 'Panel de equipo',
      descEs: 'La sección Equipo centraliza el roster de tu organización, con indicadores de cumplimiento y accesos rápidos para invitar colaboradores.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/team`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.keyboard.press('Escape').catch(() => {});
      },
      waitMs: 800,
      selectors: {
        a: 'main .grid:has(.font-display), main [class*="grid" i]:first-of-type',
        b: 'button:has-text("Invitar"), a:has-text("Invitar")',
        c: 'main table, main [role="table"]',
      },
      labels: {
        a: { es: 'Indicadores del equipo', desc: 'Miembros activos, invitaciones pendientes y cumplimiento promedio.', color: '#059669' },
        b: { es: 'Invitar miembro', desc: 'Abre el formulario para enviar una invitación por correo.', color: '#DC2626' },
        c: { es: 'Tabla de miembros', desc: 'Roster con rol, estatus y accesos rápidos por integrante.', color: '#2563EB' },
      },
    },
    {
      title: 'Formulario de invitación',
      descEs: 'Al invitar a un miembro, PROCHECK solicita nombre, correo y rol; el sistema envía un correo con un enlace único de alta.',
      setup: async (page) => {
        try {
          await page.locator('button:has-text("Invitar"), a:has-text("Invitar")').first().click({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(700);
      },
      waitMs: 800,
      selectors: {
        a: '[role="dialog"] input[type="text"], [role="dialog"] input[name*="name" i], [role="dialog"] input[placeholder*="nombre" i]',
        b: '[role="dialog"] input[type="email"], [role="dialog"] input[name*="email" i]',
        c: '[role="dialog"] select, [role="dialog"] [role="combobox"], [role="dialog"] button:has-text("Rol")',
        d: '[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Enviar"), [role="dialog"] button:has-text("Invitar")',
      },
      labels: {
        a: { es: 'Nombre del invitado', desc: 'Nombre visible del nuevo integrante.', color: '#059669' },
        b: { es: 'Correo corporativo', desc: 'Dirección donde llegará la invitación.', color: '#2563EB' },
        c: { es: 'Selector de rol', desc: 'Define permisos: administrador, empleado, capacitador, etc.', color: '#FBB601' },
        d: { es: 'Enviar invitación', desc: 'Envía el correo con el enlace único de alta.', color: '#DC2626' },
      },
    },
    {
      title: 'Acciones sobre un miembro',
      descEs: 'Cada fila del roster muestra un menú de acciones para reenviar invitaciones, editar rol o eliminar al miembro.',
      setup: async (page) => {
        try {
          await page.locator('[role="dialog"] button:has-text("Cerrar"), button[aria-label*="close" i], button[aria-label*="cerrar" i]').first().click({ timeout: 2000 });
        } catch {
          await page.keyboard.press('Escape').catch(() => {});
        }
        await page.waitForTimeout(400);
        try {
          await page.locator('button[aria-label*="acciones" i], button:has(.lucide-more-vertical), main table button:has(svg)').first().click({ timeout: 3000 });
        } catch {}
        await page.waitForTimeout(500);
      },
      waitMs: 800,
      selectors: {
        a: 'main table tbody tr',
        b: '[role="menu"], [role="listbox"], [class*="dropdown" i]:visible, [class*="menu" i]:has-text("Reenviar")',
        c: ':text("Reenviar"), :text("Eliminar"), [role="menuitem"]',
      },
      labels: {
        a: { es: 'Fila del miembro', desc: 'Integrante seleccionado para aplicar la acción.', color: '#059669' },
        b: { es: 'Menú de acciones', desc: 'Se abre al pulsar los tres puntos en la fila.', color: '#2563EB' },
        c: { es: 'Opciones disponibles', desc: 'Reenviar invitación, cambiar rol o eliminar al miembro.', color: '#DC2626' },
      },
    },
    {
      title: 'Actividad reciente',
      descEs: 'Al final del panel encontrarás la bitácora de actividad reciente: altas, invitaciones, cambios de rol y bajas.',
      setup: async (page) => {
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(300);
        try {
          await page.locator('h2:has-text("Actividad"), h3:has-text("Actividad"), section:has-text("Actividad reciente")').first().scrollIntoViewIfNeeded({ timeout: 3000 });
        } catch {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        }
        await page.waitForTimeout(500);
      },
      waitMs: 800,
      selectors: {
        a: 'section:has(h2:has-text("Actividad")), section:has(h3:has-text("Actividad")), [class*="activity" i]',
        b: 'section:has-text("Actividad") ul li, section:has-text("Actividad") [class*="item" i], [class*="activity" i] li',
        c: 'section:has-text("Actividad") time, section:has-text("Actividad") :text-matches("hace", "i"), [class*="activity" i] time',
      },
      labels: {
        a: { es: 'Tarjeta de actividad', desc: 'Bitácora cronológica de eventos del equipo.', color: '#059669' },
        b: { es: 'Entradas de la bitácora', desc: 'Cada evento registra usuario, acción y fecha.', color: '#2563EB' },
        c: { es: 'Marca temporal', desc: 'Cuándo ocurrió el evento respecto a hoy.', color: '#FBB601' },
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
