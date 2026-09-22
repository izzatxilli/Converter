import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  acceptedExtensions: string[];
  title: string;
  subtitle: string;
  onFilesSelected: (files: File[]) => void;
  allowMultiple?: boolean;
  activeFileName?: string;
  isProcessing?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptedExtensions,
  title,
  subtitle,
  onFilesSelected,
  allowMultiple = false,
  activeFileName,
  isProcessing = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    setDragError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (acceptedExtensions.includes(ext) || acceptedExtensions.includes('*')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0 && files.length > 0) {
      setDragError(`Please select a file with ${acceptedExtensions.join(', ')} extension.`);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        onFilesSelected(allowMultiple ? valid : [valid[0]]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0) {
        onFilesSelected(allowMultiple ? valid : [valid[0]]);
      }
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedExtensions.join(',')}
        onChange={handleInputChange}
        className="hidden"
        id="file-picker-input"
      />

      <div
        id="document-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.002]'
            : activeFileName
            ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
            : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50'
        } ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform ${
              activeFileName
                ? 'bg-emerald-100 text-emerald-600'
                : isDragOver
                ? 'bg-indigo-100 text-indigo-600 scale-110'
                : 'bg-white text-slate-600 shadow-xs border border-slate-200'
            }`}
          >
            {activeFileName ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800">
              {activeFileName ? (
                <span className="flex items-center justify-center gap-1.5 text-emerald-800 font-medium">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {activeFileName}
                </span>
              ) : (
                title
              )}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {activeFileName ? 'Click or drag a new file to replace it' : subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {acceptedExtensions.map((ext) => (
              <span
                key={ext}
                className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-white text-slate-600 border border-slate-200"
              >
                {ext.toUpperCase()}
              </span>
            ))}
            <span className="text-xs text-slate-400">• Drag &amp; drop or click to browse</span>
          </div>

          {dragError && (
            <div className="flex items-center text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200 mt-2">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {dragError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
