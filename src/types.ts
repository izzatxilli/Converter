export type ConversionMode =
  | 'home'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'rotate-pdf'
  | 'watermark-pdf'
  | 'organize-pdf'
  | 'pdf-to-jpg'
  | 'batch';

export interface ExtractedPage {
  pageNumber: number;
  lines: ExtractedLine[];
  rawText: string;
}

export interface ExtractedLine {
  text: string;
  fontSize: number;
  isHeading: boolean;
  headingLevel?: 1 | 2 | 3;
  isBold?: boolean;
}

export interface ExtractedPdfDocument {
  fileName: string;
  fileSize: number;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  pages: ExtractedPage[];
  fullText: string;
}

export interface ExtractedDocxDocument {
  fileName: string;
  fileSize: number;
  rawText: string;
  htmlContent: string;
  wordCount: number;
  paragraphCount: number;
}

export interface DocxExportSettings {
  fontFamily: 'Calibri' | 'Times New Roman' | 'Arial' | 'Georgia' | 'Aptos';
  fontSizePt: number;
  lineSpacing: number; // e.g. 1.15, 1.5, 2.0
  preservePageBreaks: boolean;
  detectHeadings: boolean;
  includePageNumbers: boolean;
  authorName: string;
  marginSize: 'normal' | 'narrow' | 'wide';
}

export interface PdfExportSettings {
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  fontFamily: 'helvetica' | 'times' | 'courier';
  fontSizePt: number;
  lineHeight: number;
  marginsMm: number;
  includeHeaderFooter: boolean;
  headerTitle: string;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-right';
}

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: 'pdf' | 'docx';
  targetType: 'docx' | 'pdf';
  status: 'idle' | 'parsing' | 'converting' | 'completed' | 'error';
  progress: number;
  error?: string;
  extractedPdf?: ExtractedPdfDocument;
  extractedDocx?: ExtractedDocxDocument;
  outputBlob?: Blob;
  outputFilename?: string;
}
