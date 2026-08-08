import PDFDocument from 'pdfkit';

export interface CertificatePdfData {
  code: string;
  holder: string;
  courseTitle: string;
  nomReference: string | null;
  dc3Folio: string | null;
  issuedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  verifyUrl: string;
}

export function renderCertificatePdf(data: CertificatePdfData): NodeJS.ReadableStream {
  const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 50 });

  // Border
  doc.lineWidth(4).strokeColor('#1e3a8a');
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
  doc.lineWidth(1).strokeColor('#94a3b8');
  doc.rect(42, 42, doc.page.width - 84, doc.page.height - 84).stroke();

  // Header
  doc.fillColor('#1e3a8a').fontSize(28).font('Helvetica-Bold')
     .text('PROCHEECK', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica').fillColor('#475569')
     .text('Constancia de habilidades laborales', { align: 'center' });
  if (data.nomReference) {
    doc.moveDown(0.1);
    doc.text(data.nomReference, { align: 'center' });
  }

  doc.moveDown(1.5);
  doc.fontSize(13).fillColor('#334155')
     .text('Se otorga la presente constancia a', { align: 'center' });
  doc.moveDown(0.6);
  doc.fontSize(30).font('Helvetica-Bold').fillColor('#0f172a')
     .text(data.holder, { align: 'center' });

  doc.moveDown(0.8);
  doc.fontSize(13).font('Helvetica').fillColor('#334155')
     .text('por acreditar el curso', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a')
     .text(data.courseTitle, { align: 'center' });

  // Details block
  const detailsY = doc.y + 40;
  doc.fontSize(10).font('Helvetica').fillColor('#475569');

  const leftX = 100;
  const rightX = doc.page.width / 2 + 20;

  doc.text('Fecha de emisión', leftX, detailsY);
  doc.font('Helvetica-Bold').fillColor('#0f172a')
     .text(data.issuedAt.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
           leftX, detailsY + 12);

  if (data.expiresAt) {
    doc.font('Helvetica').fillColor('#475569').text('Válido hasta', rightX, detailsY);
    doc.font('Helvetica-Bold').fillColor('#0f172a')
       .text(data.expiresAt.toLocaleDateString('es-MX'), rightX, detailsY + 12);
  }

  if (data.dc3Folio) {
    doc.font('Helvetica').fillColor('#475569').text('Folio DC-3', leftX, detailsY + 40);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(data.dc3Folio, leftX, detailsY + 52);
  }

  // Code + verify block at bottom
  const bottomY = doc.page.height - 100;
  doc.fontSize(9).font('Helvetica').fillColor('#64748b')
     .text('Código de verificación', 50, bottomY, { align: 'center', width: doc.page.width - 100 });
  doc.fontSize(16).font('Courier-Bold').fillColor('#0f172a')
     .text(data.code, 50, bottomY + 12, { align: 'center', width: doc.page.width - 100 });
  doc.fontSize(8).font('Helvetica').fillColor('#64748b')
     .text(`Verificar en ${data.verifyUrl}`, 50, bottomY + 40,
           { align: 'center', width: doc.page.width - 100 });

  if (data.revokedAt) {
    doc.save();
    doc.rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] });
    doc.fontSize(80).fillColor('#dc2626').opacity(0.35).font('Helvetica-Bold')
       .text('REVOCADO', 0, doc.page.height / 2 - 40, { align: 'center', width: doc.page.width });
    doc.opacity(1);
    doc.restore();
  }

  doc.end();
  return doc;
}

export interface InvoicePdfData {
  number: string;
  issuedAt: Date;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string | null;
  buyerRfc: string | null;
  cfdiUuid: string | null;
  lines: Array<{ description: string; qty: number; unitPriceMxn: number }>;
  subtotalMxn: number;
  taxMxn: number;
  totalMxn: number;
  paidAt: Date | null;
}

const fmtMxn = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export function renderInvoicePdf(data: InvoicePdfData): NodeJS.ReadableStream {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e3a8a').text('PROCHEECK', 50, 50);
  doc.fontSize(9).font('Helvetica').fillColor('#475569')
     .text('Capacitación y certificación en seguridad', 50, 76);

  const rightBoxX = doc.page.width - 240;
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#0f172a').text('FACTURA', rightBoxX, 50);
  doc.fontSize(10).font('Helvetica').fillColor('#334155')
     .text(data.number, rightBoxX, 76);
  doc.text(data.issuedAt.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
           rightBoxX, 90);
  if (data.paidAt) {
    doc.fillColor('#059669').text('PAGADA', rightBoxX, 106);
  }

  // Buyer block
  doc.moveTo(50, 140).lineTo(doc.page.width - 50, 140).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('FACTURAR A', 50, 155);
  doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text(data.buyerName, 50, 170);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(data.buyerEmail, 50, 186);
  if (data.buyerCompany) doc.text(data.buyerCompany, 50, 202);
  if (data.buyerRfc) doc.text(`RFC: ${data.buyerRfc}`, 50, 218);

  // Line items header
  const tableTop = 260;
  doc.fontSize(9).fillColor('#64748b').font('Helvetica-Bold');
  doc.text('DESCRIPCIÓN', 50, tableTop);
  doc.text('CANT', 340, tableTop, { width: 40, align: 'right' });
  doc.text('P. UNIT.', 390, tableTop, { width: 70, align: 'right' });
  doc.text('IMPORTE', 470, tableTop, { width: 90, align: 'right' });
  doc.moveTo(50, tableTop + 14).lineTo(doc.page.width - 50, tableTop + 14)
     .strokeColor('#cbd5e1').stroke();

  let y = tableTop + 24;
  doc.fontSize(10).font('Helvetica').fillColor('#0f172a');
  for (const l of data.lines) {
    doc.text(l.description, 50, y, { width: 280 });
    doc.text(String(l.qty), 340, y, { width: 40, align: 'right' });
    doc.text(fmtMxn(l.unitPriceMxn), 390, y, { width: 70, align: 'right' });
    doc.text(fmtMxn(l.unitPriceMxn * l.qty), 470, y, { width: 90, align: 'right' });
    y += 22;
  }

  // Totals block
  y += 20;
  doc.moveTo(340, y).lineTo(doc.page.width - 50, y).strokeColor('#cbd5e1').stroke();
  y += 10;
  doc.fontSize(10).fillColor('#334155').font('Helvetica').text('Subtotal', 390, y, { width: 70, align: 'right' });
  doc.text(fmtMxn(data.subtotalMxn), 470, y, { width: 90, align: 'right' });
  y += 16;
  doc.text('IVA (16%)', 390, y, { width: 70, align: 'right' });
  doc.text(fmtMxn(data.taxMxn), 470, y, { width: 90, align: 'right' });
  y += 18;
  doc.moveTo(390, y).lineTo(doc.page.width - 50, y).strokeColor('#0f172a').lineWidth(1).stroke();
  y += 8;
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a')
     .text('TOTAL', 390, y, { width: 70, align: 'right' });
  doc.text(fmtMxn(data.totalMxn), 470, y, { width: 90, align: 'right' });

  if (data.cfdiUuid) {
    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text(`CFDI UUID: ${data.cfdiUuid}`, 50, doc.page.height - 80);
  }
  doc.fontSize(8).fillColor('#94a3b8')
     .text('Documento generado electrónicamente por PROCHEECK.',
           50, doc.page.height - 60, { align: 'center', width: doc.page.width - 100 });

  doc.end();
  return doc;
}
