import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function extractPdfPages(
  file: File,
  pagesToKeep: number[] // 1-indexed
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  // Convert 1-indexed to 0-indexed
  const indices = pagesToKeep
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < srcDoc.getPageCount());

  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function rotatePdfDocument(
  file: File,
  rotations: { [pageNumber: number]: number } // pageNumber: 1-indexed, angle in degrees (e.g. 90, 180, 270)
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    const additionalAngle = rotations[pageNum] || 0;
    if (additionalAngle !== 0) {
      const page = pages[i];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + additionalAngle) % 360));
    }
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  rotation: number; // e.g. -45, 0, 45
  color: 'red' | 'gray' | 'blue' | 'black';
  position: 'center' | 'diagonal' | 'header' | 'footer';
}

export async function applyWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  let colorRgb = rgb(0.8, 0.2, 0.2); // default red
  if (options.color === 'gray') colorRgb = rgb(0.5, 0.5, 0.5);
  else if (options.color === 'blue') colorRgb = rgb(0.1, 0.3, 0.8);
  else if (options.color === 'black') colorRgb = rgb(0.1, 0.1, 0.1);

  const angle = options.position === 'diagonal' ? -45 : options.rotation;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (options.position === 'header') {
      y = height - 40;
    } else if (options.position === 'footer') {
      y = 30;
    }

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: colorRgb,
      opacity: options.opacity,
      rotate: degrees(angle),
    });
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function organizePdfPages(
  file: File,
  newPageOrder: number[] // 1-indexed page numbers
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const indices = newPageOrder.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
