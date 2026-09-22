import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
} from 'docx';
import { ExtractedPdfDocument, DocxExportSettings } from '../types';

export async function generateDocxBlob(
  docData: ExtractedPdfDocument,
  settings: DocxExportSettings
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  // Determine twip margins (1 inch = 1440 twips)
  let marginTwips = 1440; // normal: 1 inch
  if (settings.marginSize === 'narrow') {
    marginTwips = 720; // 0.5 inch
  } else if (settings.marginSize === 'wide') {
    marginTwips = 2160; // 1.5 inch
  }

  const baseFont = settings.fontFamily;
  const baseSizeHalfPt = settings.fontSizePt * 2; // docx uses half-points (12pt = 24)
  const lineSpacingTwips = Math.round(settings.lineSpacing * 240); // 240 = single spacing

  for (let pIdx = 0; pIdx < docData.pages.length; pIdx++) {
    const page = docData.pages[pIdx];

    // Add page break if preserving page breaks and not first page
    if (settings.preservePageBreaks && pIdx > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    for (const line of page.lines) {
      if (!line.text.trim()) continue;

      if (settings.detectHeadings && line.isHeading) {
        let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2;
        let headingSizeHalfPt = baseSizeHalfPt + 6;

        if (line.headingLevel === 1) {
          headingLevel = HeadingLevel.HEADING_1;
          headingSizeHalfPt = baseSizeHalfPt + 12;
        } else if (line.headingLevel === 3) {
          headingLevel = HeadingLevel.HEADING_3;
          headingSizeHalfPt = baseSizeHalfPt + 2;
        }

        paragraphs.push(
          new Paragraph({
            heading: headingLevel,
            spacing: {
              before: 240,
              after: 120,
              line: lineSpacingTwips,
            },
            children: [
              new TextRun({
                text: line.text,
                font: baseFont,
                size: headingSizeHalfPt,
                bold: true,
              }),
            ],
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            spacing: {
              after: 100,
              line: lineSpacingTwips,
            },
            children: [
              new TextRun({
                text: line.text,
                font: baseFont,
                size: baseSizeHalfPt,
                bold: line.isBold,
              }),
            ],
          })
        );
      }
    }
  }

  // Create footer if page numbers enabled
  const footers = settings.includePageNumbers
    ? {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Page ',
                  font: baseFont,
                  size: 18,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: baseFont,
                  size: 18,
                }),
                new TextRun({
                  text: ' of ',
                  font: baseFont,
                  size: 18,
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: baseFont,
                  size: 18,
                }),
              ],
            }),
          ],
        }),
      }
    : undefined;

  // Create header with document title
  const headers = {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: docData.fileName.replace(/\.pdf$/i, ''),
              font: baseFont,
              size: 16,
              color: '888888',
            }),
          ],
        }),
      ],
    }),
  };

  const doc = new Document({
    creator: settings.authorName || 'PDF & Word Converter',
    title: docData.fileName.replace(/\.pdf$/i, ''),
    description: 'Converted from PDF document',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginTwips,
              right: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
            },
          },
        },
        headers,
        footers,
        children: paragraphs.length > 0 ? paragraphs : [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Empty document',
                font: baseFont,
                size: baseSizeHalfPt,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
