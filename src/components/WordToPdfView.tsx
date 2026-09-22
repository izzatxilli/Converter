import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Settings,
  Copy,
  Check,
  Search,
  BookOpen,
  Eye,
  FileCode,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { ExtractedDocxDocument, PdfExportSettings } from '../types';
import { DropZone } from './DropZone';
import { generatePdfFromDocx } from '../utils/pdfGenerator';

interface WordToPdfViewProps {
  document: ExtractedDocxDocument | null;
  isParsing: boolean;
  onSelectDocx: (file: File) => void;
  onReset: () => void;
}

export const WordToPdfView: React.FC<WordToPdfViewProps> = ({
  document,
  isParsing,
  onSelectDocx,
  onReset,
}) => {
  const [settings, setSettings] = useState<PdfExportSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    fontFamily: 'helvetica',
    fontSizePt: 11,
    lineHeight: 1.4,
    marginsMm: 20,
    includeHeaderFooter: true,
    headerTitle: '',
    pageNumberPosition: 'bottom-center',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'preview' | 'html' | 'text'>('preview');

  const handleCopyText = async () => {
    if (!document) return;
    await navigator.clipboard.writeText(document.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!document) return;
    setIsGenerating(true);
    try {
      const blob = await generatePdfFromDocx(document, settings);
      const outputName = document.fileName.replace(/\.docx$/i, '') + '.pdf';
      saveAs(blob, outputName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Estimated PDF pages calculation
  const estimatedPages = document
    ? Math.max(1, Math.ceil(document.wordCount / 380))
    : 1;

  return (
    <div className="space-y-6">
      {!document && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Convert Microsoft Word (.docx) to PDF
            </h2>
            <p className="text-xs text-slate-500">
              Render structured documents with clean typography, automatic pagination, headers, and footers
            </p>
          </div>

          <DropZone
            acceptedExtensions={['.docx', '.doc']}
            title="Choose a Word document to convert to PDF"
            subtitle="Drop your .docx document here or click to browse"
            onFilesSelected={(files) => onSelectDocx(files[0])}
            isProcessing={isParsing}
          />

          {isParsing && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div className="text-xs font-medium text-blue-900">
                Parsing Word document structure and styles...
              </div>
            </div>
          )}
        </div>
      )}

      {document && (
        <div className="space-y-6">
          {/* Document Header & Statistics */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 truncate max-w-md">
                    {document.fileName}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Extracted Successfully</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  id="btn-docx-copy-text"
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Copy Text
                    </>
                  )}
                </button>

                <button
                  id="btn-docx-reset"
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center text-xs text-slate-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Estimated Pages
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  ~{estimatedPages}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center text-xs text-slate-500 mb-1">
                  <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Total Words
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  {document.wordCount.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center text-xs text-slate-500 mb-1">
                  <FileCode className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Extracted Paragraphs
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  {document.paragraphCount}
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Document Inspection / Simulated PDF Paper Preview */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[700px]">
              {/* Inspection Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    id="btn-viewtab-preview"
                    type="button"
                    onClick={() => setViewTab('preview')}
                    className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewTab === 'preview'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Document Layout
                  </button>
                  <button
                    id="btn-viewtab-text"
                    type="button"
                    onClick={() => setViewTab('text')}
                    className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewTab === 'text'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Clean Text
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="input-search-extracted-docx"
                    type="text"
                    placeholder="Search in document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Document Display Area */}
              <div className="flex-1 overflow-y-auto mt-3 pr-1 bg-slate-100/60 p-4 rounded-lg flex justify-center">
                {viewTab === 'preview' && (
                  <div
                    className="w-full max-w-2xl bg-white shadow-md border border-slate-200 rounded-sm p-8 sm:p-12 transition-all"
                    style={{
                      fontFamily:
                        settings.fontFamily === 'times'
                          ? 'Times New Roman, serif'
                          : settings.fontFamily === 'courier'
                          ? 'Courier New, monospace'
                          : 'Helvetica, Arial, sans-serif',
                    }}
                  >
                    {/* Simulated PDF Header */}
                    {settings.includeHeaderFooter && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pb-2 mb-6 border-b border-slate-200 font-sans">
                        <span>
                          {settings.headerTitle || document.fileName.replace(/\.docx$/i, '')}
                        </span>
                        <span>CONFIDENTIAL / PREVIEW</span>
                      </div>
                    )}

                    {/* Formatted HTML representation extracted by Mammoth */}
                    <div
                      className="docx-html-preview prose prose-slate max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ __html: document.htmlContent }}
                    />

                    {/* Simulated PDF Footer */}
                    {settings.includeHeaderFooter && (
                      <div className="flex justify-center items-center text-[10px] text-slate-400 pt-6 mt-8 border-t border-slate-200 font-sans">
                        <span>Page 1 of {estimatedPages}</span>
                      </div>
                    )}
                  </div>
                )}

                {viewTab === 'text' && (
                  <div className="w-full h-full bg-white p-4 rounded-lg border border-slate-200 overflow-y-auto">
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {document.rawText}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Right: PDF Export Settings & Download */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    PDF Geometry &amp; Styling
                  </h3>
                </div>

                {/* Page Size & Orientation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Page Size</label>
                    <select
                      id="select-pdf-pagesize"
                      value={settings.pageSize}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pageSize: e.target.value as PdfExportSettings['pageSize'],
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="a4">A4 (Standard)</option>
                      <option value="letter">US Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Orientation</label>
                    <select
                      id="select-pdf-orientation"
                      value={settings.orientation}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          orientation: e.target.value as PdfExportSettings['orientation'],
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>

                {/* Font Family & Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">PDF Typography</label>
                    <select
                      id="select-pdf-font"
                      value={settings.fontFamily}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fontFamily: e.target.value as PdfExportSettings['fontFamily'],
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="helvetica">Helvetica / Clean</option>
                      <option value="times">Times / Formal</option>
                      <option value="courier">Courier / Monospace</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Font Size</label>
                    <select
                      id="select-pdf-fontsize"
                      value={settings.fontSizePt}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fontSizePt: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value={9}>9 pt (Compact)</option>
                      <option value={10}>10 pt (Dense)</option>
                      <option value={11}>11 pt (Standard)</option>
                      <option value={12}>12 pt (Large)</option>
                    </select>
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Margins</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Compact', val: 12 },
                      { label: 'Standard', val: 20 },
                      { label: 'Wide', val: 30 },
                    ].map((m) => (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setSettings({ ...settings, marginsMm: m.val })}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md border text-center transition-all ${
                          settings.marginsMm === m.val
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header & Footer Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700">Add Header &amp; Page Numbers</span>
                    <input
                      type="checkbox"
                      checked={settings.includeHeaderFooter}
                      onChange={(e) =>
                        setSettings({ ...settings, includeHeaderFooter: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </label>

                  {settings.includeHeaderFooter && (
                    <div className="space-y-2 pt-1 pl-2 border-l-2 border-slate-200">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600">
                          Custom Header Title
                        </label>
                        <input
                          type="text"
                          placeholder={document.fileName.replace(/\.docx$/i, '')}
                          value={settings.headerTitle}
                          onChange={(e) =>
                            setSettings({ ...settings, headerTitle: e.target.value })
                          }
                          className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1 bg-white text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600">
                          Page Number Placement
                        </label>
                        <select
                          value={settings.pageNumberPosition}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              pageNumberPosition: e.target
                                .value as PdfExportSettings['pageNumberPosition'],
                            })
                          }
                          className="w-full text-xs rounded-md border border-slate-200 px-2 py-1 bg-white text-slate-800"
                        >
                          <option value="bottom-center">Bottom Center (Classic)</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="top-right">Top Right</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  id="btn-download-pdf-file"
                  type="button"
                  disabled={isGenerating}
                  onClick={handleDownloadPdf}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Rendering PDF document...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Document
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  High-fidelity vector PDF ready for sharing and printing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
