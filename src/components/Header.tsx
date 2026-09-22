import React from 'react';
import {
  FileText,
  FileType,
  Files,
  Scissors,
  RotateCw,
  Stamp,
  Layers,
  Image,
  FolderArchive,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Heart,
} from 'lucide-react';
import { ConversionMode } from '../types';

interface HeaderProps {
  currentMode: ConversionMode;
  onSelectMode: (mode: ConversionMode) => void;
  onLoadSamplePdf: () => void;
  onLoadSampleDocx: () => void;
  isProcessingSample: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onLoadSamplePdf,
  onLoadSampleDocx,
  isProcessingSample,
}) => {
  const navItems = [
    { mode: 'home' as ConversionMode, label: 'All Tools', icon: LayoutGrid },
    { mode: 'pdf-to-word' as ConversionMode, label: 'PDF to Word', icon: FileText },
    { mode: 'word-to-pdf' as ConversionMode, label: 'Word to PDF', icon: FileType },
    { mode: 'merge-pdf' as ConversionMode, label: 'Merge PDF', icon: Files },
    { mode: 'split-pdf' as ConversionMode, label: 'Split PDF', icon: Scissors },
    { mode: 'organize-pdf' as ConversionMode, label: 'Organize', icon: Layers },
    { mode: 'rotate-pdf' as ConversionMode, label: 'Rotate', icon: RotateCw },
    { mode: 'watermark-pdf' as ConversionMode, label: 'Watermark', icon: Stamp },
    { mode: 'pdf-to-jpg' as ConversionMode, label: 'PDF to JPG', icon: Image },
    { mode: 'batch' as ConversionMode, label: 'Batch Queue', icon: FolderArchive },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & actions row */}
        <div className="flex items-center justify-between py-3 gap-3 border-b border-slate-100">
          {/* Logo & Title */}
          <div
            id="brand-logo"
            onClick={() => onSelectMode('home')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs group-hover:bg-red-700 transition-colors">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  iLove<span className="text-red-600 group-hover:text-slate-900">PDF</span>
                  <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">&amp; Word</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  100% Client-Side
                </span>
              </div>
            </div>
          </div>

          {/* Quick Sample Loaders */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Try Sample:</span>
            <button
              id="btn-load-sample-pdf"
              type="button"
              disabled={isProcessingSample}
              onClick={onLoadSamplePdf}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              title="Load a sample multi-page business PDF"
            >
              <Sparkles className="w-3 h-3 mr-1 text-red-600" />
              Sample PDF
            </button>
            <button
              id="btn-load-sample-docx"
              type="button"
              disabled={isProcessingSample}
              onClick={onLoadSampleDocx}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              title="Load a sample structured Word requirements document"
            >
              <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
              Sample DOCX
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Bar for Tools */}
        <nav className="flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                id={`mode-tab-${item.mode}`}
                type="button"
                onClick={() => onSelectMode(item.mode)}
                className={`flex items-center px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

