import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { rotatePdfDocument } from '../utils/pdfTools';
import { renderPdfAllThumbnails } from '../utils/pdfThumbnail';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const RotatePdfView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotations, setRotations] = useState<{ [pageNum: number]: number }>({});
  const [thumbnails, setThumbnails] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
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
    setRotations({});

    try {
      setIsLoadingThumbnails(true);
      const thumbs = await renderPdfAllThumbnails(selectedFile, 30);
      setThumbnails(thumbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rendering PDF thumbnails.');
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const handleRotatePage = (pageNum: number, direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    setRotations((prev) => {
      const current = prev[pageNum] || 0;
      const next = (current + delta) % 360;
      return { ...prev, [pageNum]: next < 0 ? next + 360 : next };
    });
    setIsDone(false);
  };

  const handleRotateAll = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    setRotations((prev) => {
      const nextMap: { [pageNum: number]: number } = {};
      thumbnails.forEach((t) => {
        const current = prev[t.pageNumber] || 0;
        const next = (current + delta) % 360;
        nextMap[t.pageNumber] = next < 0 ? next + 360 : next;
      });
      return nextMap;
    });
    setIsDone(false);
  };

  const handleReset = () => {
    setRotations({});
    setIsDone(false);
  };

  const handleSave = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await rotatePdfDocument(file, rotations);
      setResultBlob(blob);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const baseName = file.name.replace(/\.pdf$/i, '');
      saveAs(resultBlob, `${baseName}_rotated.pdf`);
    }
  };

  return (
    <div id="rotate-pdf-view" className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <RotateCw className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Rotate PDF Pages</h1>
        <p className="text-sm text-slate-600 mt-2">
          Rotate individual pages or all pages at once with live real-time visual previews.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {!file ? (
          <label
            id="rotate-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/20"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select PDF to rotate</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop your document here</span>
            <span className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500">{thumbnails.length} pages loaded</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-rotate-all-left"
                  onClick={() => handleRotateAll('ccw')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rotate All Left
                </button>
                <button
                  id="btn-rotate-all-right"
                  onClick={() => handleRotateAll('cw')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate All Right
                </button>
                <button
                  id="btn-rotate-reset"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Grid of pages */}
            {isLoadingThumbnails ? (
              <div className="flex items-center justify-center p-12 text-xs text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                <span>Generating page previews...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {thumbnails.map((thumb) => {
                  const deg = rotations[thumb.pageNumber] || 0;
                  return (
                    <div
                      key={thumb.pageNumber}
                      id={`rotate-page-card-${thumb.pageNumber}`}
                      className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg border border-slate-100">
                        <img
                          src={thumb.dataUrl}
                          alt={`Page ${thumb.pageNumber}`}
                          style={{
                            transform: `rotate(${deg}deg)`,
                            transition: 'transform 0.25s ease-in-out',
                          }}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="w-full mt-3 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          #{thumb.pageNumber} {deg > 0 && <span className="text-sky-600">({deg}°)</span>}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-rotate-left-${thumb.pageNumber}`}
                            onClick={() => handleRotatePage(thumb.pageNumber, 'ccw')}
                            className="p-1 rounded bg-slate-100 hover:bg-sky-100 hover:text-sky-600 text-slate-600 transition-colors"
                            title="Rotate 90° Left"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-rotate-right-${thumb.pageNumber}`}
                            onClick={() => handleRotatePage(thumb.pageNumber, 'cw')}
                            className="p-1 rounded bg-slate-100 hover:bg-sky-100 hover:text-sky-600 text-slate-600 transition-colors"
                            title="Rotate 90° Right"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                id="btn-rotate-change-file"
                onClick={() => {
                  setFile(null);
                  setThumbnails([]);
                  setIsDone(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Change document
              </button>

              <div>
                {!isDone ? (
                  <button
                    id="btn-save-rotation"
                    disabled={isProcessing}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rotating PDF...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4" />
                        <span>Save &amp; Apply Rotation</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Rotated Successfully!
                    </span>
                    <button
                      id="btn-download-rotated"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Rotated PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
