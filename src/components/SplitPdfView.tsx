import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { extractPdfPages, parsePageRangeString } from '../utils/pdfTools';
import { renderPdfAllThumbnails } from '../utils/pdfThumbnail';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const SplitPdfView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'visual' | 'range'>('visual');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set([1]));
  const [thumbnails, setThumbnails] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF document.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsDone(false);
    setResultBlob(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      setRangeInput(`1-${Math.min(count, 3)}`);
      setSelectedPages(new Set([1]));

      // Load visual thumbnails
      setIsLoadingThumbnails(true);
      const thumbs = await renderPdfAllThumbnails(selectedFile, 30);
      setThumbnails(thumbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reading PDF pages.');
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        if (next.size > 1) next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const handleSelectOdd = () => {
    const odd = new Set<number>();
    for (let i = 1; i <= totalPages; i += 2) odd.add(i);
    setSelectedPages(odd);
  };

  const handleSelectEven = () => {
    const even = new Set<number>();
    for (let i = 2; i <= totalPages; i += 2) even.add(i);
    setSelectedPages(even);
  };

  const handleSplit = async () => {
    if (!file) return;

    let pagesToExtract: number[] = [];

    if (splitMode === 'visual') {
      pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
    } else {
      pagesToExtract = parsePageRangeString(rangeInput, totalPages);
    }

    if (pagesToExtract.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await extractPdfPages(file, pagesToExtract);
      setResultBlob(blob);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const baseName = file.name.replace(/\.pdf$/i, '');
      saveAs(resultBlob, `${baseName}_extracted.pdf`);
    }
  };

  return (
    <div id="split-pdf-view" className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Scissors className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Split &amp; Extract PDF</h1>
        <p className="text-sm text-slate-600 mt-2">
          Select individual pages visually or enter page ranges to extract into a fresh standalone document.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {!file ? (
          <label
            id="split-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select PDF file to split</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop your document here</span>
            <span className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Document Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Scissors className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {totalPages} total pages
                  </p>
                </div>
              </div>
              <button
                id="btn-split-change-doc"
                onClick={() => {
                  setFile(null);
                  setThumbnails([]);
                  setIsDone(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Change document
              </button>
            </div>

            {/* Mode selection tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  id="tab-split-visual"
                  onClick={() => setSplitMode('visual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    splitMode === 'visual'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Visual Page Selection
                </button>
                <button
                  id="tab-split-range"
                  onClick={() => setSplitMode('range')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    splitMode === 'range'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Custom Page Range
                </button>
              </div>

              {splitMode === 'visual' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 mr-1">Quick:</span>
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] font-medium"
                  >
                    All
                  </button>
                  <button
                    onClick={handleSelectOdd}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] font-medium"
                  >
                    Odd
                  </button>
                  <button
                    onClick={handleSelectEven}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] font-medium"
                  >
                    Even
                  </button>
                </div>
              )}
            </div>

            {/* Split Mode Content */}
            {splitMode === 'visual' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Click on page thumbnails to select or deselect which pages to keep ({selectedPages.size} of {totalPages} selected).
                </p>

                {isLoadingThumbnails ? (
                  <div className="flex items-center justify-center p-12 text-xs text-slate-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Rendering page previews...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {thumbnails.map((thumb) => {
                      const isSelected = selectedPages.has(thumb.pageNumber);
                      return (
                        <div
                          key={thumb.pageNumber}
                          onClick={() => togglePageSelection(thumb.pageNumber)}
                          className={`cursor-pointer rounded-lg border-2 p-1.5 flex flex-col items-center bg-white transition-all duration-150 relative ${
                            isSelected
                              ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm text-white text-[10px] font-bold z-10 transition-colors"
                            style={{ backgroundColor: isSelected ? '#10b981' : '#cbd5e1' }}
                          >
                            {isSelected ? <Check className="w-3 h-3" /> : ''}
                          </div>
                          <img
                            src={thumb.dataUrl}
                            alt={`Page ${thumb.pageNumber}`}
                            className="w-full h-auto object-contain rounded border border-slate-100 aspect-[3/4] bg-white"
                          />
                          <span className="text-[11px] font-semibold text-slate-700 mt-1">
                            Page {thumb.pageNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Page Range (e.g. 1-3, 5, 7-10)
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter single pages or ranges separated by commas. Total available pages: {totalPages}.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {!isDone ? (
                <button
                  id="btn-split-pdf"
                  disabled={isProcessing}
                  onClick={handleSplit}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting pages...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Extract &amp; Split PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Split Completed!
                  </span>
                  <button
                    id="btn-download-split"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Extracted PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
