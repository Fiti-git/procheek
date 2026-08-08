import PDFDocument from 'pdfkit';
import type { CourseStats, LearnerStats, OverviewStats } from './analytics.service';

const fmtMxn = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function fmtWatch(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export interface AnalyticsPdfData {
  overview: OverviewStats;
  courses: CourseStats[];
  learners: LearnerStats[];
  scopeLabel: string;
}

export function renderAnalyticsPdf(data: AnalyticsPdfData): NodeJS.ReadableStream {
  const doc = new PDFDocument({ size: 'LETTER', margin: 40 });

  doc.fillColor('#1e3a8a').fontSize(20).font('Helvetica-Bold').text('PROCHEECK — Reporte', 40, 40);
  doc.fillColor('#64748b').fontSize(9).font('Helvetica')
     .text(data.scopeLabel, 40, 66);
  doc.text(new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }), 40, 78);

  // Overview cards.
  let y = 110;
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Resumen', 40, y);
  y += 18;
  const cards = [
    ['Ingresos',              fmtMxn(data.overview.revenueMxn)],
    ['Inscripciones',         String(data.overview.enrollments)],
    ['Completados',           String(data.overview.completions)],
    ['Certificados',          String(data.overview.certificates)],
    ['Tasa de aprobación',    data.overview.passRate != null ? `${data.overview.passRate}%` : '—'],
    ['Video visto (prom.)',   data.overview.avgWatchPct != null ? `${data.overview.avgWatchPct}%` : '—'],
  ];
  const cardW = 165, cardH = 44, gap = 8;
  cards.forEach(([label, value], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * (cardW + gap);
    const yy = y + row * (cardH + gap);
    doc.roundedRect(x, yy, cardW, cardH, 4).fillOpacity(1).fillAndStroke('#f1f5f9', '#e2e8f0');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(label, x + 10, yy + 8);
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(value, x + 10, yy + 22);
  });
  y += Math.ceil(cards.length / 3) * (cardH + gap) + 10;

  // Courses table.
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Por curso', 40, y);
  y += 16;
  const courseCols = [
    { k: 'title',           label: 'Curso',                 w: 220 },
    { k: 'enrollments',     label: 'Inscritos',             w: 60, align: 'right' as const },
    { k: 'completionRate',  label: '% completado',          w: 90, align: 'right' as const },
    { k: 'avgQuizScore',    label: 'Quiz prom.',            w: 70, align: 'right' as const },
    { k: 'avgWatchPct',     label: 'Video prom.',           w: 70, align: 'right' as const },
  ];
  drawTableHeader(doc, 40, y, courseCols);
  y += 18;
  for (const c of data.courses) {
    if (y > doc.page.height - 60) { doc.addPage(); y = 40; drawTableHeader(doc, 40, y, courseCols); y += 18; }
    drawRow(doc, 40, y, courseCols, {
      title: c.title,
      enrollments: c.enrollments,
      completionRate: `${c.completions}/${c.enrollments} · ${c.completionRate}%`,
      avgQuizScore: c.avgQuizScore != null ? `${c.avgQuizScore}%` : '—',
      avgWatchPct: c.avgWatchPct != null ? `${c.avgWatchPct}%` : '—',
    });
    y += 18;
  }

  y += 10;
  if (y > doc.page.height - 100) { doc.addPage(); y = 40; }

  // Learners table.
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Por aprendiz', 40, y);
  y += 16;
  const learnerCols = [
    { k: 'fullName',      label: 'Aprendiz',        w: 180 },
    { k: 'email',         label: 'Correo',          w: 170 },
    { k: 'enrollments',   label: 'Insc.',           w: 45, align: 'right' as const },
    { k: 'completions',   label: 'Comp.',           w: 50, align: 'right' as const },
    { k: 'certificates',  label: 'Cert.',           w: 45, align: 'right' as const },
    { k: 'totalWatchSec', label: 'Visto',           w: 60, align: 'right' as const },
  ];
  drawTableHeader(doc, 40, y, learnerCols);
  y += 18;
  for (const l of data.learners.slice(0, 100)) {
    if (y > doc.page.height - 60) { doc.addPage(); y = 40; drawTableHeader(doc, 40, y, learnerCols); y += 18; }
    drawRow(doc, 40, y, learnerCols, {
      fullName: l.fullName,
      email: l.email,
      enrollments: l.enrollments,
      completions: l.completions,
      certificates: l.certificates,
      totalWatchSec: fmtWatch(l.totalWatchSec),
    });
    y += 18;
  }

  doc.end();
  return doc;
}

type Col = { k: string; label: string; w: number; align?: 'left' | 'right' };

function drawTableHeader(doc: PDFKit.PDFDocument, x: number, y: number, cols: Col[]) {
  doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold');
  let cx = x;
  for (const c of cols) {
    doc.text(c.label.toUpperCase(), cx, y, { width: c.w, align: c.align ?? 'left' });
    cx += c.w;
  }
  doc.moveTo(x, y + 12).lineTo(cx, y + 12).strokeColor('#cbd5e1').stroke();
}

function drawRow(doc: PDFKit.PDFDocument, x: number, y: number, cols: Col[], row: Record<string, unknown>) {
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica');
  let cx = x;
  for (const c of cols) {
    doc.text(String(row[c.k] ?? '—'), cx, y, { width: c.w, align: c.align ?? 'left' });
    cx += c.w;
  }
}
