import mammoth from 'mammoth';
import { ExtractedDocxDocument } from '../types';

export async function extractDocxDocument(file: File): Promise<ExtractedDocxDocument> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Convert to HTML for formatted preview
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  // Extract raw text for clean parsing and statistics
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

  const rawText = rawTextResult.value || '';
  const htmlContent = htmlResult.value || '<p>No content extracted</p>';

  // Word count & paragraph count
  const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  return {
    fileName: file.name,
    fileSize: file.size,
    rawText,
    htmlContent,
    wordCount: words,
    paragraphCount: Math.max(paragraphs, 1),
  };
}
