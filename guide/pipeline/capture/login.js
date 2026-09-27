import { launch, runFlow, dismissCookieBanner } from '../helpers.mjs';
import { BASE_URL, USERS } from '../config.mjs';

const flow = {
  slug: 'login',
  title: 'Iniciar sesión',
  roleAudience: ['employee', 'clientAdmin', 'trainer', 'vendedor'],
  steps: [
    {
      title: 'Pantalla de bienvenida',
      descEs: 'Al abrir procheck.mx/login verás la pantalla de bienvenida. Ingresa tu correo corporativo para continuar.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      selectors: {
        a: 'aside, [class*="brand" i]:has(img), .hidden.lg\\:flex:has(img)',
        b: 'input[type="email"], input[placeholder*="correo" i]',
        c: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Panel de bienvenida', desc: 'Marca visual y valor del producto.', color: '#059669' },
        b: { es: 'Correo corporativo', desc: 'Escribe el correo con el que fuiste invitado.', color: '#2563EB' },
        c: { es: 'Botón Continuar', desc: 'Envía el correo para avanzar al paso de contraseña.', color: '#DC2626' },
      },
    },
    {
      title: 'Correo capturado',
      descEs: 'Una vez capturado el correo, verifica que sea el correcto y presiona Continuar.',
      setup: async (page) => {
        await page.fill('input[type="email"]', USERS.admin.email);
      },
      waitMs: 300,
      selectors: {
        a: 'input[type="email"]',
        b: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Correo listo', desc: 'Comprueba que el correo mostrado sea el tuyo.', color: '#059669' },
        b: { es: 'Continuar', desc: 'Avanza al paso de contraseña.', color: '#DC2626' },
      },
    },
    {
      title: 'Ingreso de contraseña',
      descEs: 'PROCHECK te pedirá tu contraseña. Es el mismo campo cifrado usado en toda la plataforma.',
      setup: async (page) => {
        await page.locator('form').evaluate((f) => f.requestSubmit());
        await page.waitForSelector('input[type="password"]', { timeout: 5000 });
      },
      selectors: {
        a: 'input[type="password"]',
        b: 'button[type="submit"]',
        c: 'a[href*="forgot-password"]',
      },
      labels: {
        a: { es: 'Contraseña', desc: 'Ingresa tu contraseña personal.', color: '#2563EB' },
        b: { es: 'Iniciar sesión', desc: 'Envía las credenciales para autenticarte.', color: '#DC2626' },
        c: { es: '¿Olvidaste tu contraseña?', desc: 'Enlace al flujo de recuperación por correo.', color: '#059669' },
      },
    },
    {
      title: 'Contraseña capturada',
      descEs: 'Antes de enviar, verifica el ícono de mostrar contraseña si necesitas confirmar lo escrito.',
      setup: async (page) => {
        await page.fill('input[type="password"]', USERS.admin.password);
      },
      waitMs: 300,
      selectors: {
        a: 'input[type="password"]',
        b: 'button[type="submit"]',
      },
      labels: {
        a: { es: 'Contraseña ingresada', desc: 'El campo cifra automáticamente los caracteres.', color: '#059669' },
        b: { es: 'Iniciar sesión', desc: 'Enviar credenciales.', color: '#DC2626' },
      },
    },
    {
      title: 'Panel al iniciar sesión',
      descEs: 'Al autenticarte, PROCHECK te lleva a tu panel principal. La estructura de la izquierda es tu menú permanente.',
      setup: async (page) => {
        await page.locator('input[type="password"]').first().evaluate((el) => el.form?.requestSubmit());
        await page.waitForURL((url) => /\/dashboard/.test(url.toString()), { timeout: 10000 });
        await page.waitForTimeout(1200);
      },
      selectors: {
        a: 'aside, [class*="sidebar" i]',
        b: 'header',
        c: 'main, main.marketing-main, [class*="dashboard-content"]',
      },
      labels: {
        a: { es: 'Menú lateral', desc: 'Acceso permanente a cursos, certificados, equipo, reportes y biblioteca.', color: '#059669' },
        b: { es: 'Barra superior', desc: 'Búsqueda global, notificaciones y menú de usuario.', color: '#2563EB' },
        c: { es: 'Área de trabajo', desc: 'El contenido de cada sección se despliega aquí.', color: '#DC2626' },
      },
    },
    {
      title: 'Recuperación de contraseña',
      descEs: 'Si olvidaste tu contraseña, desde la pantalla de contraseña puedes solicitar un enlace de recuperación por correo.',
      setup: async (page) => {
        await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
        await dismissCookieBanner(page);
      },
      selectors: {
        a: 'input[type="email"]',
        b: 'button[type="submit"]',
        c: 'a[href*="login"]',
      },
      labels: {
        a: { es: 'Correo registrado', desc: 'PROCHECK enviará un enlace único a este correo.', color: '#2563EB' },
        b: { es: 'Enviar enlace', desc: 'Solicita el correo con instrucciones.', color: '#DC2626' },
        c: { es: 'Volver a iniciar sesión', desc: 'Regresa al login si recuerdas tu contraseña.', color: '#059669' },
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
