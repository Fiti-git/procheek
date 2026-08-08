"""Convert PROCHECK-Phase-1-Summary.md into a clean branded PDF.

Uses reportlab. Navy + coral accents to match the product palette.
Output: f:/Munas/procheeck/project_doc/PROCHECK-Phase-1-Summary.pdf
"""

import re
from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.enums import TA_LEFT

SRC = Path("f:/Munas/procheeck/project_doc/PROCHECK-Phase-1-Summary.md")
OUT = Path("f:/Munas/procheeck/project_doc/PROCHECK-Phase-1-Summary.pdf")

INK = colors.HexColor("#0F1725")
CORAL = colors.HexColor("#FF6B35")
INK_700 = colors.HexColor("#2B3441")
INK_500 = colors.HexColor("#6E7684")
LINE = colors.HexColor("#E4E6EA")
CANVAS_2 = colors.HexColor("#F5F6F7")
SUCCESS = colors.HexColor("#059669")


# ---------- styles ----------
def make_styles():
    base = "Helvetica"
    return {
        "h1": ParagraphStyle(
            "h1", fontName=base + "-Bold", fontSize=22, leading=26,
            textColor=INK, spaceAfter=6, spaceBefore=0),
        "h2": ParagraphStyle(
            "h2", fontName=base + "-Bold", fontSize=14, leading=18,
            textColor=INK, spaceAfter=6, spaceBefore=18),
        "h3": ParagraphStyle(
            "h3", fontName=base + "-Bold", fontSize=11, leading=15,
            textColor=INK, spaceAfter=4, spaceBefore=10),
        "body": ParagraphStyle(
            "body", fontName=base, fontSize=9.5, leading=13.5,
            textColor=INK_700, spaceAfter=4, alignment=TA_LEFT),
        "bullet": ParagraphStyle(
            "bullet", fontName=base, fontSize=9.5, leading=13.5,
            textColor=INK_700, leftIndent=14, bulletIndent=4, spaceAfter=1),
        "meta": ParagraphStyle(
            "meta", fontName=base, fontSize=8.5, leading=12,
            textColor=INK_500, spaceAfter=2),
        "kicker": ParagraphStyle(
            "kicker", fontName=base + "-Bold", fontSize=7.5, leading=10,
            textColor=CORAL, spaceAfter=2, spaceBefore=0),
        "mono": ParagraphStyle(
            "mono", fontName="Courier", fontSize=8.5, leading=12,
            textColor=INK, spaceAfter=2),
    }


# ---------- markdown parsing ----------
def parse_inline(text):
    """Convert **bold** and `code` markers to reportlab HTML-ish tags."""
    # Escape special chars first so they don't get interpreted.
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold **x**
    text = re.sub(r"\*\*([^*]+)\*\*",
                  r"<b>\1</b>", text)
    # Code `x`
    text = re.sub(r"`([^`]+)`",
                  r'<font face="Courier" color="#0F1725">\1</font>', text)
    # em-dash safety net (should be none in source but be safe)
    text = text.replace("—", " - ").replace("–", " - ")
    # Emoji cleanup: reportlab default fonts don't have emoji. Replace
    # common check/cross marks with a text token so the PDF renders cleanly.
    text = (text
            .replace("✅", "<font color='#059669'><b>OK</b></font> ")
            .replace("❌", "<font color='#B91C1C'><b>X</b></font> ")
            .replace("⚠", "<b>!</b> ")
            .replace("✓", "<font color='#059669'>OK</font>")
            )
    return text


def md_to_flowables(md_text, styles):
    lines = md_text.splitlines()
    flows = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()

        # blank line
        if not stripped:
            flows.append(Spacer(1, 4))
            i += 1
            continue

        # horizontal rule
        if re.match(r"^-{3,}$", stripped):
            flows.append(Spacer(1, 6))
            flows.append(HRFlowable(
                width="100%", thickness=0.5, color=LINE,
                spaceBefore=0, spaceAfter=0))
            flows.append(Spacer(1, 6))
            i += 1
            continue

        # headings
        if stripped.startswith("# "):
            flows.append(Paragraph(
                parse_inline(stripped[2:]), styles["h1"]))
            # accent bar under H1
            flows.append(Spacer(1, 2))
            flows.append(HRFlowable(
                width=64, thickness=2.5, color=CORAL,
                spaceBefore=0, spaceAfter=6))
            i += 1
            continue
        if stripped.startswith("## "):
            flows.append(Paragraph(
                parse_inline(stripped[3:]), styles["h2"]))
            i += 1
            continue
        if stripped.startswith("### "):
            flows.append(Paragraph(
                parse_inline(stripped[4:]), styles["h3"]))
            i += 1
            continue

        # tables (github-style pipe tables)
        if stripped.startswith("|") and "|" in stripped[1:]:
            # collect all consecutive table lines
            table_lines = []
            while i < n and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            # parse: first row header, second row separator, rest data
            def parse_row(row):
                cells = [c.strip() for c in row.strip("|").split("|")]
                return cells

            if len(table_lines) >= 2:
                header = parse_row(table_lines[0])
                data_rows = [parse_row(r) for r in table_lines[2:]]
                # normalize row widths
                width = len(header)
                data_rows = [r + [""] * (width - len(r)) for r in data_rows]

                table_data = [
                    [Paragraph(f"<b>{parse_inline(h)}</b>", styles["meta"])
                     for h in header]
                ]
                for row in data_rows:
                    table_data.append([
                        Paragraph(parse_inline(c), styles["meta"])
                        for c in row
                    ])

                # column widths: distribute evenly
                col_w = (6.5 * inch) / width if width > 0 else 6.5 * inch
                col_widths = [col_w] * width

                table = Table(
                    table_data, colWidths=col_widths, hAlign="LEFT",
                    repeatRows=1)
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), INK),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1),
                        [colors.white, CANVAS_2]),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.25, LINE),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]))
                flows.append(Spacer(1, 4))
                flows.append(table)
                flows.append(Spacer(1, 8))
            continue

        # list items
        if stripped.startswith(("- ", "* ")):
            item = stripped[2:]
            # If bullet has bold-only content (a checklist), render inline
            flows.append(Paragraph(
                "• " + parse_inline(item), styles["bullet"]))
            i += 1
            continue

        # numbered list
        m = re.match(r"^\d+\.\s+(.+)", stripped)
        if m:
            item = m.group(1)
            # Preserve the number from the source line so it stays 1, 2, 3
            num = re.match(r"^(\d+)", stripped).group(1)
            flows.append(Paragraph(
                f"{num}. " + parse_inline(item), styles["bullet"]))
            i += 1
            continue

        # bold-only paragraph (e.g. "**Ask:** ...")
        # Regular paragraph
        flows.append(Paragraph(parse_inline(stripped), styles["body"]))
        i += 1

    return flows


# ---------- footer / header canvas ----------
class PageNumCanvas(Canvas):
    """Add a footer with page number + brand line."""

    def __init__(self, *args, **kwargs):
        Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self.pages)
        for idx, state in enumerate(self.pages, 1):
            self.__dict__.update(state)
            self.draw_page_footer(idx, total)
            Canvas.showPage(self)
        Canvas.save(self)

    def draw_page_footer(self, page, total):
        w, h = LETTER
        # thin rule
        self.setStrokeColor(LINE)
        self.setLineWidth(0.4)
        self.line(0.75 * inch, 0.55 * inch, w - 0.75 * inch, 0.55 * inch)
        # brand left
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(INK)
        self.drawString(0.75 * inch, 0.38 * inch, "PROCHECK")
        self.setFont("Helvetica", 8)
        self.setFillColor(CORAL)
        self.drawString(0.75 * inch + 46, 0.38 * inch, "Safety")
        # meta center
        self.setFillColor(INK_500)
        self.setFont("Helvetica", 8)
        self.drawCentredString(
            w / 2, 0.38 * inch, "Phase 1 Summary  ·  Prepared for Ale")
        # page num right
        self.drawRightString(
            w - 0.75 * inch, 0.38 * inch, f"{page} / {total}")


# ---------- build PDF ----------
def build():
    src_text = SRC.read_text(encoding="utf-8")

    styles = make_styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.75 * inch,
        title="PROCHECK Safety - Phase 1 Summary",
        author="Munas",
    )
    flows = md_to_flowables(src_text, styles)
    doc.build(flows, canvasmaker=PageNumCanvas)

    size = OUT.stat().st_size
    print(f"WROTE {OUT}")
    print(f"size: {size} bytes ({size/1024:.1f} KB)")


if __name__ == "__main__":
    build()
