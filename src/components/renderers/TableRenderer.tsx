import React, { useState } from 'react';
import { TableData } from '../../types/document.js';
import { Copy, Check, Layers, Table as TableIcon } from 'lucide-react';

interface TableRendererProps {
  table: TableData;
  className?: string;
}

export const TableRenderer: React.FC<TableRendererProps> = ({ table, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const csv = [
      table.headers.join('\t'),
      ...table.rows.map(r => r.join('\t')),
    ].join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden my-3 shadow-xs ${className}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-semibold text-xs tracking-wide text-[var(--foreground)]">
            {table.caption || 'Extracted Data Table'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]">
            {table.rowCount} rows × {table.colCount} cols
          </span>
        </div>

        <div className="flex items-center gap-2">
          {table.isMergedCrossPage && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              <Layers className="w-3 h-3" />
              Cross-Page Merged
            </span>
          )}

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            title="Copy as TSV/Spreadsheet table"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Data'}</span>
          </button>
        </div>
      </div>

      {table.notes && (
        <div className="px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-[var(--border)] text-[11px] text-indigo-700 dark:text-indigo-300">
          {table.notes}
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]/70">
              <th className="py-2.5 px-3 w-10 text-[var(--muted)] font-mono text-[10px]">#</th>
              {table.headers.map((h, i) => (
                <th key={i} className="py-2.5 px-3 font-semibold text-[var(--foreground)] tracking-tight whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-mono">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[var(--background)]/50 transition-colors">
                <td className="py-2 px-3 text-[var(--muted)] text-[10px] select-none">{rIdx + 1}</td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3 text-[var(--foreground)] whitespace-nowrap font-sans">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
