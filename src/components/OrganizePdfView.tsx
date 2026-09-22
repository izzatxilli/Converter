import React, { useState } from 'react';
import {
  Layers,
  Upload,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { organizePdfPages } from '../utils/pdfTools';
import { renderPdfAllThumbnails } from '../utils/pdfThumbnail';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface PageItem {
  id: string;
  originalPageNumber: number;
  dataUrl: string;
}

export const OrganizePdfView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [deletedPages, setDeletedPages] = useState<PageItem[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
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
    setDeletedPages([]);

    try {
      setIsLoadingThumbnails(true);
      const thumbs = await renderPdfAllThumbnails(selectedFile, 30);
      const items: PageItem[] = thumbs.map((t) => ({
        id: `p-${t.pageNumber}-${Math.random()}`,
        originalPageNumber: t.pageNumber,
        dataUrl: t.dataUrl,
      }));
      setPages(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rendering page thumbnails.');
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPages(updated);
    setIsDone(false);
  };

  const handleDelete = (index: number) => {
    if (pages.length <= 1) {
      setError('Document must have at least 1 page.');
      return;
    }
    const item = pages[index];
    setDeletedPages((prev) => [...prev, item]);
    setPages((prev) => prev.filter((_, i) => i !== index));
    setIsDone(false);
  };

  const handleRestore = () => {
    if (deletedPages.length === 0) return;
    const lastDeleted = deletedPages[deletedPages.length - 1];
    setDeletedPages((prev) => prev.slice(0, -1));
    setPages((prev) => [...prev, lastDeleted]);
    setIsDone(false);
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    setError(null);
    try {
      const order = pages.map((p) => p.originalPageNumber);
      const blob = await organizePdfPages(file, order);
      setResultBlob(blob);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorganize PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const baseName = file.name.replace(/\.pdf$/i, '');
      saveAs(resultBlob, `${baseName}_organized.pdf`);
    }
  };

  return (
    <div id="organize-pdf-view" className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Organize &amp; Delete PDF Pages</h1>
        <p className="text-sm text-slate-600 mt-2">
          Visually rearrange page order, delete unnecessary pages, and produce a clean streamlined PDF.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {!file ? (
          <label
            id="organize-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-purple-50/20"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select PDF to organize</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop your document here</span>
            <span className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Header info & Undo */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500">
                  {pages.length} pages currently in document
                  {deletedPages.length > 0 && ` (${deletedPages.length} removed)`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {deletedPages.length > 0 && (
                  <button
                    onClick={handleRestore}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-purple-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Page ({deletedPages.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setPages([]);
                    setIsDone(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                >
                  Change file
                </button>
              </div>
            </div>

            {/* Pages Grid */}
            {isLoadingThumbnails ? (
              <div className="flex items-center justify-center p-12 text-xs text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span>Loading pages...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    id={`organize-page-${idx}`}
                    className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center shadow-xs hover:shadow-md transition-shadow relative group"
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700">
                        Position #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete this page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg border border-slate-100">
                      <img
                        src={p.dataUrl}
                        alt={`Page from original ${p.originalPageNumber}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="w-full mt-2.5 flex items-center justify-between">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'left')}
                        className="p-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-purple-600 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400">
                        Orig. pg {p.originalPageNumber}
                      </span>
                      <button
                        disabled={idx === pages.length - 1}
                        onClick={() => handleMove(idx, 'right')}
                        className="p-1 rounded bg-slate-100 hover:bg-purple-100 hover:text-purple-600 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        title="Move right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
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
                  id="btn-save-organize"
                  disabled={isProcessing}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reorganizing pages...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Save Organized PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Saved Successfully!
                  </span>
                  <button
                    id="btn-download-organized"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Reordered PDF</span>
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
