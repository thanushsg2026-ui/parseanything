import React from 'react';
import { FigureData } from '../../types/document.js';
import { BarChart3, Sparkles, TrendingUp, Image as ImageIcon } from 'lucide-react';

interface FigureRendererProps {
  figure: FigureData;
  onEnrichWithGemini?: () => void;
  className?: string;
}

export const FigureRenderer: React.FC<FigureRendererProps> = ({
  figure,
  onEnrichWithGemini,
  className = '',
}) => {
  const data = figure.extractedData || [];
  const maxVal = Math.max(
    ...data.map(d => (typeof d.value === 'number' ? d.value : parseFloat(String(d.value)) || 1)),
    1
  );

  return (
    <div className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 my-3 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[var(--foreground)]">
              {figure.caption || 'Extracted Figure / Chart'}
            </h4>
            <span className="text-[10px] uppercase font-mono text-[var(--muted)]">
              {figure.chartType || 'visualization'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {figure.isExtractedWithGemini ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Gemini Data Intelligence
            </span>
          ) : (
            onEnrichWithGemini && (
              <button
                onClick={onEnrichWithGemini}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--primary)] transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Analyze with Gemini
              </button>
            )
          )}
        </div>
      </div>

      {/* Summary */}
      {figure.summary && (
        <p className="mt-3 text-xs text-[var(--muted)] flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{figure.summary}</span>
        </p>
      )}

      {/* Mini Bar Chart Preview */}
      {data.length > 0 && (
        <div className="mt-4 pt-2 border-t border-[var(--border)]">
          <div className="text-[11px] font-medium text-[var(--muted)] mb-3">Structured Chart Data Points:</div>
          <div className="space-y-2">
            {data.map((item, idx) => {
              const numVal = typeof item.value === 'number' ? item.value : parseFloat(String(item.value)) || 0;
              const pct = Math.max(8, Math.min(100, (numVal / maxVal) * 100));

              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-24 shrink-0 font-medium text-[var(--foreground)] truncate text-[11px]">
                    {item.label}
                  </span>
                  <div className="flex-1 h-5 bg-[var(--background)] rounded-md overflow-hidden p-0.5 border border-[var(--border)]">
                    <div
                      className="h-full rounded bg-[var(--primary)]/80 hover:bg-[var(--primary)] transition-all flex items-center justify-end px-2"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs">
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
