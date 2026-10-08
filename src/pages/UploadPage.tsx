import React, { useState, useRef } from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  FileText,
  ArrowRight,
  Layers,
  Cpu,
} from 'lucide-react';

interface UploadPageProps {
  navigate: (route: string) => void;
}

const STAGES = [
  'Uploading',
  'Detecting format',
  'Rendering pages',
  'Detecting layout',
  'OCR / text extraction',
  'Table detection',
  'Figure detection',
  'Equation detection',
  'Reading-order reconstruction',
  'Validation',
  'Generating output',
];

const SUPPORTED_FORMATS = [
  'PDF', 'Scanned PDF', 'JPG', 'JPEG', 'PNG', 'TIFF', 'HEIC',
  'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'CSV',
  'HTML', 'Markdown', 'TXT', 'RTF', 'EML', 'MSG'
];

export const UploadPage: React.FC<UploadPageProps> = ({ navigate }) => {
  const { uploadFile, isProcessing, uploadProgress, currentStageIndex, loadDemoDocument } = useDocuments();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMsg(null);
    setUploadedDocName(file.name);

    try {
      const docId = await uploadFile(file);
      if (docId) {
        navigate('/results');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload processing error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Upload Documents for AI Ingestion
        </h2>
        <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
          Upload messy business documents to extract clean structured Markdown, hierarchical JSON, data tables, and KaTeX equations with provenance.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-[1.01]'
            : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60'
        } ${isProcessing ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.heic,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.html,.htm,.md,.markdown,.txt,.rtf,.eml,.msg"
        />

        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4 ring-8 ring-[var(--primary)]/5">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
          {uploadedDocName && isProcessing ? uploadedDocName : 'Drag and drop your document here'}
        </h3>
        <p className="text-xs text-[var(--muted)] mb-4">
          or click to browse files from your local disk (up to 50 MB)
        </p>

        {/* Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
          {SUPPORTED_FORMATS.map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] font-medium"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live 11-Stage Pipeline Status Tracker */}
      {isProcessing && (
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--foreground)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--primary)] animate-spin" />
              Processing Pipeline Stage ({currentStageIndex + 1} of 11)
            </span>
            <span className="font-mono font-bold text-[var(--primary)]">{uploadProgress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[var(--background)] overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          {/* Stages list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {STAGES.map((stageName, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stageName}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-xs'
                      : 'border-transparent text-[var(--muted)] opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{idx + 1}. {stageName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instant Demo Launchers */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
          Or Test With Sample Hackathon Files Immediately:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={async () => {
              await loadDemoDocument('demo-acme-financial-2025');
              navigate('/results');
            }}
            className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="font-semibold text-xs text-[var(--foreground)]">
                Acme Financial Report (3 Pages)
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                Scanned PDF + Income Statement table + Revenue Chart + LaTeX EPS
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--primary)] shrink-0 ml-2" />
          </button>

          <button
            onClick={async () => {
              await loadDemoDocument('demo-legal-contract-2025');
              navigate('/results');
            }}
            className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="font-semibold text-xs text-[var(--foreground)]">
                Master Services Agreement (DOCX)
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                Multi-column clauses + Engineering SLA Rate Card table
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--primary)] shrink-0 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
