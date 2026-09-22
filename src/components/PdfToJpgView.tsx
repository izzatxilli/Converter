import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { renderPdfPageToBlob } from '../utils/pdfThumbnail';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ConvertedImage {
  pageNumber: number;
  blob: Blob;
  previewUrl: string;
}

export const PdfToJpgView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF document.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImages([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setTotalPages(doc.getPageCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reading PDF.');
    }
  };

  const handleConvert = async () => {
    if (!file || totalPages === 0) return;

    setIsProcessing(true);
    setError(null);
    setImages([]);
    const results: ConvertedImage[] = [];

    try {
      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i, total: totalPages });
        const blob = await renderPdfPageToBlob(file, i, format, 1.75);
        const previewUrl = URL.createObjectURL(blob);
        results.push({ pageNumber: i, blob, previewUrl });
      }
      setImages(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (img: ConvertedImage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    saveAs(img.blob, `${baseName}_page_${img.pageNumber}.${ext}`);
  };

  const handleDownloadAllZip = async () => {
    if (!file || images.length === 0) return;

    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';

    images.forEach((img) => {
      zip.file(`${baseName}_page_${img.pageNumber}.${ext}`, img.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${baseName}_images.zip`);
  };

  return (
    <div id="pdf-to-jpg-view" className="space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">PDF to JPG / PNG</h1>
        <p className="text-sm text-slate-600 mt-2">
          Convert each page of your PDF into high-definition raster images and download as a ZIP file.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {!file ? (
          <label
            id="pdf-to-jpg-dropzone"
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-base font-bold text-slate-900">Select PDF to convert to images</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop your document here</span>
            <span className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB • {totalPages} total pages
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Format:</span>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/png')}
                    disabled={isProcessing}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="image/jpeg">JPG (Standard)</option>
                    <option value="image/png">PNG (Lossless)</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setImages([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Change file
                </button>
              </div>
            </div>

            {/* If not converted yet */}
            {images.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-slate-600">
                  Ready to extract all <span className="font-bold text-slate-900">{totalPages}</span> pages as high-resolution {format === 'image/jpeg' ? 'JPG' : 'PNG'} images.
                </p>

                <button
                  id="btn-convert-pdf-to-jpg"
                  disabled={isProcessing}
                  onClick={handleConvert}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        Converting page {progress.current} of {progress.total}...
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Convert to {format === 'image/jpeg' ? 'JPG' : 'PNG'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All {images.length} pages converted successfully!
                  </span>

                  <button
                    id="btn-download-all-zip"
                    onClick={handleDownloadAllZip}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Download All as ZIP</span>
                  </button>
                </div>

                {/* Grid of image results */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {images.map((img) => (
                    <div
                      key={img.pageNumber}
                      id={`jpg-page-${img.pageNumber}`}
                      className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg border border-slate-100">
                        <img
                          src={img.previewUrl}
                          alt={`Page ${img.pageNumber}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="w-full mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          Page {img.pageNumber}
                        </span>
                        <button
                          onClick={() => handleDownloadSingle(img)}
                          className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                          title="Download this image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
