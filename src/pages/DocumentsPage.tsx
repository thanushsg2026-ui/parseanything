import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  Search,
  Filter,
  Eye,
  RotateCw,
  Trash2,
  Download,
  FileText,
  AlertTriangle,
  UploadCloud,
  FileCode,
  Package,
} from 'lucide-react';

interface DocumentsPageProps {
  navigate: (route: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ navigate }) => {
  const { documents, selectDocument, reprocessDocument, deleteDocument } = useDocuments();
  const [localSearch, setLocalSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(localSearch.toLowerCase()) ||
      doc.format.toLowerCase().includes(localSearch.toLowerCase());

    const matchesFormat = formatFilter === 'all' || doc.format.toLowerCase() === formatFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesReview =
      reviewFilter === 'all' || (reviewFilter === 'needsReview' ? doc.needsReviewCount > 0 : doc.needsReviewCount === 0);

    return matchesSearch && matchesFormat && matchesStatus && matchesReview;
  });

  const handleOpen = async (id: string) => {
    await selectDocument(id);
    navigate('/results');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Document Library
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Manage, reprocess, inspect, and export parsed business documents and datasets.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Filter by filename or extension..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-hidden focus:border-[var(--primary)]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-hidden"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="png">PNG / Images</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
          </select>

          {/* Review */}
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            className="text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-hidden"
          >
            <option value="all">Review Status</option>
            <option value="needsReview">Needs Review Only</option>
            <option value="clean">Fully Validated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)] font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">Document Name</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">Pages</th>
                <th className="py-3 px-4 font-semibold">Blocks</th>
                <th className="py-3 px-4 font-semibold">Confidence</th>
                <th className="py-3 px-4 font-semibold">Ingestion Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted)]">
                    No documents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const confPct = Math.round((doc.averageConfidence || 0.95) * 100);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-[var(--background)]/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpen(doc.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold font-mono text-[11px] uppercase shrink-0">
                            {doc.format}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                              {doc.filename}
                            </div>
                            <div className="text-[10px] text-[var(--muted)] font-mono">
                              {(doc.fileSize / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 uppercase font-mono text-[11px] text-[var(--muted)]">
                        {doc.format}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-[var(--foreground)]">
                        {doc.pages}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-[var(--foreground)]">
                        {doc.totalBlocks}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              confPct >= 90
                                ? 'text-emerald-500'
                                : confPct >= 70
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }`}
                          >
                            {confPct}%
                          </span>
                          {doc.needsReviewCount > 0 && (
                            <span className="text-[10px] text-rose-500 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{doc.needsReviewCount} review</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[var(--muted)] text-[11px]">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpen(doc.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] transition-colors"
                            title="Inspect parsed result"
                          >
                            <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                          </button>

                          <button
                            onClick={() => reprocessDocument(doc.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] transition-colors"
                            title="Reprocess with current parser pipeline"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`/api/documents/${doc.id}/json`}
                            download
                            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] transition-colors"
                            title="Download JSON"
                          >
                            <FileCode className="w-3.5 h-3.5 text-blue-500" />
                          </a>

                          <a
                            href={`/api/documents/${doc.id}/export/zip`}
                            download
                            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] transition-colors"
                            title="Download ZIP package"
                          >
                            <Package className="w-3.5 h-3.5 text-emerald-500" />
                          </a>

                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-rose-400 text-rose-500 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
