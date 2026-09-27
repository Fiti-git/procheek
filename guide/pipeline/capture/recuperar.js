import { launch, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL } from '../config.mjs';

const flow = {
  slug: 'recuperar',
  title: 'Recuperar contraseña',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Solicitar enlace de recuperación',
      descEs: 'Si olvidaste tu contraseña, desde /forgot-password puedes solicitar un enlace por correo.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(800);
      },
      selectors: {
        a: 'h1, h2',
        b: 'input[type="email"]',
        c: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Título del formulario', desc: 'Sección de recuperación de contraseña.', color: '#059669' },
        b: { es: 'Correo registrado', desc: 'PROCHECK enviará un enlace único a este correo (válido 1 hora).', color: '#2563EB' },
        c: { es: 'Enviar enlace', desc: 'Genera y envía el correo con instrucciones.', color: '#DC2626' },
      },
    },
    {
      title: 'Confirmación de envío',
      descEs: 'Al enviar, PROCHECK confirma que el correo salió. Revisa tu bandeja de entrada (y spam).',
      setup: async (page) => {
        await page.fill('input[type="email"]', 'usuario@empresa.com').catch(() => {});
        const btn = page.locator('button[type="submit"]').first();
        if (await btn.count()) await btn.click().catch(() => {});
        await page.waitForTimeout(1500);
      },
      waitMs: 500,
      selectors: {
        a: 'h1, h2',
        b: 'p, .alert',
        c: 'a[href*="login"]',
      },
      labels: {
        a: { es: 'Mensaje de éxito', desc: 'Confirma que el correo fue enviado.', color: '#059669' },
        b: { es: 'Instrucciones', desc: 'Explica los siguientes pasos: revisar bandeja y hacer clic en el enlace.', color: '#2563EB' },
        c: { es: 'Volver al login', desc: 'Regresa a la pantalla de inicio.', color: '#FBB601' },
      },
    },
    {
      title: 'Nueva contraseña',
      descEs: 'Al hacer clic en el enlace del correo llegarás a esta pantalla. Define una contraseña nueva.',
      setup: async (page) => {
        // Show the reset page with a demo token — real flow uses a signed token.
        await page.goto(`${BASE_URL}/reset-password?token=demo-guide`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
      },
      waitMs: 500,
      selectors: {
        a: 'input[type="password"]',
        b: 'input[type="password"] + *, input[type="password"] ~ input[type="password"], form input[type="password"]:nth-of-type(2)',
        c: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Contraseña nueva', desc: 'Mínimo 8 caracteres con mayúscula, número y símbolo.', color: '#2563EB' },
        b: { es: 'Confirmar contraseña', desc: 'Debe coincidir con la anterior.', color: '#FBB601' },
        c: { es: 'Actualizar contraseña', desc: 'Guarda el cambio y te lleva al login.', color: '#DC2626' },
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
