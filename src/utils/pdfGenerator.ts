import { jsPDF } from 'jspdf';
import { PdfExportSettings, ExtractedDocxDocument } from '../types';

export async function generatePdfFromDocx(
  docData: ExtractedDocxDocument,
  settings: PdfExportSettings
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = settings.marginsMm;
  const contentWidth = pageWidth - margin * 2;

  // Header & Footer vertical bounds
  const headerHeight = settings.includeHeaderFooter ? 15 : 0;
  const footerHeight = settings.includeHeaderFooter ? 15 : 0;
  const startY = margin + headerHeight;
  const maxY = pageHeight - margin - footerHeight;

  let currentY = startY;

  // Split content by paragraphs or lines from rawText and HTML
  const rawParagraphs = docData.rawText.split(/\r?\n+/);

  // Set font
  doc.setFont(settings.fontFamily, 'normal');

  function checkNewPage(neededHeight: number) {
    if (currentY + neededHeight > maxY) {
      doc.addPage(settings.pageSize, settings.orientation);
      currentY = startY;
    }
  }

  for (let i = 0; i < rawParagraphs.length; i++) {
    const pText = rawParagraphs[i].trim();
    if (!pText) continue;

    // Detect if this paragraph looks like a title or heading
    const isMainTitle = i === 0 && pText.length < 80;
    const isHeading = (pText.length < 60 && !pText.endsWith('.')) || isMainTitle;

    if (isMainTitle) {
      checkNewPage(18);
      doc.setFont(settings.fontFamily, 'bold');
      doc.setFontSize(settings.fontSizePt + 6);
      doc.setTextColor(20, 20, 30);
      
      const lines = doc.splitTextToSize(pText, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 8 + 4;
    } else if (isHeading) {
      checkNewPage(14);
      doc.setFont(settings.fontFamily, 'bold');
      doc.setFontSize(settings.fontSizePt + 2);
      doc.setTextColor(30, 41, 59);

      const lines = doc.splitTextToSize(pText, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 6 + 3;
    } else {
      doc.setFont(settings.fontFamily, 'normal');
      doc.setFontSize(settings.fontSizePt);
      doc.setTextColor(51, 65, 85);

      const lines = doc.splitTextToSize(pText, contentWidth);
      const lineHeightMm = (settings.fontSizePt * 0.3527) * settings.lineHeight;

      // Print line by line with page check
      for (const line of lines) {
        checkNewPage(lineHeightMm);
        doc.text(line, margin, currentY);
        currentY += lineHeightMm;
      }
      // Paragraph spacing
      currentY += 3;
    }
  }

  // Add Headers & Footers across all pages
  if (settings.includeHeaderFooter) {
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont(settings.fontFamily, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(140, 150, 165);

      // Header line & title
      const title = settings.headerTitle || docData.fileName.replace(/\.docx$/i, '');
      doc.text(title, margin, margin + 4);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, margin + 7, pageWidth - margin, margin + 7);

      // Footer line & page number
      const footerY = pageHeight - margin + 2;
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      const pageStr = `Page ${p} of ${totalPages}`;
      if (settings.pageNumberPosition === 'bottom-center') {
        doc.text(pageStr, pageWidth / 2, footerY, { align: 'center' });
      } else if (settings.pageNumberPosition === 'bottom-right') {
        doc.text(pageStr, pageWidth - margin, footerY, { align: 'right' });
      } else {
        // top-right
        doc.text(pageStr, pageWidth - margin, margin + 4, { align: 'right' });
      }
    }
  }

  return doc.output('blob');
}
