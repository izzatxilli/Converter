import React, { useState } from 'react';
import {
  Files,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  Download,
  AlertCircle,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { mergePdfs } from '../utils/pdfTools';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface FileWithMeta {
  id: string;
  file: File;
  pageCount: number;
}

export const MergePdfView: React.FC = () => {
  const [fileList, setFileList] = useState<FileWithMeta[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsDone(false);
    setMergedBlob(null);

    const pdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      setError('Please select valid PDF documents.');
      return;
    }

    const newItems: FileWithMeta[] = [];
    for (const file of pdfFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pageCount: doc.getPageCount(),
        });
      } catch (err) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pageCount: 1,
        });
      }
    }

    setFileList((prev) => [...prev, ...newItems]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fileList.length) return;
    const updated = [...fileList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFileList(updated);
  };

  const handleRemove = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMerge = async () => {
    if (fileList.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await mergePdfs(fileList.map((f) => f.file));
      setMergedBlob(blob);
      setIsDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedBlob) {
      saveAs(mergedBlob, 'merged_document.pdf');
    }
  };

  const totalPages = fileList.reduce((acc, item) => acc + item.pageCount, 0);

  return (
    <div id="merge-pdf-view" className="space-y-8">
      {/* Title & Description */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Files className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Merge PDF Files</h1>
        <p className="text-sm text-slate-600 mt-2">
          Combine multiple PDF files into a single unified document in your exact preferred sequence.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {/* Upload Zone / Add more files */}
        {fileList.length === 0 ? (
          <label
            id="merge-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-red-50/20"
          >
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select multiple PDF files</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop them here</span>
            <span className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose Files
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {fileList.length} files selected ({totalPages} total pages)
                </h3>
                <p className="text-xs text-slate-500">
                  Use the arrows to reorder files. They will be merged in the top-to-bottom order below.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Plus className="w-4 h-4 text-red-600" />
                <span>Add More PDFs</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
                />
              </label>
            </div>

            {/* Reorderable List */}
            <div className="space-y-2.5">
              {fileList.map((item, index) => (
                <div
                  key={item.id}
                  id={`merge-file-row-${index}`}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <Files className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-xs md:max-w-md">
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(item.file.size / 1024).toFixed(1)} KB • {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`btn-move-up-${index}`}
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-move-down-${index}`}
                      disabled={index === fileList.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-remove-${index}`}
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <button
                id="btn-clear-all"
                onClick={() => {
                  setFileList([]);
                  setMergedBlob(null);
                  setIsDone(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear all files
              </button>

              <div className="flex items-center gap-3">
                {!isDone ? (
                  <button
                    id="btn-merge-pdf"
                    disabled={isProcessing || fileList.length < 2}
                    onClick={handleMerge}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Merging {fileList.length} PDFs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Merge PDF</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Merged Successfully!
                    </span>
                    <button
                      id="btn-download-merged"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Merged PDF</span>
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
