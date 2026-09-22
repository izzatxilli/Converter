/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ConversionMode, ExtractedPdfDocument, ExtractedDocxDocument, QueueItem } from './types';
import { Header } from './components/Header';
import { ToolsHomeView } from './components/ToolsHomeView';
import { PdfToWordView } from './components/PdfToWordView';
import { WordToPdfView } from './components/WordToPdfView';
import { MergePdfView } from './components/MergePdfView';
import { SplitPdfView } from './components/SplitPdfView';
import { RotatePdfView } from './components/RotatePdfView';
import { WatermarkPdfView } from './components/WatermarkPdfView';
import { OrganizePdfView } from './components/OrganizePdfView';
import { PdfToJpgView } from './components/PdfToJpgView';
import { BatchView } from './components/BatchView';
import { extractPdfDocument } from './utils/pdfExtractor';
import { extractDocxDocument } from './utils/docxExtractor';
import { createSamplePdfFile, createSampleDocxFile } from './utils/sampleDocs';
import { ShieldCheck, ArrowLeft, Heart, Lock, Zap } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<ConversionMode>('home');

  // PDF to Word State
  const [extractedPdf, setExtractedPdf] = useState<ExtractedPdfDocument | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfParseProgress, setPdfParseProgress] = useState(0);

  // Word to PDF State
  const [extractedDocx, setExtractedDocx] = useState<ExtractedDocxDocument | null>(null);
  const [isParsingDocx, setIsParsingDocx] = useState(false);

  // Batch State
  const [batchQueue, setBatchQueue] = useState<QueueItem[]>([]);

  // Sample Loading State
  const [isProcessingSample, setIsProcessingSample] = useState(false);

  const handleSelectPdf = async (file: File) => {
    setIsParsingPdf(true);
    setPdfParseProgress(10);
    try {
      const extracted = await extractPdfDocument(file, (p) => {
        setPdfParseProgress(p);
      });
      setExtractedPdf(extracted);
    } catch (err) {
      console.error('Error parsing PDF:', err);
    } finally {
      setIsParsingPdf(false);
      setPdfParseProgress(100);
    }
  };

  const handleSelectDocx = async (file: File) => {
    setIsParsingDocx(true);
    try {
      const extracted = await extractDocxDocument(file);
      setExtractedDocx(extracted);
    } catch (err) {
      console.error('Error parsing DOCX:', err);
    } finally {
      setIsParsingDocx(false);
    }
  };

  const handleLoadSamplePdf = async () => {
    setIsProcessingSample(true);
    try {
      setCurrentMode('pdf-to-word');
      const sample = createSamplePdfFile();
      await handleSelectPdf(sample);
    } finally {
      setIsProcessingSample(false);
    }
  };

  const handleLoadSampleDocx = async () => {
    setIsProcessingSample(true);
    try {
      setCurrentMode('word-to-pdf');
      const sample = await createSampleDocxFile();
      await handleSelectDocx(sample);
    } finally {
      setIsProcessingSample(false);
    }
  };

  // Batch Queue Handlers
  const handleAddBatchFiles = (files: File[]) => {
    const newItems: QueueItem[] = files.map((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      const isPdf = ext === 'pdf';
      return {
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        name: f.name,
        size: f.size,
        type: isPdf ? 'pdf' : 'docx',
        targetType: isPdf ? 'docx' : 'pdf',
        status: 'idle',
        progress: 0,
      };
    });
    setBatchQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveQueueItem = (id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setBatchQueue([]);
  };

  const handleUpdateQueueItem = (id: string, updates: Partial<QueueItem>) => {
    setBatchQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white font-sans antialiased">
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onLoadSamplePdf={handleLoadSamplePdf}
        onLoadSampleDocx={handleLoadSampleDocx}
        isProcessingSample={isProcessingSample}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb when inside a specific tool */}
        {currentMode !== 'home' && (
          <div className="mb-6 flex items-center justify-between">
            <button
              id="btn-back-to-tools"
              onClick={() => setCurrentMode('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-red-600 hover:border-red-300 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Tools</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private Client-Side Processing</span>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentMode === 'home' && <ToolsHomeView onSelectMode={setCurrentMode} />}

        {currentMode === 'pdf-to-word' && (
          <PdfToWordView
            document={extractedPdf}
            isParsing={isParsingPdf}
            parseProgress={pdfParseProgress}
            onSelectPdf={handleSelectPdf}
            onReset={() => setExtractedPdf(null)}
          />
        )}

        {currentMode === 'word-to-pdf' && (
          <WordToPdfView
            document={extractedDocx}
            isParsing={isParsingDocx}
            onSelectDocx={handleSelectDocx}
            onReset={() => setExtractedDocx(null)}
          />
        )}

        {currentMode === 'merge-pdf' && <MergePdfView />}

        {currentMode === 'split-pdf' && <SplitPdfView />}

        {currentMode === 'rotate-pdf' && <RotatePdfView />}

        {currentMode === 'watermark-pdf' && <WatermarkPdfView />}

        {currentMode === 'organize-pdf' && <OrganizePdfView />}

        {currentMode === 'pdf-to-jpg' && <PdfToJpgView />}

        {currentMode === 'batch' && (
          <BatchView
            queue={batchQueue}
            onAddFiles={handleAddBatchFiles}
            onRemoveItem={handleRemoveQueueItem}
            onClearQueue={handleClearQueue}
            onUpdateQueueItem={handleUpdateQueueItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600 inline" /> iLovePDF &amp; Word
            </span>
            <span>•</span>
            <span>100% Client-Side Private Document Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span>PDF to Word</span>
            <span>•</span>
            <span>Word to PDF</span>
            <span>•</span>
            <span>Merge PDF</span>
            <span>•</span>
            <span>Split PDF</span>
            <span>•</span>
            <span>Watermark</span>
            <span>•</span>
            <span>Rotate &amp; Organize</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
