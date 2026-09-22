import React, { useState } from 'react';
import {
  Stamp,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Loader2,
  Sliders,
} from 'lucide-react';
import { applyWatermarkToPdf, WatermarkOptions } from '../utils/pdfTools';
import { renderPdfPageToDataUrl } from '../utils/pdfThumbnail';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const WatermarkPdfView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [firstPagePreview, setFirstPagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.35,
    rotation: -45,
    color: 'red',
    position: 'diagonal',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE', 'APPROVED'];

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
      const previewUrl = await renderPdfPageToDataUrl(buffer, 1, 0.4);
      setFirstPagePreview(previewUrl);
    } catch (err) {
      console.warn('Could not generate preview image', err);
    }
  };

  const handleApply = async () => {
    if (!file) return;

    if (!options.text.trim()) {
      setError('Please provide watermark text.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await applyWatermarkToPdf(file, options);
      setResultBlob(blob);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && file) {
      const baseName = file.name.replace(/\.pdf$/i, '');
      saveAs(resultBlob, `${baseName}_watermarked.pdf`);
    }
  };

  return (
    <div id="watermark-pdf-view" className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Stamp className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Add Watermark to PDF</h1>
        <p className="text-sm text-slate-600 mt-2">
          Stamp text watermarks like CONFIDENTIAL or DRAFT across your PDF with full transparency and angle control.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {!file ? (
          <label
            id="watermark-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-fuchsia-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-fuchsia-50/20"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select PDF file for watermark</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop your document here</span>
            <span className="mt-4 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Interactive Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Real-Time Watermark Preview
              </span>
              <div className="relative w-64 md:w-80 aspect-[1/1.4] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex items-center justify-center">
                {firstPagePreview ? (
                  <img
                    src={firstPagePreview}
                    alt="Document preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between text-[8px] text-slate-300 select-none">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-5/6" />
                      <div className="h-2 bg-slate-100 rounded w-4/6" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                )}

                {/* Simulated Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                  style={{
                    alignItems:
                      options.position === 'header'
                        ? 'flex-start'
                        : options.position === 'footer'
                        ? 'flex-end'
                        : 'center',
                    padding: options.position === 'header' || options.position === 'footer' ? '1.5rem' : '0',
                  }}
                >
                  <span
                    style={{
                      transform: `rotate(${options.position === 'diagonal' ? -45 : options.rotation}deg)`,
                      fontSize: `${Math.round(options.fontSize * 0.45)}px`,
                      opacity: options.opacity,
                      color:
                        options.color === 'red'
                          ? '#dc2626'
                          : options.color === 'blue'
                          ? '#2563eb'
                          : options.color === 'gray'
                          ? '#6b7280'
                          : '#111827',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {options.text || 'WATERMARK'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-4 text-center">
                Applied across every page with vector precision.
              </p>
            </div>

            {/* Right: Controls & Options */}
            <div className="lg:col-span-6 space-y-5">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setOptions((prev) => ({ ...prev, text: preset }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        options.text === preset
                          ? 'bg-fuchsia-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={options.text}
                  onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. STRICTLY CONFIDENTIAL"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-medium"
                />
              </div>

              {/* Position & Placement */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placement</label>
                  <select
                    value={options.position}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        position: e.target.value as WatermarkOptions['position'],
                      }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="diagonal">Diagonal Across</option>
                    <option value="center">Center Horizontal</option>
                    <option value="header">Top Header</option>
                    <option value="footer">Bottom Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                  <select
                    value={options.color}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        color: e.target.value as WatermarkOptions['color'],
                      }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="red">Red (Stamp Alert)</option>
                    <option value="gray">Subtle Gray</option>
                    <option value="blue">Executive Blue</option>
                    <option value="black">Bold Black</option>
                  </select>
                </div>
              </div>

              {/* Sliders: Opacity & Size */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Opacity</span>
                    <span>{Math.round(options.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={options.opacity}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-fuchsia-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Font Size</span>
                    <span>{options.fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    step="2"
                    value={options.fontSize}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, fontSize: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-fuchsia-600"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setFile(null);
                    setFirstPagePreview(null);
                    setIsDone(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Change file
                </button>

                {!isDone ? (
                  <button
                    id="btn-apply-watermark"
                    disabled={isProcessing}
                    onClick={handleApply}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying watermark...</span>
                      </>
                    ) : (
                      <>
                        <Stamp className="w-4 h-4" />
                        <span>Add Watermark</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                    </span>
                    <button
                      id="btn-download-watermarked"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
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
