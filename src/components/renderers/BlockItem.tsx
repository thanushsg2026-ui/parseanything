import React from 'react';
import { DocumentBlock } from '../../types/document.js';
import { TableRenderer } from './TableRenderer.js';
import { FigureRenderer } from './FigureRenderer.js';
import { LatexRenderer } from './LatexRenderer.js';
import {
  Heading,
  AlignLeft,
  List,
  Table as TableIcon,
  Image as ImageIcon,
  Sigma,
  Bookmark,
  Footprints,
  AlertTriangle,
  LocateFixed,
  Sparkles,
} from 'lucide-react';

interface BlockItemProps {
  block: DocumentBlock;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onEnrichWithGemini?: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onEnrichWithGemini,
}) => {
  const getBlockIcon = () => {
    switch (block.type) {
      case 'heading':
        return <Heading className="w-3.5 h-3.5 text-blue-500" />;
      case 'table':
        return <TableIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'figure':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-500" />;
      case 'equation':
        return <Sigma className="w-3.5 h-3.5 text-amber-500" />;
      case 'list':
        return <List className="w-3.5 h-3.5 text-cyan-500" />;
      case 'header':
      case 'footer':
        return <Bookmark className="w-3.5 h-3.5 text-slate-400" />;
      case 'footnote':
        return <Footprints className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getConfidenceBadge = () => {
    const pct = Math.round(block.confidence * 100);
    if (block.needsReview || pct < 70) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Needs Review ({pct}%)
        </span>
      );
    }
    if (pct >= 90) {
      return (
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full">
          High ({pct}%)
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">
        Medium ({pct}%)
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-2 ring-[var(--primary)]/20'
          : isHovered
          ? 'border-[var(--primary)]/50 bg-[var(--card)] shadow-xs'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-mono font-bold">
            #{block.readingOrder}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[11px] font-medium capitalize text-[var(--foreground)]">
            {getBlockIcon()}
            <span>{block.type}</span>
            {block.level && <span className="text-[10px] text-[var(--muted)]">H{block.level}</span>}
          </div>
          <span className="text-[11px] font-mono text-[var(--muted)]">Page {block.page}</span>
        </div>

        <div className="flex items-center gap-2">
          {getConfidenceBadge()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline px-1.5 py-0.5 rounded bg-[var(--primary)]/5 border border-[var(--primary)]/20"
            title="Inspect source coordinates on original document"
          >
            <LocateFixed className="w-3 h-3" />
            <span>Source</span>
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="text-xs text-[var(--foreground)] leading-relaxed">
        {block.type === 'table' && block.tableData ? (
          <TableRenderer table={block.tableData} />
        ) : block.type === 'figure' && block.figureData ? (
          <FigureRenderer figure={block.figureData} onEnrichWithGemini={onEnrichWithGemini} />
        ) : block.type === 'equation' && block.equationData ? (
          <LatexRenderer equation={block.equationData} />
        ) : block.type === 'heading' ? (
          <div className="font-bold text-sm text-[var(--foreground)] tracking-tight py-1">
            {block.text}
          </div>
        ) : block.type === 'list' ? (
          <div className="pl-3 border-l-2 border-[var(--primary)]/40 font-sans py-0.5 text-[var(--foreground)]">
            {block.text}
          </div>
        ) : (
          <p className="font-sans text-[var(--foreground)]/90">{block.text}</p>
        )}
      </div>

      {/* Provenance Footer Bar */}
      <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between text-[10px] text-[var(--muted)] font-mono">
        <div>
          BBox: [{block.bbox.join(', ')}]
        </div>

        {block.needsReview && onEnrichWithGemini && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnrichWithGemini();
            }}
            className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-sans font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800"
          >
            <Sparkles className="w-3 h-3" />
            AI Clean Up
          </button>
        )}
      </div>
    </div>
  );
};
