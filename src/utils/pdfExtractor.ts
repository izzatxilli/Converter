import * as pdfjsLib from 'pdfjs-dist';
import { ExtractedPdfDocument, ExtractedPage, ExtractedLine } from '../types';

// Configure pdfjs worker
try {
  // Using unpkg CDN matching the loaded pdfjsLib version
  const version = pdfjsLib.version || '4.10.38';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
} catch (err) {
  console.warn('Could not set pdfjs worker from CDN:', err);
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
  hasEOL?: boolean;
}

export async function extractPdfDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedPdfDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: ExtractedPage[] = [];

  let totalWords = 0;
  let totalChars = 0;
  let fullTextCombined = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    // Group items by Y coordinate to re-assemble lines
    // In PDF coordinate system, Y increases upwards.
    const lineBuckets = new Map<number, TextItem[]>();
    const tolerance = 4; // pixels tolerance for same line

    for (const item of items) {
      if (!item.str || item.str.trim().length === 0) continue;
      const y = Math.round(item.transform[5]);

      // Find an existing bucket within tolerance
      let foundBucketKey: number | null = null;
      for (const bucketKey of lineBuckets.keys()) {
        if (Math.abs(bucketKey - y) <= tolerance) {
          foundBucketKey = bucketKey;
          break;
        }
      }

      if (foundBucketKey !== null) {
        lineBuckets.get(foundBucketKey)!.push(item);
      } else {
        lineBuckets.set(y, [item]);
      }
    }

    // Sort lines by Y descending (top to bottom of page)
    const sortedYKeys = Array.from(lineBuckets.keys()).sort((a, b) => b - a);

    // Calculate median font size for this page to detect headings
    const fontSizes: number[] = [];
    for (const item of items) {
      if (item.str && item.str.trim()) {
        const size = Math.abs(item.transform[0] || item.transform[3] || 12);
        fontSizes.push(size);
      }
    }
    fontSizes.sort((a, b) => a - b);
    const medianFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 12;

    const pageLines: ExtractedLine[] = [];
    const pageTextParts: string[] = [];

    for (const yKey of sortedYKeys) {
      const lineItems = lineBuckets.get(yKey)!;
      // Sort items by X ascending (left to right)
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

      // Combine text pieces with sensible spacing
      let lineText = '';
      let maxFontSizeInLine = 12;
      let isBold = false;

      for (let i = 0; i < lineItems.length; i++) {
        const it = lineItems[i];
        const itemSize = Math.abs(it.transform[0] || it.transform[3] || 12);
        if (itemSize > maxFontSizeInLine) maxFontSizeInLine = itemSize;
        if (it.fontName && (it.fontName.toLowerCase().includes('bold') || it.fontName.toLowerCase().includes('black'))) {
          isBold = true;
        }

        if (i > 0) {
          const prev = lineItems[i - 1];
          const prevRight = prev.transform[4] + prev.width;
          const currentLeft = it.transform[4];
          // If there's a noticeable gap between words, add a space
          if (currentLeft - prevRight > 2 && !lineText.endsWith(' ') && !it.str.startsWith(' ')) {
            lineText += ' ';
          }
        }
        lineText += it.str;
      }

      const trimmedLine = lineText.trim();
      if (!trimmedLine) continue;

      const isHeading = maxFontSizeInLine >= medianFontSize * 1.25 || (isBold && trimmedLine.length < 90);
      let headingLevel: 1 | 2 | 3 | undefined = undefined;

      if (maxFontSizeInLine >= medianFontSize * 1.6) {
        headingLevel = 1;
      } else if (maxFontSizeInLine >= medianFontSize * 1.3) {
        headingLevel = 2;
      } else if (isHeading) {
        headingLevel = 3;
      }

      pageLines.push({
        text: trimmedLine,
        fontSize: Math.round(maxFontSizeInLine),
        isHeading,
        headingLevel,
        isBold,
      });

      pageTextParts.push(trimmedLine);
    }

    const pageRawText = pageTextParts.join('\n');
    pages.push({
      pageNumber: pageNum,
      lines: pageLines,
      rawText: pageRawText,
    });

    const wordsInPage = pageRawText.trim() ? pageRawText.trim().split(/\s+/).length : 0;
    totalWords += wordsInPage;
    totalChars += pageRawText.length;
    fullTextCombined += (pageNum > 1 ? '\n\n' : '') + pageRawText;

    if (onProgress) {
      onProgress(Math.round((pageNum / numPages) * 100));
    }
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: numPages,
    wordCount: totalWords,
    characterCount: totalChars,
    pages,
    fullText: fullTextCombined,
  };
}
