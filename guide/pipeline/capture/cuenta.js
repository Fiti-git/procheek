import { launch, loginAs, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'cuenta',
  title: 'Mi cuenta',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Datos personales',
      descEs: 'Desde Mi cuenta actualizas tu nombre, correo, foto y datos de contacto.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/account`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
        await page.waitForTimeout(1000);
      },
      selectors: {
        a: 'input[name*="firstName" i], input[name*="name" i], input[type="text"]',
        b: 'input[type="email"]',
        c: 'button[type="submit"], button:has-text("Guardar")',
      },
      labels: {
        a: { es: 'Nombre', desc: 'Nombre y apellidos que aparecen en tus certificados DC-3.', color: '#059669' },
        b: { es: 'Correo', desc: 'Correo de acceso y notificaciones.', color: '#2563EB' },
        c: { es: 'Guardar cambios', desc: 'Persiste tus datos personales.', color: '#DC2626' },
      },
    },
    {
      title: 'Datos fiscales (RFC)',
      descEs: 'Si comprarás cursos con factura, registra aquí tu RFC y régimen fiscal.',
      setup: async (page) => {
        const el = page.locator('input[placeholder*="RFC" i], input[name*="rfc" i]').first();
        if (await el.count()) await el.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);
      },
      waitMs: 500,
      selectors: {
        a: 'input[placeholder*="RFC" i], input[name*="rfc" i]',
        b: 'select, [role="combobox"]',
        c: 'button[type="submit"], button:has-text("Guardar")',
      },
      labels: {
        a: { es: 'RFC', desc: 'Requerido para emitir factura CFDI 4.0.', color: '#2563EB' },
        b: { es: 'Régimen fiscal', desc: 'Selecciona el régimen que aparece en tu constancia SAT.', color: '#FBB601' },
        c: { es: 'Guardar', desc: 'Confirma los datos fiscales.', color: '#DC2626' },
      },
    },
    {
      title: 'Cambiar contraseña',
      descEs: 'Puedes cambiar tu contraseña en cualquier momento desde tu cuenta sin necesidad de correo.',
      setup: async (page) => {
        const el = page.locator('input[type="password"]').first();
        if (await el.count()) await el.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);
      },
      waitMs: 500,
      selectors: {
        a: 'input[type="password"]',
        b: 'input[type="password"] ~ input[type="password"]',
        c: 'button[type="submit"], button:has-text("Actualizar"), button:has-text("Cambiar")',
      },
      labels: {
        a: { es: 'Contraseña actual', desc: 'Confirma tu contraseña vigente para autorizar el cambio.', color: '#2563EB' },
        b: { es: 'Contraseña nueva', desc: 'Mínimo 8 caracteres con mayúscula, número y símbolo.', color: '#FBB601' },
        c: { es: 'Actualizar contraseña', desc: 'Aplica el cambio inmediatamente.', color: '#DC2626' },
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
