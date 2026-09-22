import React, { useState } from 'react';
import {
  FileText,
  Download,
  Settings,
  Sliders,
  Copy,
  Check,
  Search,
  BookOpen,
  Hash,
  Eye,
  Edit3,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { ExtractedPdfDocument, DocxExportSettings } from '../types';
import { DropZone } from './DropZone';
import { generateDocxBlob } from '../utils/docxGenerator';

interface PdfToWordViewProps {
  document: ExtractedPdfDocument | null;
  isParsing: boolean;
  parseProgress: number;
  onSelectPdf: (file: File) => void;
  onReset: () => void;
}

export const PdfToWordView: React.FC<PdfToWordViewProps> = ({
  document,
  isParsing,
  parseProgress,
  onSelectPdf,
  onReset,
}) => {
  const [settings, setSettings] = useState<DocxExportSettings>({
    fontFamily: 'Calibri',
    fontSizePt: 11,
    lineSpacing: 1.15,
    preservePageBreaks: true,
    detectHeadings: true,
    includePageNumbers: true,
    authorName: '',
    marginSize: 'normal',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePageTab, setActivePageTab] = useState<number | 'all'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedText, setEditedText] = useState<string>('');

  // Update edited text when document changes
  React.useEffect(() => {
    if (document) {
      setEditedText(document.fullText);
    }
  }, [document]);

  const handleCopyText = async () => {
    if (!document) return;
    const textToCopy = isEditMode ? editedText : document.fullText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!document) return;
    const textToExport = isEditMode ? editedText : document.fullText;
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const outputName = document.fileName.replace(/\.pdf$/i, '') + '.txt';
    saveAs(blob, outputName);
  };

  const handleGenerateWord = async () => {
    if (!document) return;
    setIsGenerating(true);
    try {
      let docToExport = document;

      // If user edited text in edit mode, construct a modified document representation
      if (isEditMode && editedText !== document.fullText) {
        const lines = editedText.split('\n');
        docToExport = {
          ...document,
          fullText: editedText,
          pages: [
            {
              pageNumber: 1,
              rawText: editedText,
              lines: lines.map((l) => ({
                text: l,
                fontSize: settings.fontSizePt,
                isHeading: l.trim().length > 0 && l.trim().length < 60 && !l.endsWith('.'),
                headingLevel: l.trim().length < 40 ? 1 : 2,
              })),
            },
          ],
        };
      }

      const blob = await generateDocxBlob(docToExport, settings);
      const outputName = document.fileName.replace(/\.pdf$/i, '') + '.docx';
      saveAs(blob, outputName);
    } catch (err) {
      console.error('Failed to generate DOCX:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalHeadings = document
    ? document.pages.reduce(
        (acc, p) => acc + p.lines.filter((l) => l.isHeading).length,
        0
      )
    : 0;

  const filteredPages = document
    ? document.pages.filter((p) => {
        if (activePageTab !== 'all' && p.pageNumber !== activePageTab) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        return p.rawText.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Upload or Active File Banner */}
      {!document && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Convert PDF to Microsoft Word (.docx)
            </h2>
            <p className="text-xs text-slate-500">
              Extract structural paragraphs, headings, typography, and page breaks without server upload
            </p>
          </div>

          <DropZone
            acceptedExtensions={['.pdf']}
            title="Choose a PDF file to extract &amp; convert"
            subtitle="Drop your document here or click to select from your files"
            onFilesSelected={(files) => onSelectPdf(files[0])}
            isProcessing={isParsing}
          />

          {isParsing && (
            <div className="mt-4 p-4 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-medium text-indigo-900 mb-1">
                  <span>Extracting text &amp; analyzing layout...</span>
                  <span>{parseProgress}%</span>
                </div>
                <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${parseProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {document && (
        <div className="space-y-6">
          {/* Document Header & Statistics Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 truncate max-w-md">
                    {document.fileName}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Ready for Word Export</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  id="btn-pdf-copy-text"
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
                  id="btn-pdf-export-txt"
                  type="button"
                  onClick={handleExportTxt}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  title="Export raw text file"
                >
                  <FileCode className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  .TXT
                </button>

                <button
                  id="btn-pdf-reset"
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center text-xs text-slate-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Total Pages
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  {document.pageCount}
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
                  <Hash className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Characters
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  {document.characterCount.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center text-xs text-slate-500 mb-1">
                  <Sliders className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Headings Detected
                </div>
                <div className="text-xl font-semibold text-slate-800">
                  {totalHeadings}
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace Grid: Document Inspection on Left, Settings & Download on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Document Inspection & Extracted Text Viewer */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[700px]">
              {/* Inspection Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Extracted Content
                  </span>
                  <button
                    id="btn-toggle-edit-mode"
                    type="button"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      isEditMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isEditMode ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview Layout
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit Text Before Export
                      </>
                    )}
                  </button>
                </div>

                {/* Search in text */}
                {!isEditMode && (
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="input-search-extracted-pdf"
                      type="text"
                      placeholder="Search in text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Page Selector Tabs */}
              {!isEditMode && document.pageCount > 1 && (
                <div className="flex items-center space-x-1 py-2 overflow-x-auto border-b border-slate-100 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setActivePageTab('all')}
                    className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                      activePageTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Pages ({document.pageCount})
                  </button>
                  {document.pages.map((p) => (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => setActivePageTab(p.pageNumber)}
                      className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
                        activePageTab === p.pageNumber
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Page {p.pageNumber}
                    </button>
                  ))}
                </div>
              )}

              {/* Text viewer area */}
              <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4 font-sans text-sm text-slate-800">
                {isEditMode ? (
                  <div className="h-full flex flex-col">
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mb-2">
                      You are editing extracted text directly. These changes will be applied to the exported Word document.
                    </div>
                    <textarea
                      id="textarea-pdf-edit-text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full flex-1 p-3 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-400 resize-none leading-relaxed"
                      placeholder="Extracted document text..."
                    />
                  </div>
                ) : filteredPages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No matching text found for "{searchQuery}"
                  </div>
                ) : (
                  filteredPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 mb-2 border-b border-slate-100">
                        <span>PAGE {page.pageNumber}</span>
                        <span>{page.lines.length} lines</span>
                      </div>

                      <div className="space-y-2">
                        {page.lines.map((line, idx) => {
                          if (line.isHeading) {
                            return (
                              <div
                                key={idx}
                                className="group flex items-start gap-2 pt-1"
                              >
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                  H{line.headingLevel || 2}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">
                                  {line.text}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                              {line.text}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Word (.docx) Export Settings & Action */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Word (.docx) Styling &amp; Output
                  </h3>
                </div>

                {/* Font Family */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Font Family</label>
                  <select
                    id="select-docx-font"
                    value={settings.fontFamily}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fontFamily: e.target.value as DocxExportSettings['fontFamily'],
                      })
                    }
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Calibri">Calibri (Standard Microsoft Office)</option>
                    <option value="Aptos">Aptos (Modern Default)</option>
                    <option value="Times New Roman">Times New Roman (Academic / Formal)</option>
                    <option value="Arial">Arial (Clean Sans-Serif)</option>
                    <option value="Georgia">Georgia (Editorial Serif)</option>
                  </select>
                </div>

                {/* Font Size & Line Spacing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Body Size</label>
                    <select
                      id="select-docx-fontsize"
                      value={settings.fontSizePt}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fontSizePt: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value={10}>10 pt (Dense)</option>
                      <option value={11}>11 pt (Standard)</option>
                      <option value={12}>12 pt (Large)</option>
                      <option value={14}>14 pt (Accessible)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Line Spacing</label>
                    <select
                      id="select-docx-spacing"
                      value={settings.lineSpacing}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          lineSpacing: Number(e.target.value),
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    >
                      <option value={1.0}>1.0 (Single)</option>
                      <option value={1.15}>1.15 (Normal)</option>
                      <option value={1.5}>1.5 (Spaced)</option>
                      <option value={2.0}>2.0 (Double)</option>
                    </select>
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Page Margins</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'narrow', 'wide'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSettings({ ...settings, marginSize: m })}
                        className={`px-2.5 py-1.5 text-xs font-medium capitalize rounded-md border text-center transition-all ${
                          settings.marginSize === m
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700">Auto-Detect &amp; Style Headings</span>
                    <input
                      type="checkbox"
                      checked={settings.detectHeadings}
                      onChange={(e) =>
                        setSettings({ ...settings, detectHeadings: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700">Preserve PDF Page Breaks</span>
                    <input
                      type="checkbox"
                      checked={settings.preservePageBreaks}
                      onChange={(e) =>
                        setSettings({ ...settings, preservePageBreaks: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700">Include Page Numbers in Footer</span>
                    <input
                      type="checkbox"
                      checked={settings.includePageNumbers}
                      onChange={(e) =>
                        setSettings({ ...settings, includePageNumbers: e.target.checked })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>
                </div>

                {/* Author Name */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-slate-700">Author / Organization (Optional)</label>
                  <input
                    id="input-docx-author"
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={settings.authorName}
                    onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  id="btn-download-word-file"
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateWord}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating .docx file...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Word Document (.docx)
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Fully compatible with Microsoft Word, Google Docs &amp; LibreOffice
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
