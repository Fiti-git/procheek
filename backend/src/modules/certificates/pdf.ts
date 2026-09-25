import PDFDocument from 'pdfkit';

/* -------------------------------------------------------------------------- */
/*  DC-3 renderer — production-grade STPS layout                              */
/* -------------------------------------------------------------------------- */

const COLOR = {
  navy: '#0F1E3D',
  gold: '#FBB601',
  goldDark: '#D99A00',
  ink: '#2B3441',
  inkSoft: '#5B6472',
  cream: '#F7F1DC',
  line: '#D8D2BC',
  white: '#FFFFFF',
};

export interface Dc3PdfData {
  folio: string;
  holderName: string;
  holderCurp?: string | null;
  courseName: string;
  nomCode: string; // e.g. "NOM-009"
  hours: number;
  issuedAt: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  stpsRegistration?: string | null;
  trainerName?: string;
  companyName?: string;
}

function fmtDateLong(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, y, mm, d] = m;
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${parseInt(d, 10)} de ${months[parseInt(mm, 10) - 1]} de ${y}`;
}

function fmtDateShort(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, y, mm, d] = m;
  return `${d}/${mm}/${y}`;
}

function vigenciaLabel(issued: string, expires: string) {
  const a = new Date(issued);
  const b = new Date(expires);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return '—';
  const months = Math.round(
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()),
  );
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? '1 año' : `${years} años`;
  }
  return `${months} meses`;
}

export function renderDc3Pdf(data: Dc3PdfData): NodeJS.ReadableStream {
  // A4 portrait, no auto margin — we lay everything out by hand.
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
    Title: `DC-3 ${data.folio}`,
    Author: 'PROCHECK Safety',
    Subject: 'Constancia de Competencias y Habilidades Laborales',
    Keywords: 'DC-3, STPS, NOM, capacitación, seguridad',
  }});

  const W = doc.page.width;   // 595
  const H = doc.page.height;  // 842
  const PAD = 40;

  /* ---------------- Header band (navy) ---------------- */
  const headerH = 96;
  doc.rect(0, 0, W, headerH).fill(COLOR.navy);

  // Left: brand + title
  doc
    .fillColor(COLOR.gold)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('PROCHECK SAFETY', PAD, 22, { characterSpacing: 2 });

  doc
    .fillColor(COLOR.white)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text('CONSTANCIA DE COMPETENCIAS', PAD, 40, { characterSpacing: 0.5 });
  doc
    .fillColor(COLOR.white)
    .font('Helvetica-Bold')
    .fontSize(15)
    .text('Y HABILIDADES LABORALES', PAD, 58, { characterSpacing: 0.5 });

  // Right: DC-3 badge
  const badgeW = 110;
  const badgeH = 62;
  const badgeX = W - PAD - badgeW;
  const badgeY = 18;
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6).fill(COLOR.gold);
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('FORMATO', badgeX, badgeY + 10, { width: badgeW, align: 'center', characterSpacing: 2 });
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(34)
    .text('DC-3', badgeX, badgeY + 22, { width: badgeW, align: 'center' });

  /* ---------------- Sub-header (gold) ---------------- */
  const subH = 22;
  doc.rect(0, headerH, W, subH).fill(COLOR.gold);
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(
      'FORMATO OFICIAL STPS  ·  NORMA OFICIAL MEXICANA APLICABLE  ·  LEY FEDERAL DEL TRABAJO ART. 153-V',
      PAD,
      headerH + 7,
      { width: W - PAD * 2, align: 'center', characterSpacing: 1 },
    );

  /* ---------------- Watermark ---------------- */
  doc.save();
  doc.rotate(-30, { origin: [W / 2, H / 2] });
  doc
    .fillColor(COLOR.gold)
    .opacity(0.05)
    .font('Helvetica-Bold')
    .fontSize(120)
    .text('COPIA VÁLIDA', 0, H / 2 - 60, { width: W, align: 'center' });
  doc.opacity(1);
  doc.restore();

  /* ---------------- Body ---------------- */
  let y = headerH + subH + 24;

  // Intro sentence
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(10)
    .text(
      'La presente constancia se expide en cumplimiento del artículo 153-V de la Ley Federal del Trabajo y la Norma Oficial Mexicana aplicable, para hacer constar que el (la) trabajador(a):',
      PAD,
      y,
      { width: W - PAD * 2, align: 'justify', lineGap: 2 },
    );
  y = doc.y + 14;

  // Recipient name — big centered
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(data.holderName.toUpperCase(), PAD, y, {
      width: W - PAD * 2,
      align: 'center',
    });
  y = doc.y + 4;

  // Underline
  doc
    .moveTo(PAD + 60, y + 2)
    .lineTo(W - PAD - 60, y + 2)
    .lineWidth(0.8)
    .strokeColor(COLOR.gold)
    .stroke();
  y += 10;

  // CURP (if any)
  if (data.holderCurp) {
    doc
      .fillColor(COLOR.inkSoft)
      .font('Helvetica')
      .fontSize(9)
      .text(`CURP: `, PAD, y, { continued: true, width: W - PAD * 2, align: 'center' })
      .fillColor(COLOR.ink)
      .font('Helvetica-Bold')
      .text(data.holderCurp);
    y = doc.y + 8;
  } else {
    y += 4;
  }

  // Divider
  doc
    .moveTo(PAD, y)
    .lineTo(W - PAD, y)
    .lineWidth(0.5)
    .strokeColor(COLOR.line)
    .stroke();
  y += 18;

  // "CURSO IMPARTIDO"
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('HA ACREDITADO EL CURSO DE CAPACITACIÓN:', PAD, y, {
      width: W - PAD * 2,
      align: 'center',
      characterSpacing: 2,
    });
  y = doc.y + 8;

  // Cream card containing NOM + course title + hours
  const cardX = PAD;
  const cardY = y;
  const cardW = W - PAD * 2;
  const cardH = 116;
  doc.roundedRect(cardX, cardY, cardW, cardH, 8).fill(COLOR.cream);
  doc
    .roundedRect(cardX, cardY, cardW, cardH, 8)
    .lineWidth(0.6)
    .strokeColor(COLOR.line)
    .stroke();

  // Gold pill with NOM code
  const pillW = 130;
  const pillH = 22;
  const pillX = cardX + cardW / 2 - pillW / 2;
  const pillY = cardY + 14;
  doc.roundedRect(pillX, pillY, pillW, pillH, 11).fill(COLOR.navy);
  doc
    .fillColor(COLOR.gold)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(data.nomCode.toUpperCase(), pillX, pillY + 6, { width: pillW, align: 'center', characterSpacing: 1.5 });

  // Course title
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(data.courseName, cardX + 20, pillY + pillH + 12, {
      width: cardW - 40,
      align: 'center',
      lineGap: 2,
    });

  // Hours line
  const hoursY = cardY + cardH - 22;
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(9)
    .text('Duración: ', cardX, hoursY, { width: cardW, align: 'center', continued: true, characterSpacing: 1 })
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(`${data.hours} HORAS`);

  y = cardY + cardH + 18;

  /* ---------------- Two-column details ---------------- */
  const colW = (W - PAD * 2 - 20) / 2;
  const leftX = PAD;
  const rightX = PAD + colW + 20;

  // Left: certificate details
  drawSectionHeader(doc, 'DATOS DEL CERTIFICADO', leftX, y, colW);
  drawKV(doc, 'Folio', data.folio, leftX, y + 16, colW, true);
  drawKV(doc, 'Fecha de emisión', fmtDateLong(data.issuedAt), leftX, y + 40, colW);
  drawKV(doc, 'Fecha de vencimiento', fmtDateLong(data.expiresAt), leftX, y + 64, colW);
  drawKV(doc, 'Vigencia', vigenciaLabel(data.issuedAt, data.expiresAt), leftX, y + 88, colW);

  // Right: agent / trainer / company details
  drawSectionHeader(doc, 'AGENTE CAPACITADOR', rightX, y, colW);
  drawKV(
    doc,
    'Razón social',
    data.companyName || 'PROCHECK Safety S.A. de C.V.',
    rightX,
    y + 16,
    colW,
  );
  drawKV(
    doc,
    'Registro STPS',
    data.stpsRegistration || 'En proceso de registro',
    rightX,
    y + 40,
    colW,
    true,
  );
  if (data.trainerName) {
    drawKV(doc, 'Instructor', data.trainerName, rightX, y + 64, colW);
  }
  drawKV(doc, 'Modalidad', 'Presencial / En línea', rightX, y + 88, colW);

  y += 118;

  /* ---------------- Signature block ---------------- */
  const sigY = y + 20;
  const sigLineY = sigY + 44;
  const sigColW = (W - PAD * 2 - 60) / 2;

  // Left signature — trainer
  doc
    .moveTo(leftX + 10, sigLineY)
    .lineTo(leftX + sigColW - 10, sigLineY)
    .lineWidth(0.8)
    .strokeColor(COLOR.ink)
    .stroke();
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(
      (data.trainerName || 'Instructor Autorizado').toUpperCase(),
      leftX + 10,
      sigLineY + 6,
      { width: sigColW - 20, align: 'center' },
    );
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(8)
    .text(
      'Instructor / Agente Capacitador Externo',
      leftX + 10,
      sigLineY + 18,
      { width: sigColW - 20, align: 'center' },
    );

  // Right signature — worker
  const rightSigX = W - PAD - sigColW;
  doc
    .moveTo(rightSigX + 10, sigLineY)
    .lineTo(rightSigX + sigColW - 10, sigLineY)
    .lineWidth(0.8)
    .strokeColor(COLOR.ink)
    .stroke();
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(data.holderName.toUpperCase(), rightSigX + 10, sigLineY + 6, {
      width: sigColW - 20,
      align: 'center',
    });
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(8)
    .text('Trabajador(a)', rightSigX + 10, sigLineY + 18, {
      width: sigColW - 20,
      align: 'center',
    });

  /* ---------------- Verification box (bottom right) ---------------- */
  const verifBoxW = 150;
  const verifBoxH = 78;
  const verifX = W - PAD - verifBoxW;
  const verifY = H - 130 - verifBoxH;

  // QR placeholder square
  const qrSize = 62;
  const qrX = PAD;
  const qrY = verifY - 4;
  doc
    .roundedRect(qrX, qrY, qrSize, qrSize, 4)
    .lineWidth(0.8)
    .strokeColor(COLOR.navy)
    .stroke();
  // Draw a light "QR" grid pattern as a placeholder
  const cells = 7;
  const cell = qrSize / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // deterministic pattern based on folio hash
      const h = (r * 31 + c * 17 + data.folio.charCodeAt((r + c) % data.folio.length)) % 3;
      if (h === 0) {
        doc.rect(qrX + c * cell + 2, qrY + r * cell + 2, cell - 2, cell - 2).fill(COLOR.navy);
      }
    }
  }
  // Corner markers
  const mk = cell * 2 + 2;
  [[qrX, qrY], [qrX + qrSize - mk - 2, qrY], [qrX, qrY + qrSize - mk - 2]].forEach(([mx, my]) => {
    doc.rect(mx + 2, my + 2, mk, mk).fill(COLOR.white);
    doc.rect(mx + 4, my + 4, mk - 4, mk - 4).fill(COLOR.navy);
    doc.rect(mx + 8, my + 8, mk - 12, mk - 12).fill(COLOR.white);
  });

  // Verify text next to QR
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(8)
    .text('VERIFICA ESTE CERTIFICADO EN:', qrX + qrSize + 10, qrY + 8, {
      characterSpacing: 1,
    });
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('procheck.mx/verificar', qrX + qrSize + 10, qrY + 20);
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(8)
    .text('Folio de verificación:', qrX + qrSize + 10, qrY + 36);
  doc
    .fillColor(COLOR.ink)
    .font('Courier-Bold')
    .fontSize(9)
    .text(data.folio, qrX + qrSize + 10, qrY + 48);

  /* ---------------- Footer band ---------------- */
  const footerH = 60;
  doc.rect(0, H - footerH, W, footerH).fill(COLOR.navy);

  doc
    .fillColor(COLOR.white)
    .font('Helvetica')
    .fontSize(7.5)
    .text(
      'Este certificado se expide conforme al artículo 153-V de la Ley Federal del Trabajo y la Norma Oficial Mexicana aplicable en materia de seguridad y salud en el trabajo. Su falsificación es delito conforme al Código Penal Federal.',
      PAD,
      H - footerH + 10,
      { width: W - PAD * 2, align: 'center', lineGap: 1.5 },
    );

  doc
    .fillColor(COLOR.gold)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('PROCHECK SAFETY', PAD, H - 18, { characterSpacing: 2 });
  doc
    .fillColor(COLOR.white)
    .font('Helvetica')
    .fontSize(8)
    .text(`Documento emitido electrónicamente · ${new Date().toISOString().slice(0, 10)}`, PAD, H - 18, {
      width: W - PAD * 2,
      align: 'right',
    });

  doc.end();
  return doc;
}

function drawSectionHeader(
  doc: PDFKit.PDFDocument,
  label: string,
  x: number,
  y: number,
  w: number,
) {
  doc
    .fillColor(COLOR.navy)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(label, x, y, { width: w, characterSpacing: 2 });
  doc
    .moveTo(x, y + 11)
    .lineTo(x + w, y + 11)
    .lineWidth(1.2)
    .strokeColor(COLOR.gold)
    .stroke();
}

function drawKV(
  doc: PDFKit.PDFDocument,
  key: string,
  value: string,
  x: number,
  y: number,
  w: number,
  mono = false,
) {
  doc
    .fillColor(COLOR.inkSoft)
    .font('Helvetica')
    .fontSize(7.5)
    .text(key.toUpperCase(), x, y, { width: w, characterSpacing: 1.2 });
  doc
    .fillColor(COLOR.ink)
    .font(mono ? 'Courier-Bold' : 'Helvetica-Bold')
    .fontSize(mono ? 10 : 10.5)
    .text(value, x, y + 10, { width: w });
}

/* -------------------------------------------------------------------------- */
/*  Legacy renderer — kept for backward compatibility with existing callers    */
/*  (auth'd :id/pdf, lookup/:code/pdf, email attachment).                      */
/*  Now maps its input onto the DC-3 renderer above.                           */
/* -------------------------------------------------------------------------- */

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

function toIso(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export function renderCertificatePdf(data: CertificatePdfData): NodeJS.ReadableStream {
  if (data.revokedAt) return renderRevokedPdf(data);
  return renderDc3Pdf({
    folio: data.dc3Folio || data.code,
    holderName: data.holder,
    holderCurp: null,
    courseName: data.courseTitle,
    nomCode: data.nomReference || 'STPS',
    hours: 8,
    issuedAt: toIso(data.issuedAt) || new Date().toISOString().slice(0, 10),
    expiresAt:
      toIso(data.expiresAt) ||
      new Date(new Date(data.issuedAt).setFullYear(new Date(data.issuedAt).getFullYear() + 1))
        .toISOString()
        .slice(0, 10),
    stpsRegistration: null,
    companyName: 'PROCHECK Safety S.A. de C.V.',
  });
}

function renderRevokedPdf(data: CertificatePdfData): NodeJS.ReadableStream {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(28).text('CERTIFICADO REVOCADO', { align: 'center' });
  doc.moveDown();
  doc.fillColor('#334155').font('Helvetica').fontSize(12)
     .text(`Folio: ${data.dc3Folio || data.code}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.text(`Titular: ${data.holder}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.text(`Curso: ${data.courseTitle}`, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#64748b')
     .text(`Verificar en ${data.verifyUrl}`, { align: 'center' });
  doc.end();
  return doc;
}

/* -------------------------------------------------------------------------- */
/*  Invoice PDF — untouched, still needed by the CFDI / payments modules.      */
/* -------------------------------------------------------------------------- */

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

  doc.moveTo(50, 140).lineTo(doc.page.width - 50, 140).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('FACTURAR A', 50, 155);
  doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text(data.buyerName, 50, 170);
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(data.buyerEmail, 50, 186);
  if (data.buyerCompany) doc.text(data.buyerCompany, 50, 202);
  if (data.buyerRfc) doc.text(`RFC: ${data.buyerRfc}`, 50, 218);

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
