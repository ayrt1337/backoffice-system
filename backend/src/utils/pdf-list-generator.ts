import { Response } from "express";
import PDFDocument from "pdfkit-table";
import { formatDate } from "./format-date.js";

interface PDFHeader {
  label: string;
  property: string;
}

interface GenerateListPDFOptions {
  res: Response;
  title: string;
  filename: string;
  data: any[];
  headers: PDFHeader[];
  orderByLabel?: string;
}

export async function generateListPDF({
  res,
  title,
  filename,
  data,
  headers,
  orderByLabel
}: GenerateListPDFOptions) {
  const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  doc.fillColor('#0f304f').fontSize(22).font('Helvetica-Bold').text(title, { align: 'left' });
  doc.moveDown(0.5);

  doc.fillColor('#64748b').fontSize(10).font('Helvetica');
  doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`);
  doc.text(`Ordenação: ${orderByLabel || 'Criação (Mais Recente)'}`);
  doc.text(`Total de registros: ${data.length}`);
  doc.moveDown(2);

  const tableWidth = doc.page.width - 60;
  const firstColWidth = Math.floor(tableWidth * 0.30);
  const otherColsCount = headers.length - 1;
  const dynamicColWidth = otherColsCount > 0 ? Math.floor((tableWidth - firstColWidth) / otherColsCount) : firstColWidth;

  const table = {
    headers: headers.map((header, index) => ({
      label: header.label,
      property: header.property,
      width: index === 0 ? firstColWidth : dynamicColWidth,
      headerColor: "#0f304f",
      headerOpacity: 1
    })),
    datas: data.map((item: any) => {
      const row: any = {};
      headers.forEach(header => {
        const value = item[header.property];

        if (value instanceof Date) {
          row[header.property] = formatDate(value);
        } else if (typeof value === 'string' && (header.property.includes('at') || header.property.includes('date'))) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            row[header.property] = formatDate(date);
          } else {
            row[header.property] = value;
          }
        } else {
          row[header.property] = value ?? '-';
        }
      });
      return row;
    }),
  };

  await doc.table(table, {
    padding: [5, 5, 5, 5],
    columnSpacing: 5,
    divider: {
      header: { disabled: false, width: 1, opacity: 1 },
      horizontal: { disabled: false, width: 0.5, opacity: 0.3 },
    },
    prepareHeader: () => {
      doc.font("Helvetica-Bold").fontSize(10).fillColor('white');
      return doc;
    },
    prepareRow: (row: any, indexColumn: any, indexRow: any, rectRow: any, rectCell: any) => {
      if (rectCell && indexRow % 2 === 0) {
        doc.fillColor("#b2c6d3")
          .fill();
      }
      doc.font("Helvetica").fontSize(9).fillColor('#1e293b');
      return doc;
    },
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    const oldMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    
    doc.fillColor('#64748b').fontSize(8).font('Helvetica');
    doc.text(
      `${i + 1}`,
      30,
      doc.page.height - 30,
      { 
        align: 'right',
        width: doc.page.width - 60,
        lineBreak: false
      }
    );

    doc.page.margins.bottom = oldMargin;
  }

  doc.end();
}
