import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export function createSamplePdfFile(): File {
  const doc = new jsPDF();

  // Page 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('Quarterly Strategic Business Report', 20, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared by: Enterprise Analytics & Strategy Team', 20, 33);
  doc.text('Date: Third Quarter Review | Confidential', 20, 39);

  doc.setDrawColor(203, 213, 225);
  doc.line(20, 44, 190, 44);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Executive Summary', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const p1 =
    'During the past quarter, the organization achieved a 24.8% growth in digital operations and streamlined document management workflows. Our digital transformation initiatives have eliminated redundant manual processing, significantly improving turnaround times and cross-departmental alignment.';
  const p1Lines = doc.splitTextToSize(p1, 170);
  doc.text(p1Lines, 20, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Operational Highlights', 20, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const p2 =
    'Document conversion efficiency reached an all-time high with near-instant client-side extraction. Cloud latency was cut to zero by adopting client-side file transformation pipelines, maintaining 100% data privacy for regulatory compliance.';
  const p2Lines = doc.splitTextToSize(p2, 170);
  doc.text(p2Lines, 20, 98);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Key Achievements:', 20, 122);

  doc.setFont('helvetica', 'normal');
  doc.text('• Processed over 14,000 corporate records without data egress.', 25, 131);
  doc.text('• Reduced manual formatting time by 4.2 hours per employee weekly.', 25, 139);
  doc.text('• Automated PDF-to-Word restructuring with preserved heading hierarchies.', 25, 147);
  doc.text('• Maintained 99.9% conversion fidelity on complex multi-column drafts.', 25, 155);

  // Page 2
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Forward-Looking Roadmap', 20, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const p3 =
    'In the upcoming quarters, our priorities encompass expanded template automation, enhanced typography mapping, and advanced table reconstruction algorithms. These efforts ensure continuous alignment with enterprise compliance requirements.';
  const p3Lines = doc.splitTextToSize(p3, 170);
  doc.text(p3Lines, 20, 34);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Implementation Milestones:', 20, 58);

  doc.setFont('helvetica', 'normal');
  doc.text('Phase 1: Real-time interactive inspection and document proofing.', 25, 68);
  doc.text('Phase 2: Bidirectional high-speed PDF and DOCX packaging.', 25, 76);
  doc.text('Phase 3: Multi-document batch queues with one-click export.', 25, 84);

  const pdfBlob = doc.output('blob');
  return new File([pdfBlob], 'Sample_Business_Report.pdf', { type: 'application/pdf' });
}

export async function createSampleDocxFile(): Promise<File> {
  const doc = new Document({
    creator: 'Enterprise Strategy Office',
    title: 'Product Requirements Document',
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'Product Requirements Document: Universal Document Bridge',
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Author: Product Architecture Team | Status: Approved | Version 2.4',
                color: '64748B',
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '1. Problem Statement',
                bold: true,
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'Users frequently face friction when transitioning documents between PDF distribution formats and editable Word documents. Many existing cloud converters require external file uploads, presenting security and privacy risks for sensitive corporate documents.',
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '2. Solution Architecture',
                bold: true,
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'The Universal Document Bridge performs all conversions directly in the browser environment. Using modern web standards, documents are decoded, formatted, and packaged client-side with full confidentiality and zero server-side storage.',
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 100 },
            children: [
              new TextRun({
                text: 'Core Functional Objectives',
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: '• Full text extraction and structural hierarchy preservation for PDF to Word.',
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: '• High-fidelity pagination, headers, footers, and margins for Word to PDF.',
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: '• Batch file transformation with instant live previews and statistics.',
                size: 22,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return new File([blob], 'Sample_Product_Requirements.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
