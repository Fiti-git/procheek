import { launch, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL } from '../config.mjs';

/**
 * Onboarding del invitado. Cuando el admin envía una invitación, la persona
 * recibe un correo con un enlace de "primer acceso" que la lleva al login
 * con su correo y una contraseña temporal.
 *
 * NOTA: No podemos capturar el correo real desde Playwright, así que este
 * flujo documenta la pantalla de login y la pantalla de cambio de contraseña
 * que sigue después del primer inicio de sesión.
 */
const flow = {
  slug: 'invitacion',
  title: 'Aceptar una invitación',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Correo de invitación',
      descEs: 'El administrador te envió una invitación por correo. Contiene tu correo de acceso y una contraseña temporal generada por PROCHECK. Sigue el enlace del correo o entra directamente a procheck.mx/login.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(800);
      },
      selectors: {
        a: 'aside, [class*="brand" i]:has(img), .hidden.lg\\:flex:has(img)',
        b: 'input[type="email"]',
        c: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Panel de bienvenida', desc: 'Confirma que llegaste al sitio oficial procheck.mx.', color: '#059669' },
        b: { es: 'Correo del invitado', desc: 'Usa el correo al que llegó la invitación (mismo del cuerpo del correo).', color: '#2563EB' },
        c: { es: 'Continuar', desc: 'Avanza al paso de contraseña.', color: '#DC2626' },
      },
    },
    {
      title: 'Contraseña temporal',
      descEs: 'Ingresa la contraseña temporal exactamente como aparece en el correo (respeta mayúsculas y símbolos).',
      setup: async (page) => {
        await page.fill('input[type="email"]', 'nuevo.empleado@empresa.com').catch(() => {});
        await page.locator('form').evaluate((f) => f.requestSubmit()).catch(() => {});
        await page.waitForSelector('input[type="password"]', { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(800);
      },
      waitMs: 500,
      selectors: {
        a: 'input[type="password"]',
        b: 'button[type="submit"]',
        c: 'a[href*="forgot"]',
      },
      labels: {
        a: { es: 'Contraseña temporal', desc: 'Copiala del correo. Tras el primer acceso te pedirá cambiarla.', color: '#2563EB' },
        b: { es: 'Iniciar sesión', desc: 'Valida las credenciales y entra por primera vez.', color: '#DC2626' },
        c: { es: '¿No la encuentras?', desc: 'Si perdiste el correo puedes solicitar recuperación aquí.', color: '#FBB601' },
      },
    },
    {
      title: 'Cambio inicial de contraseña',
      descEs: 'En el primer acceso PROCHECK te pedirá definir una contraseña personal. La temporal ya no será válida después de este paso.',
      setup: async (page) => {
        // Show the reset flow as the canonical "define new password" UI
        await page.goto(`${BASE_URL}/reset-password?token=first-login-demo`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
      },
      waitMs: 500,
      selectors: {
        a: 'input[type="password"]',
        b: 'input[type="password"] ~ input[type="password"]',
        c: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Nueva contraseña', desc: 'Mínimo 8 caracteres con mayúscula, número y símbolo.', color: '#2563EB' },
        b: { es: 'Confirmar', desc: 'Debe coincidir exactamente.', color: '#FBB601' },
        c: { es: 'Guardar contraseña', desc: 'Al confirmar, quedas dentro de tu panel personal.', color: '#DC2626' },
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
