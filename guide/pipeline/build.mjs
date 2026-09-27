/**
 * Reads every guide/data/*.json and renders per-role manuals + a landing page
 * into frontend/public/userguide/. After a normal frontend rebuild those files
 * become live at https://procheck.mx/userguide.html and /userguide/<role>.html.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIEWPORT } from './config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const SCREENS_SRC = path.resolve(__dirname, '../screens');
// Output goes into Next.js public/ so it deploys with the frontend.
const PUBLIC_DIR = path.resolve(__dirname, '../../frontend/public');
const OUT_ROOT = path.join(PUBLIC_DIR, 'userguide');
const OUT_SCREENS = path.join(OUT_ROOT, 'screens');
const OUT_LANDING = path.join(PUBLIC_DIR, 'userguide.html');

// Explicit order — matches the client's mental model.
const FLOW_ORDER = ['invitacion', 'login', 'recuperar', 'cursos', 'compra', 'certificados', 'verificar', 'biblioteca', 'cuenta', 'equipo', 'reportes', 'admin', 'trainer', 'vendedor'];

const SECTION_ICONS = {
  invitacion: 'bi-envelope-open',
  login: 'bi-box-arrow-in-right',
  recuperar: 'bi-key',
  cursos: 'bi-mortarboard',
  compra: 'bi-cart-check',
  certificados: 'bi-patch-check',
  verificar: 'bi-search',
  biblioteca: 'bi-book',
  cuenta: 'bi-person-gear',
  equipo: 'bi-people',
  reportes: 'bi-graph-up',
  admin: 'bi-shield-lock',
  trainer: 'bi-easel',
  vendedor: 'bi-briefcase',
};

// The 4 role manuals we ship. Each lists which roles it's intended for +
// which flows to include.
const ROLES = [
  {
    slug: 'empleado',
    title: 'Manual del Empleado',
    tagline: 'Comprar cursos, aceptar invitaciones, tomar cursos y descargar tu constancia DC-3.',
    icon: 'bi-person-workspace',
    color: '#059669',
    includeAudiences: ['employee'],
    flows: ['invitacion', 'login', 'recuperar', 'compra', 'cursos', 'certificados', 'verificar', 'biblioteca', 'cuenta'],
  },
  {
    slug: 'admin-cliente',
    title: 'Manual del Administrador',
    tagline: 'Gestión de equipo, reportes, cursos, certificados y datos fiscales de tu organización.',
    icon: 'bi-shield-lock',
    color: '#2563EB',
    includeAudiences: ['clientAdmin'],
    flows: ['login', 'recuperar', 'equipo', 'reportes', 'admin', 'compra', 'certificados', 'verificar', 'biblioteca', 'cuenta'],
  },
  {
    slug: 'capacitador',
    title: 'Manual del Capacitador',
    tagline: 'Sesiones, citas, perfil público y gestión de tu cuenta.',
    icon: 'bi-easel',
    color: '#FBB601',
    includeAudiences: ['trainer'],
    flows: ['login', 'recuperar', 'trainer', 'cuenta'],
  },
  {
    slug: 'vendedor',
    title: 'Manual del Vendedor',
    tagline: 'Leads, deals, comisiones, citas comerciales y gestión de cuenta.',
    icon: 'bi-briefcase',
    color: '#DC2626',
    includeAudiences: ['vendedor'],
    flows: ['login', 'recuperar', 'vendedor', 'cuenta'],
  },
];

async function loadFlows() {
  const files = await fs.readdir(DATA_DIR).catch(() => []);
  const flows = new Map();
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(DATA_DIR, f), 'utf-8');
    const flow = JSON.parse(raw);
    flows.set(flow.slug, flow);
  }
  return flows;
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Rewrite `screens/foo.png` -> `screens/foo.png` (kept relative — copied alongside). */
function relImage(imgPath) {
  return imgPath; // already screens/<file>
}

function renderAnnotation(ann) {
  const color = ann.color || '#0F1E3D';
  return `
    <rect x="${ann.box.x}" y="${ann.box.y}" width="${ann.box.w}" height="${ann.box.h}"
          fill="none" stroke="${color}" stroke-width="5" rx="10"/>
    <text x="${ann.box.x + 20}" y="${ann.box.y + 40}" font-family="ui-monospace, Menlo, monospace"
          font-weight="700" font-size="30" fill="${color}">${esc(ann.letter)})</text>
  `;
}

function renderLegend(annotations) {
  if (!annotations.length) return '';
  return `
    <div class="figure-legend">
      <ul class="list-unstyled mb-0">
        ${annotations
          .map(
            (a) => `
          <li class="d-flex gap-2 align-items-start">
            <span class="badge-letter" style="background:${a.color || '#FBB601'}">${esc(a.letter)}</span>
            <div>
              <strong>${esc(a.labelEs)}</strong>${a.descEs ? `<div class="text-body-secondary small">${esc(a.descEs)}</div>` : ''}
            </div>
          </li>`,
          )
          .join('')}
      </ul>
    </div>
  `;
}

function renderStep(flowSlug, step) {
  const stepId = `${flowSlug}-step-${step.n}`;
  return `
    <article class="step mb-5" id="${stepId}">
      <header class="d-flex align-items-baseline gap-3 mb-3">
        <span class="step-index">Paso ${step.n}</span>
        <h3 class="mb-0 fs-4">${esc(step.title)}</h3>
      </header>
      ${step.descEs ? `<p class="text-body-secondary mb-3">${esc(step.descEs)}</p>` : ''}
      <div class="figure-wrapper mb-3">
        <img src="${esc(relImage(step.image))}" alt="${esc(step.title)}" loading="lazy">
        <svg viewBox="0 0 ${VIEWPORT.width} ${VIEWPORT.height}" preserveAspectRatio="none" aria-hidden="true">
          ${(step.annotations || []).map(renderAnnotation).join('')}
        </svg>
      </div>
      ${renderLegend(step.annotations || [])}
    </article>
  `;
}

function renderFlow(flow) {
  const icon = SECTION_ICONS[flow.slug] || 'bi-file-earmark-text';
  return `
    <section class="flow py-5" id="${esc(flow.slug)}">
      <header class="mb-4">
        <div class="d-flex align-items-center gap-3 mb-2">
          <span class="section-icon"><i class="bi ${icon}"></i></span>
          <div>
            <div class="section-kicker">Sección</div>
            <h2 class="mb-0">${esc(flow.title)}</h2>
          </div>
        </div>
      </header>
      ${flow.steps.map((s) => renderStep(flow.slug, s)).join('')}
    </section>
  `;
}

function renderTOC(flows) {
  return `
    <ul class="list-unstyled sidebar-nav">
      ${flows
        .map(
          (f) => `
        <li>
          <a href="#${esc(f.slug)}" class="d-flex align-items-center gap-2">
            <i class="bi ${SECTION_ICONS[f.slug] || 'bi-file-earmark-text'}"></i>
            <span>${esc(f.title)}</span>
          </a>
        </li>`,
        )
        .join('')}
    </ul>
  `;
}

const SHARED_CSS = `
  :root {
    --brand-navy: #0F1E3D;
    --brand-gold: #FBB601;
    --brand-line: #e5e7eb;
  }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; }
  .cover {
    background: linear-gradient(135deg, #0F1E3D 0%, #1e293b 100%);
    color: #fff;
    padding: 5rem 0;
  }
  .cover .kicker { color: var(--brand-gold); letter-spacing: 0.2em; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; }
  .cover h1 { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.02em; margin: 0.5rem 0 1rem; }
  .cover .lead { color: rgba(255,255,255,0.75); max-width: 620px; }
  .navbar-manual { background: rgba(15, 30, 61, 0.98); backdrop-filter: blur(8px); }
  .navbar-manual .navbar-brand { color: #fff; font-weight: 700; }
  .navbar-manual .navbar-brand .accent { color: var(--brand-gold); }
  .back-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.85rem; }
  .back-link:hover { color: var(--brand-gold); }
  .sidebar { position: sticky; top: 5rem; max-height: calc(100vh - 6rem); overflow-y: auto; padding: 1.5rem 1rem; border-right: 1px solid var(--brand-line); }
  .sidebar-nav a { display: flex; padding: 0.55rem 0.75rem; border-radius: 8px; color: #4b5563; text-decoration: none; font-size: 0.9rem; transition: background 120ms, color 120ms; }
  .sidebar-nav a:hover { background: #f3f4f6; color: var(--brand-navy); }
  .sidebar-nav a.active { background: rgba(251, 182, 1, 0.12); color: var(--brand-navy); font-weight: 600; }
  .sidebar-nav i { color: var(--brand-gold); }
  .section-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(251, 182, 1, 0.12); color: var(--brand-gold); display: inline-flex; align-items: center; justify-content: center; font-size: 1.35rem; }
  .section-kicker { text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.72rem; color: #6b7280; font-weight: 600; }
  .flow h2 { font-weight: 700; letter-spacing: -0.02em; }
  .step-index { display: inline-block; background: var(--brand-navy); color: var(--brand-gold); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
  .figure-wrapper { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--brand-line); background: #f9fafb; box-shadow: 0 10px 40px -20px rgba(15, 30, 61, 0.35); }
  .figure-wrapper img { width: 100%; display: block; }
  .figure-wrapper svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .figure-legend { background: #fff; border: 1px solid var(--brand-line); border-radius: 12px; padding: 1rem 1.25rem; }
  .figure-legend ul { display: flex; flex-direction: column; gap: 0.75rem; }
  .badge-letter { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; color: #fff; font-family: ui-monospace, Menlo, monospace; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
  footer.doc-footer { background: var(--brand-navy); color: rgba(255,255,255,0.7); padding: 3rem 0; margin-top: 4rem; font-size: 0.85rem; }
  footer.doc-footer a { color: var(--brand-gold); }
`;

const SHARED_JS = `
  (function() {
    const links = document.querySelectorAll('.sidebar-nav a');
    const sections = Array.from(links).map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => obs.observe(s));
  })();
`;

function renderRoleDoc(role, flowMap, now) {
  const flows = role.flows.map((slug) => flowMap.get(slug)).filter(Boolean);
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(role.title)} · PROCHECK Solutions</title>
  <link rel="icon" href="/icon.png">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>${SHARED_CSS}</style>
</head>
<body>
  <nav class="navbar navbar-manual sticky-top">
    <div class="container-xl d-flex align-items-center gap-3">
      <a class="navbar-brand mb-0" href="/userguide.html">PROCHECK <span class="accent">Solutions</span> — Manuales</a>
      <a class="back-link ms-auto" href="/userguide.html"><i class="bi bi-arrow-left"></i> Todos los manuales</a>
    </div>
  </nav>

  <header class="cover" id="top">
    <div class="container-xl">
      <div class="d-flex align-items-center gap-3 mb-2">
        <span class="section-icon" style="background:${role.color}22;color:${role.color}"><i class="bi ${role.icon}"></i></span>
        <div class="kicker">${esc(role.title)}</div>
      </div>
      <h1>${esc(role.tagline)}</h1>
      <p class="lead">Sigue este manual paso a paso. Cada captura viene directo del sitio en vivo <a href="https://procheck.mx" style="color:var(--brand-gold)">procheck.mx</a>. Actualizado ${esc(now)}.</p>
    </div>
  </header>

  <div class="container-xl">
    <div class="row">
      <aside class="col-lg-3 d-none d-lg-block">
        <div class="sidebar">
          <div class="section-kicker mb-3">Contenido</div>
          ${renderTOC(flows)}
        </div>
      </aside>
      <main class="col-lg-9">
        ${flows.map(renderFlow).join('')}
      </main>
    </div>
  </div>

  <footer class="doc-footer">
    <div class="container-xl">
      Generado automáticamente desde capturas en vivo de <a href="https://procheck.mx">procheck.mx</a>.
      · <a href="/userguide.html">Volver al índice de manuales</a>
    </div>
  </footer>

  <script>${SHARED_JS}</script>
</body>
</html>`;
}

function renderLanding(now) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manuales de usuario · PROCHECK Solutions</title>
  <link rel="icon" href="/icon.png">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>${SHARED_CSS}
    .role-card {
      display: block;
      background: #fff;
      border: 1px solid var(--brand-line);
      border-radius: 18px;
      padding: 2rem;
      text-decoration: none;
      color: inherit;
      transition: transform 160ms, box-shadow 160ms, border-color 160ms;
      height: 100%;
    }
    .role-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px -20px rgba(15,30,61,0.25); border-color: var(--brand-gold); color: inherit; }
    .role-card .role-icon {
      width: 56px; height: 56px;
      border-radius: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.7rem;
      margin-bottom: 1rem;
    }
    .role-card h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
    .role-card .arrow { color: var(--brand-gold); font-weight: 700; margin-top: 1rem; display: inline-flex; align-items: center; gap: 0.4rem; }
  </style>
</head>
<body>
  <nav class="navbar navbar-manual sticky-top">
    <div class="container-xl d-flex align-items-center gap-3">
      <a class="navbar-brand mb-0" href="/userguide.html">PROCHECK <span class="accent">Solutions</span> — Manuales</a>
      <a class="back-link ms-auto" href="https://procheck.mx"><i class="bi bi-arrow-left"></i> Volver al sitio</a>
    </div>
  </nav>

  <header class="cover" id="top">
    <div class="container-xl">
      <div class="kicker">Centro de documentación</div>
      <h1>Manuales de usuario</h1>
      <p class="lead">Elige el manual que corresponde a tu rol. Cada guía muestra pantalla por pantalla cómo usar PROCHECK, con capturas directas del sistema en vivo.</p>
    </div>
  </header>

  <div class="container-xl py-5">
    <div class="row g-4">
      ${ROLES
        .map(
          (r) => `
        <div class="col-md-6 col-lg-6">
          <a class="role-card" href="/userguide/${esc(r.slug)}.html">
            <span class="role-icon" style="background:${r.color}18;color:${r.color}"><i class="bi ${r.icon}"></i></span>
            <h2>${esc(r.title)}</h2>
            <p class="text-body-secondary mb-0">${esc(r.tagline)}</p>
            <div class="arrow">Abrir manual <i class="bi bi-arrow-right"></i></div>
          </a>
        </div>`,
        )
        .join('')}
    </div>
  </div>

  <footer class="doc-footer">
    <div class="container-xl">
      Manuales generados automáticamente el ${esc(now)} desde capturas en vivo de <a href="https://procheck.mx">procheck.mx</a>.
    </div>
  </footer>
</body>
</html>`;
}

/** Copy guide/screens/*.png -> frontend/public/userguide/screens/. */
async function copyScreens() {
  await fs.mkdir(OUT_SCREENS, { recursive: true });
  const files = await fs.readdir(SCREENS_SRC);
  let copied = 0;
  for (const f of files) {
    if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
    await fs.copyFile(path.join(SCREENS_SRC, f), path.join(OUT_SCREENS, f));
    copied++;
  }
  return copied;
}

async function main() {
  const flowMap = await loadFlows();
  if (flowMap.size === 0) {
    console.error('No flows found in guide/data/. Run npm run capture:all first.');
    process.exit(1);
  }

  await fs.mkdir(OUT_ROOT, { recursive: true });
  const copied = await copyScreens();
  console.log(`Copied ${copied} screenshots into ${OUT_SCREENS}`);

  const now = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  // Landing page at /userguide.html
  await fs.writeFile(OUT_LANDING, renderLanding(now), 'utf-8');
  console.log(`Wrote ${OUT_LANDING}`);

  // Per-role docs at /userguide/<slug>.html
  for (const role of ROLES) {
    const html = renderRoleDoc(role, flowMap, now);
    const outPath = path.join(OUT_ROOT, `${role.slug}.html`);
    await fs.writeFile(outPath, html, 'utf-8');
    console.log(`Wrote ${outPath}  (${role.flows.length} flows)`);
  }

  console.log('\nDone. After the next frontend deploy the manuals will be live at:');
  console.log('  https://procheck.mx/userguide.html');
  for (const role of ROLES) {
    console.log(`  https://procheck.mx/userguide/${role.slug}.html`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
