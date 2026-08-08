// One-off: append a new sheet with the 2026-07-13 status updates.
// Usage: node scripts/refresh-build-status.js
const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'document', 'build-status.xlsx');
const SHEET_NAME = 'Update 2026-07-13';

const updates = [
  { area: 'Ops',        item: 'Frontend containerized',        status: 'DONE', notes: 'docker-compose builds & runs Next.js standalone image on port 3000' },
  { area: 'Ops',        item: 'Automated DB backups',          status: 'DONE', notes: 'pg_dump daily 03:00 UTC, 14-day retention (configurable), separate volume' },
  { area: 'Ops',        item: 'GitHub Actions CI',             status: 'DONE', notes: 'Backend build, frontend build, docker compose build on push/PR' },
  { area: 'Ops',        item: 'Production env template + deploy guide', status: 'DONE', notes: '.env.production.example + DEPLOY.md with Caddy reverse-proxy example' },
  { area: 'Ops',        item: 'Sentry integration',            status: 'DONE', notes: 'Backend + frontend; opt-in via SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN' },
  { area: 'Backend',    item: 'Swagger / OpenAPI docs',        status: 'DONE', notes: 'GET /api/docs; toggle with SWAGGER_ENABLED=false in prod' },
  { area: 'Backend',    item: 'Certificate expiry reminders',  status: 'DONE', notes: 'Cron 08:00 daily; emails & in-app notifications at 30 / 15 / 1 day out' },
  { area: 'Backend',    item: 'Admin audit log',               status: 'DONE', notes: 'audit_log table + GET /api/audit; logs cert issue/revoke, user invite/update/deactivate, company create/update/delete, course create/update/publish/unpublish/delete' },
  { area: 'Backend',    item: 'DB seed extended',              status: 'DONE', notes: 'Now seeds 5 published NOM courses (009, 017, 002, 019, 036) alongside 5 demo users' },
  { area: 'Frontend',   item: 'Support widget on dashboard',   status: 'DONE', notes: 'Users can open tickets from any dashboard page' },
  { area: 'Frontend',   item: 'Modal replaces confirm()',      status: 'DONE', notes: 'Recertification & certificate revocation now use branded dialogs' },
  { area: 'Frontend',   item: 'Consulting & Software pages',   status: 'DONE', notes: 'Marketing copy placeholders (may swap once client provides real copy)' },
  { area: 'Frontend',   item: 'Audit log viewer',              status: 'DONE', notes: 'New /dashboard/principal-admin/audit page; search + expandable metadata' },
  { area: 'Blocked',    item: 'Real NOM course content',       status: 'BLOCKED', notes: 'Need videos, materials, quiz banks from client' },
  { area: 'Blocked',    item: 'Payment gateway',               status: 'BLOCKED', notes: 'Stripe / Mercado Pago / Conekta — client to pick' },
  { area: 'Blocked',    item: 'CFDI e-invoice provider',       status: 'BLOCKED', notes: 'Currently plain PDF; needs SAT-stamped CFDI via Facturama/SW/Solcedi' },
  { area: 'Blocked',    item: 'DC-3 exact format',             status: 'BLOCKED', notes: 'Need folio numbering scheme, agent seal, signatures from client' },
  { area: 'Blocked',    item: 'Hosting choice',                status: 'BLOCKED', notes: 'AWS / DigitalOcean / Vercel+Railway — deploy guide is provider-agnostic' },
  { area: 'Blocked',    item: 'Pricing model',                 status: 'BLOCKED', notes: 'Per-seat / per-course / subscription — affects Team page "available seats"' },
  { area: 'Blocked',    item: 'Legal texts',                   status: 'BLOCKED', notes: 'Terms, Privacy, Aviso de Privacidad from client legal team' },
  { area: 'Blocked',    item: 'Live chat tool',                status: 'BLOCKED', notes: 'Intercom / Crisp / Tawk — client to pick; slot is ready in the layout' },
  { area: 'Blocked',    item: 'Brand assets',                  status: 'BLOCKED', notes: 'Logo files, brand colors beyond primary blue' },
  { area: 'Blocked',    item: 'Domain + SSL',                  status: 'BLOCKED', notes: 'Waiting on domain choice; Caddy config in DEPLOY.md handles TLS automatically' },
];

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  const existing = wb.getWorksheet(SHEET_NAME);
  if (existing) wb.removeWorksheet(existing.id);

  const ws = wb.addWorksheet(SHEET_NAME, { views: [{ state: 'frozen', ySplit: 2 }] });

  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = 'PROCHEECK — Build status update (2026-07-13)';
  ws.getCell('A1').font = { bold: true, size: 14 };

  ws.getRow(2).values = ['Area', 'Item', 'Status', 'Notes'];
  ws.getRow(2).font = { bold: true };
  ws.getRow(2).eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  });

  ws.columns = [
    { key: 'area', width: 14 },
    { key: 'item', width: 40 },
    { key: 'status', width: 12 },
    { key: 'notes', width: 80 },
  ];

  updates.forEach((u) => {
    const row = ws.addRow([u.area, u.item, u.status, u.notes]);
    const statusCell = row.getCell(3);
    if (u.status === 'DONE') statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    if (u.status === 'BLOCKED') statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    row.getCell(4).alignment = { wrapText: true, vertical: 'top' };
  });

  await wb.xlsx.writeFile(FILE);
  console.log(`Wrote sheet "${SHEET_NAME}" with ${updates.length} rows to ${FILE}`);
})();
