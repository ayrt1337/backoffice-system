import { Response } from "express";
import PDFDocument from "pdfkit";

interface PDFField {
  label: string;
  value: string;
}

type PDFRow = PDFField | PDFField[];

interface GeneratePDFOptions {
  res: Response;
  title: string;
  filename: string;
  rows: PDFRow[];
}

export async function generatePDF({
  res,
  title,
  filename,
  rows,
}: GeneratePDFOptions) {
  const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  doc.pipe(res);

  const pageWidth = doc.page.width - 80;

  doc
    .fillColor("#0f304f")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(title, { align: "left" });
  doc.moveDown(0.1);

  doc.fillColor("#64748b").fontSize(10).font("Helvetica");
  doc.text(`Relatório gerado em: ${new Date().toLocaleString("pt-BR")}`);
  doc.moveDown(2);

  for (const row of rows) {
    if (Array.isArray(row)) {
      const colCount = row.length;
      const colWidth = pageWidth / colCount;
      const startY = doc.y;

      for (let i = 0; i < colCount; i++) {
        const x = 40 + i * colWidth;

        doc.fillColor("#64748b").fontSize(11).font("Helvetica");
        doc.text(row[i].label, x, startY, { width: colWidth - 10 });

        doc.fillColor("#1e293b").fontSize(13).font("Helvetica");
        doc.text(row[i].value || "-", x, startY + 18, { width: colWidth - 10 });
      }

      doc.y = startY + 50;
    } else {
      doc.fillColor("#64748b").fontSize(11).font("Helvetica");
      doc.text(row.label);

      doc.moveDown(0.2);

      doc.fillColor("#1e293b").fontSize(13).font("Helvetica");
      doc.text(row.value || "-");

      doc.moveDown(1.5);
    }
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const oldMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.fillColor("#64748b").fontSize(8).font("Helvetica");
    doc.text(`${i + 1}`, 40, doc.page.height - 30, {
      align: "right",
      width: doc.page.width - 80,
      lineBreak: false,
    });

    doc.page.margins.bottom = oldMargin;
  }

  doc.end();
}
