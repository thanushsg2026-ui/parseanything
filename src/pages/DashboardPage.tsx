import React from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  UploadCloud,
  Eye,
  ArrowRight,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { documents, selectDocument, loadDemoDocument, searchQuery } = useDocuments();

  const total = documents.length;
  const completed = documents.filter(d => d.status === 'completed').length;
  const processing = documents.filter(d => d.status === 'processing').length;
  const needsReview = documents.filter(d => d.needsReviewCount > 0).length;

  const avgConfidence = total > 0
    ? Math.round((documents.reduce((acc, d) => acc + (d.averageConfidence || 0), 0) / total) * 100)
    : 95;

  const filteredDocs = documents.filter(d =>
    d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDoc = async (id: string) => {
    await selectDocument(id);
    navigate('/results');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Document Intelligence Dashboard
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Transform unstructured enterprise records into validated, high-confidence structured knowledge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-medium">Total Documents</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--foreground)]">{total}</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">Ingested in catalog</div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-medium">Successfully Parsed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{completed}</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">Ready for AI retrieval</div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-medium">Processing</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{processing}</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">In active OCR pipeline</div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-medium">Needs Review</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{needsReview}</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">Confidence &lt; 70%</div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-medium">Average Confidence</span>
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--primary)]">{avgConfidence}%</div>
          <div className="text-[10px] text-[var(--muted)] mt-1">Extraction precision</div>
        </div>
      </div>

      {/* Quick Launch Demos */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/10 via-[var(--accent)]/10 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              Pre-loaded Evaluation Demos
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Test parsing capabilities immediately with multi-page financial statements and legal agreements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={async () => {
              await loadDemoDocument('demo-acme-financial-2025');
              navigate('/results');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-medium text-[var(--foreground)] shadow-xs transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Q3 2025 Acme Financial Report (Scanned PDF + Cross-page Table + LaTeX)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--primary)] ml-1" />
          </button>

          <button
            onClick={async () => {
              await loadDemoDocument('demo-legal-contract-2025');
              navigate('/results');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-medium text-[var(--foreground)] shadow-xs transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Master Services Agreement 2025 (DOCX Multi-column + Rates)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--primary)] ml-1" />
          </button>
        </div>
      </div>

      {/* Recent Documents Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--foreground)]">Recent Documents</h3>
          <button
            onClick={() => navigate('/documents')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>View All Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.slice(0, 6).map((doc) => {
            const confPct = Math.round((doc.averageConfidence || 0.95) * 100);

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs uppercase font-mono">
                        {doc.format}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-xs text-[var(--foreground)] truncate w-44">
                          {doc.filename}
                        </h4>
                        <span className="text-[10px] text-[var(--muted)]">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        doc.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)] text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[var(--muted)]">Pages</div>
                      <div className="font-mono font-bold text-[var(--foreground)]">{doc.pages}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--muted)]">Blocks</div>
                      <div className="font-mono font-bold text-[var(--foreground)]">{doc.totalBlocks}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--muted)]">Confidence</div>
                      <div
                        className={`font-mono font-bold ${
                          confPct >= 90
                            ? 'text-emerald-500'
                            : confPct >= 70
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {confPct}%
                      </div>
                    </div>
                  </div>

                  {doc.needsReviewCount > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-900/60">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{doc.needsReviewCount} block(s) flagged for review</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--muted)]">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                  <button
                    onClick={() => handleOpenDoc(doc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>View Result</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
