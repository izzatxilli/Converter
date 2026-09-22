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
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ConversionMode } from '../types';

interface ToolsHomeViewProps {
  onSelectMode: (mode: ConversionMode) => void;
}

interface ToolCard {
  id: string;
  mode: ConversionMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  category: 'convert' | 'organize' | 'edit';
}

const TOOLS: ToolCard[] = [
  // Convert
  {
    id: 'pdf-to-word',
    mode: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Extract text, formatting, headings, and structure from PDF into editable DOCX files.',
    icon: FileText,
    color: 'from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-200',
    badge: 'Popular',
    category: 'convert',
  },
  {
    id: 'word-to-pdf',
    mode: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Transform DOCX documents into clean, print-ready PDF files with custom typography.',
    icon: FileType,
    color: 'from-rose-600 to-red-600 text-red-600 bg-red-50 border-red-200',
    badge: 'Popular',
    category: 'convert',
  },
  {
    id: 'pdf-to-jpg',
    mode: 'pdf-to-jpg',
    title: 'PDF to JPG / PNG',
    description: 'Extract high-resolution image pages from any PDF document and save as a ZIP bundle.',
    icon: Image,
    color: 'from-amber-600 to-orange-600 text-amber-600 bg-amber-50 border-amber-200',
    category: 'convert',
  },
  // Organize
  {
    id: 'merge-pdf',
    mode: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single unified document in your exact preferred order.',
    icon: Files,
    color: 'from-red-600 to-rose-700 text-red-600 bg-red-50 border-red-200',
    badge: 'Top Tool',
    category: 'organize',
  },
  {
    id: 'split-pdf',
    mode: 'split-pdf',
    title: 'Split PDF',
    description: 'Separate one or more pages from your PDF file or extract specific custom page ranges.',
    icon: Scissors,
    color: 'from-emerald-600 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-200',
    category: 'organize',
  },
  {
    id: 'organize-pdf',
    mode: 'organize-pdf',
    title: 'Organize Pages',
    description: 'Visually sort, reorder, delete unnecessary pages, and save a clean restructured PDF.',
    icon: Layers,
    color: 'from-purple-600 to-violet-600 text-purple-600 bg-purple-50 border-purple-200',
    badge: 'Interactive',
    category: 'organize',
  },
  {
    id: 'rotate-pdf',
    mode: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate individual pages or the entire document clockwise or counterclockwise.',
    icon: RotateCw,
    color: 'from-sky-600 to-cyan-600 text-sky-600 bg-sky-50 border-sky-200',
    category: 'organize',
  },
  // Edit & Batch
  {
    id: 'watermark-pdf',
    mode: 'watermark-pdf',
    title: 'Watermark PDF',
    description: 'Overlay custom text watermarks like CONFIDENTIAL, DRAFT with opacity and angle controls.',
    icon: Stamp,
    color: 'from-fuchsia-600 to-pink-600 text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
    category: 'edit',
  },
  {
    id: 'batch',
    mode: 'batch',
    title: 'Batch Convert',
    description: 'Queue multiple PDF and DOCX files to convert simultaneously and download as a ZIP file.',
    icon: FolderArchive,
    color: 'from-slate-700 to-zinc-900 text-slate-700 bg-slate-100 border-slate-300',
    badge: 'Bulk',
    category: 'edit',
  },
];

export const ToolsHomeView: React.FC<ToolsHomeViewProps> = ({ onSelectMode }) => {
  return (
    <div id="tools-home-view" className="space-y-12">
      {/* Hero Banner with iLovePDF Inspiration */}
      <div id="hero-banner" className="text-center max-w-3xl mx-auto pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-4 border border-red-100">
          <Sparkles className="w-3.5 h-3.5" />
          Every tool you need to work with PDFs and Documents in one place
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Complete <span className="text-red-600">PDF &amp; Word</span> Toolkit
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
          100% private and client-side. Convert, merge, split, rotate, watermark, and organize your files directly in your browser without uploading to external servers.
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" /> 100% Client-Side Privacy
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Instant Processing
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Zero Server Storage
          </span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-10">
        {/* Section 1: Convert Tools */}
        <div id="section-convert" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> Document Conversion
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Seamless format translation between PDF, Word DOCX, and high-res images</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TOOLS.filter((t) => t.category === 'convert').map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  onClick={() => onSelectMode(tool.mode)}
                  className="group text-left p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-red-600 group-hover:text-red-700">
                    Open Tool <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Organize PDF */}
        <div id="section-organize" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Files className="w-5 h-5 text-red-600" /> Organize &amp; Rearrange
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Merge documents, extract specific pages, or rearrange sheets with visual thumbnails</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLS.filter((t) => t.category === 'organize').map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  onClick={() => onSelectMode(tool.mode)}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${tool.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-red-600 group-hover:text-red-700">
                    Open Tool <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Edit & Batch */}
        <div id="section-edit" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stamp className="w-5 h-5 text-red-600" /> Edit &amp; Bulk Operations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Apply custom stamp watermarks or process multiple documents simultaneously</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TOOLS.filter((t) => t.category === 'edit').map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  onClick={() => onSelectMode(tool.mode)}
                  className="group text-left p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-red-600 group-hover:text-red-700">
                    Open Tool <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
