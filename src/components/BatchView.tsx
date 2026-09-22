import React, { useState } from 'react';
import {
  Layers,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { QueueItem } from '../types';
import { DropZone } from './DropZone';
import { extractPdfDocument } from '../utils/pdfExtractor';
import { generateDocxBlob } from '../utils/docxGenerator';
import { extractDocxDocument } from '../utils/docxExtractor';
import { generatePdfFromDocx } from '../utils/pdfGenerator';

interface BatchViewProps {
  queue: QueueItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onUpdateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
}

export const BatchView: React.FC<BatchViewProps> = ({
  queue,
  onAddFiles,
  onRemoveItem,
  onClearQueue,
  onUpdateQueueItem,
}) => {
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleProcessItem = async (item: QueueItem) => {
    if (item.status === 'completed' && item.outputBlob) return;

    onUpdateQueueItem(item.id, { status: 'parsing', progress: 20 });

    try {
      if (item.type === 'pdf') {
        // PDF to DOCX
        const extracted = await extractPdfDocument(item.file, (p) => {
          onUpdateQueueItem(item.id, { progress: Math.round(20 + p * 0.4) });
        });

        onUpdateQueueItem(item.id, {
          status: 'converting',
          progress: 75,
          extractedPdf: extracted,
        });

        const docxBlob = await generateDocxBlob(extracted, {
          fontFamily: 'Calibri',
          fontSizePt: 11,
          lineSpacing: 1.15,
          preservePageBreaks: true,
          detectHeadings: true,
          includePageNumbers: true,
          authorName: '',
          marginSize: 'normal',
        });

        const outputName = item.name.replace(/\.pdf$/i, '') + '.docx';
        onUpdateQueueItem(item.id, {
          status: 'completed',
          progress: 100,
          outputBlob: docxBlob,
          outputFilename: outputName,
        });
      } else {
        // DOCX to PDF
        const extracted = await extractDocxDocument(item.file);
        onUpdateQueueItem(item.id, {
          status: 'converting',
          progress: 60,
          extractedDocx: extracted,
        });

        const pdfBlob = await generatePdfFromDocx(extracted, {
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

        const outputName = item.name.replace(/\.docx$/i, '') + '.pdf';
        onUpdateQueueItem(item.id, {
          status: 'completed',
          progress: 100,
          outputBlob: pdfBlob,
          outputFilename: outputName,
        });
      }
    } catch (err: any) {
      console.error('Conversion failed for item:', item.name, err);
      onUpdateQueueItem(item.id, {
        status: 'error',
        error: err.message || 'Conversion error',
      });
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);
    for (const item of queue) {
      if (item.status !== 'completed') {
        await handleProcessItem(item);
      }
    }
    setIsProcessingAll(false);
  };

  const handleDownloadSingle = (item: QueueItem) => {
    if (item.outputBlob && item.outputFilename) {
      saveAs(item.outputBlob, item.outputFilename);
    }
  };

  const handleDownloadAllZip = async () => {
    const completedItems = queue.filter((it) => it.outputBlob && it.outputFilename);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      completedItems.forEach((it) => {
        if (it.outputBlob && it.outputFilename) {
          zip.file(it.outputFilename, it.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'converted_documents.zip');
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Batch Document Conversion
          </h2>
          <p className="text-xs text-slate-500">
            Drop multiple PDF and DOCX files at once. PDFs convert to Word (.docx), Word documents convert to PDF.
          </p>
        </div>

        <DropZone
          acceptedExtensions={['.pdf', '.docx', '.doc']}
          title="Add files to batch queue"
          subtitle="Drag &amp; drop multiple PDFs or DOCXs here"
          onFilesSelected={onAddFiles}
          allowMultiple={true}
        />
      </div>

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Conversion Queue ({queue.length} files)
              </h3>
              <p className="text-xs text-slate-500">
                {completedCount} of {queue.length} completed
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-batch-clear"
                type="button"
                onClick={onClearQueue}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Queue
              </button>

              {completedCount > 0 && (
                <button
                  id="btn-batch-download-zip"
                  type="button"
                  disabled={isZipping}
                  onClick={handleDownloadAllZip}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  {isZipping ? 'Archiving...' : `Download ZIP (${completedCount})`}
                </button>
              )}

              <button
                id="btn-batch-convert-all"
                type="button"
                disabled={isProcessingAll || completedCount === queue.length}
                onClick={handleConvertAll}
                className="inline-flex items-center px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isProcessingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Converting Queue...
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    Convert All
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'pdf'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                    {item.type === 'pdf' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="font-mono uppercase font-semibold text-slate-600">
                        {item.type}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-mono uppercase font-semibold text-indigo-600">
                        {item.targetType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress / Status & Actions */}
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  {item.status === 'completed' && (
                    <span className="inline-flex items-center text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      Ready
                    </span>
                  )}

                  {(item.status === 'parsing' || item.status === 'converting') && (
                    <div className="flex items-center space-x-2 w-32">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {item.progress}%
                      </span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <span className="inline-flex items-center text-xs text-rose-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Failed
                    </span>
                  )}

                  {item.status === 'idle' && (
                    <button
                      type="button"
                      onClick={() => handleProcessItem(item)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
                    >
                      Convert
                    </button>
                  )}

                  {item.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs"
                      title="Download file"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Save
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
