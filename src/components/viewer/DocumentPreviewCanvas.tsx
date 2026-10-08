import React, { useState } from 'react';
import { DocumentBlock, PageMetadata } from '../../types/document.js';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface DocumentPreviewCanvasProps {
  page: PageMetadata;
  totalPages: number;
  currentPageNumber: number;
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onHoverBlock: (blockId: string | null) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

export const DocumentPreviewCanvas: React.FC<DocumentPreviewCanvasProps> = ({
  page,
  totalPages,
  currentPageNumber,
  blocks,
  selectedBlockId,
  hoveredBlockId,
  onSelectBlock,
  onHoverBlock,
  onPageChange,
  className = '',
}) => {
  const [zoom, setZoom] = useState(100);
  const [showOverlays, setShowOverlays] = useState(true);
  const [overlayFilter, setOverlayFilter] = useState<'all' | 'tables' | 'figures' | 'equations' | 'review'>('all');

  const pageBlocks = blocks.filter(b => b.page === currentPageNumber);

  const filteredBlocks = pageBlocks.filter(b => {
    if (overlayFilter === 'tables') return b.type === 'table';
    if (overlayFilter === 'figures') return b.type === 'figure';
    if (overlayFilter === 'equations') return b.type === 'equation';
    if (overlayFilter === 'review') return b.needsReview;
    return true;
  });

  const getBBoxColor = (block: DocumentBlock, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return {
        stroke: '#4f46e5',
        fill: 'rgba(79, 70, 229, 0.22)',
        strokeWidth: 2.5,
      };
    }
    if (isHovered) {
      return {
        stroke: '#818cf8',
        fill: 'rgba(99, 102, 241, 0.16)',
        strokeWidth: 2,
      };
    }
    if (block.needsReview) {
      return {
        stroke: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.14)',
        strokeWidth: 1.5,
      };
    }
    switch (block.type) {
      case 'table':
        return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.12)', strokeWidth: 1.5 };
      case 'figure':
        return { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.12)', strokeWidth: 1.5 };
      case 'equation':
        return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.12)', strokeWidth: 1.5 };
      case 'heading':
        return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.12)', strokeWidth: 1.5 };
      default:
        return { stroke: '#64748b', fill: 'rgba(100, 116, 139, 0.08)', strokeWidth: 1 };
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs ${className}`}>
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]">
        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPageNumber - 1))}
            disabled={currentPageNumber <= 1}
            className="p-1 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)]"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium px-2 py-0.5 text-[var(--foreground)]">
            Page {currentPageNumber} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPageNumber + 1))}
            disabled={currentPageNumber >= totalPages}
            className="p-1 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)]"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {page.isScanned && (
            <span className="ml-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full">
              Scanned / OCR
            </span>
          )}
        </div>

        {/* Layer Filters & Zoom */}
        <div className="flex items-center gap-2">
          {/* Overlay toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              showOverlays
                ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-medium'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>BBoxes</span>
          </button>

          {/* Filter dropdown */}
          <select
            value={overlayFilter}
            onChange={(e) => setOverlayFilter(e.target.value as any)}
            className="text-xs bg-[var(--card)] border border-[var(--border)] rounded-md px-2 py-1 text-[var(--foreground)] focus:outline-hidden focus:border-[var(--primary)]"
          >
            <option value="all">All Layers</option>
            <option value="tables">Tables Only</option>
            <option value="figures">Figures Only</option>
            <option value="equations">Equations Only</option>
            <option value="review">Needs Review</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 15))}
              className="p-1 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] text-[var(--muted)]"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center text-[var(--foreground)]">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(180, zoom + 15))}
              className="p-1 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] text-[var(--muted)]"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] text-[var(--muted)]"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[var(--background)]/80 relative">
        <div
          className="relative transition-transform duration-150 origin-top shadow-xl border border-[var(--border)] rounded-sm bg-white overflow-hidden"
          style={{
            width: `${(800 * zoom) / 100}px`,
            height: `${(1100 * zoom) / 100}px`,
          }}
        >
          {/* Base Document SVG Visual Background */}
          {page.previewSvg ? (
            <div
              className="absolute inset-0 pointer-events-none select-none"
              dangerouslySetInnerHTML={{ __html: page.previewSvg }}
            />
          ) : (
            <div className="absolute inset-0 bg-white" />
          )}

          {/* Interactive SVG Bounding Box Layer */}
          {showOverlays && (
            <svg
              viewBox="0 0 800 1100"
              className="absolute inset-0 w-full h-full cursor-crosshair"
            >
              {filteredBlocks.map((b) => {
                const isSelected = selectedBlockId === b.id;
                const isHovered = hoveredBlockId === b.id;
                const style = getBBoxColor(b, isSelected, isHovered);

                // Convert normalized bbox [x1, y1, x2, y2] (0-1000 scale) to 800x1100 coordinates
                const x = (b.bbox[0] / 1000) * 800;
                const y = (b.bbox[1] / 1000) * 1100;
                const width = Math.max(20, ((b.bbox[2] - b.bbox[0]) / 1000) * 800);
                const height = Math.max(16, ((b.bbox[3] - b.bbox[1]) / 1000) * 1100);

                return (
                  <g key={b.id} className="transition-all duration-100">
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      strokeDasharray={b.needsReview ? '5,3' : undefined}
                      rx={3}
                      onClick={() => onSelectBlock(b.id)}
                      onMouseEnter={() => onHoverBlock(b.id)}
                      onMouseLeave={() => onHoverBlock(null)}
                      className="cursor-pointer hover:filter drop-shadow-xs"
                    />

                    {/* Badge Pill for block type */}
                    {(isSelected || isHovered) && (
                      <g transform={`translate(${x}, ${Math.max(12, y - 6)})`}>
                        <rect
                          x={0}
                          y={-14}
                          width={Math.min(220, (b.type.length * 7) + 65)}
                          height={16}
                          rx={3}
                          fill={style.stroke}
                        />
                        <text
                          x={6}
                          y={-3}
                          fill="#ffffff"
                          fontSize="9.5"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          #{b.readingOrder} {b.type.toUpperCase()} ({(b.confidence * 100).toFixed(0)}%)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--background)] flex flex-wrap items-center justify-between text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span>{filteredBlocks.length} block(s) detected on this page</span>
          {selectedBlockId && (
            <span className="font-semibold text-[var(--primary)]">
              Active Block: {selectedBlockId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> High Conf
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Med Conf
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Needs Review
          </span>
        </div>
      </div>
    </div>
  );
};
