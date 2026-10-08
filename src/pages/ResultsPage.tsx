import React, { useState, useRef, useEffect } from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import { DocumentPreviewCanvas } from '../components/viewer/DocumentPreviewCanvas.js';
import { BlockItem } from '../components/renderers/BlockItem.js';
import {
  FileText,
  Download,
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronDown,
  Table as TableIcon,
  ImageIcon,
  Sigma,
  Code,
  FileCode,
  LocateFixed,
  Package,
  Eye,
} from 'lucide-react';

interface ResultsPageProps {
  navigate: (route: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ navigate }) => {
  const {
    activeResult,
    selectedBlockId,
    hoveredBlockId,
    activePage,
    selectBlock,
    hoverBlock,
    setActivePage,
    reprocessDocument,
    enrichBlockWithGemini,
    isLoading,
  } = useDocuments();

  const [activeTab, setActiveTab] = useState<'parsed' | 'markdown' | 'json' | 'tables' | 'figures' | 'equations'>('parsed');
  const [filterReviewOnly, setFilterReviewOnly] = useState<boolean>(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'original' | 'parsed'>('parsed');

  const parsedListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected block in right panel
  useEffect(() => {
    if (selectedBlockId && parsedListRef.current) {
      const el = document.getElementById(`block-${selectedBlockId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBlockId]);

  if (isLoading || !activeResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-xs text-[var(--muted)]">Loading document layout and analysis...</p>
      </div>
    );
  }

  const { document: doc, pages, blocks, markdown } = activeResult;
  const currentPageMeta = pages.find(p => p.pageNumber === activePage) || pages[0];

  const filteredBlocks = blocks.filter(b => {
    if (filterReviewOnly) return b.needsReview;
    if (activeTab === 'tables') return b.type === 'table';
    if (activeTab === 'figures') return b.type === 'figure';
    if (activeTab === 'equations') return b.type === 'equation';
    return true;
  });

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background)] overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--card)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs flex items-center justify-center uppercase font-mono">
            {doc.format}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--foreground)] truncate max-w-xs sm:max-w-md">
                {doc.filename}
              </h2>
              {doc.needsReviewCount > 0 && (
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {doc.needsReviewCount} Needs Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono">
              <span>{doc.pages} Page(s)</span>
              <span>•</span>
              <span>{doc.totalBlocks} Blocks</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {(doc.averageConfidence * 100).toFixed(0)}% Avg Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mobile Split Toggle */}
        <div className="flex lg:hidden items-center bg-[var(--background)] p-1 rounded-lg border border-[var(--border)] text-xs">
          <button
            onClick={() => setMobileTab('original')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              mobileTab === 'original' ? 'bg-[var(--card)] text-[var(--primary)] font-bold' : 'text-[var(--muted)]'
            }`}
          >
            Original Document
          </button>
          <button
            onClick={() => setMobileTab('parsed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              mobileTab === 'parsed' ? 'bg-[var(--card)] text-[var(--primary)] font-bold' : 'text-[var(--muted)]'
            }`}
          >
            Parsed Content
          </button>
        </div>

        {/* Right Actions: Reprocess & Export Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => reprocessDocument(doc.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)] transition-colors cursor-pointer"
            title="Reprocess Document"
          >
            <RotateCw className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">Reprocess</span>
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl py-1 z-50 text-xs">
                <a
                  href={`/api/documents/${doc.id}/markdown`}
                  download
                  onClick={() => setExportMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--background)] text-[var(--foreground)]"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Download Markdown (.md)</span>
                </a>
                <a
                  href={`/api/documents/${doc.id}/json`}
                  download
                  onClick={() => setExportMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--background)] text-[var(--foreground)]"
                >
                  <FileCode className="w-4 h-4 text-purple-500" />
                  <span>Download JSON (.json)</span>
                </a>
                <a
                  href={`/api/documents/${doc.id}/export/zip`}
                  download
                  onClick={() => setExportMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--background)] text-[var(--foreground)]"
                >
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Download ZIP Bundle</span>
                </a>
                <div className="border-t border-[var(--border)] my-1" />
                <button
                  onClick={() => {
                    copyMarkdown();
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--background)] text-[var(--foreground)] text-left"
                >
                  <Copy className="w-4 h-4 text-[var(--muted)]" />
                  <span>Copy Markdown Text</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Original Document Preview */}
        <div
          className={`flex-1 p-3 border-r border-[var(--border)] overflow-hidden ${
            mobileTab === 'original' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DocumentPreviewCanvas
            page={currentPageMeta}
            totalPages={pages.length}
            currentPageNumber={activePage}
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            hoveredBlockId={hoveredBlockId}
            onSelectBlock={(bId) => selectBlock(bId, activePage)}
            onHoverBlock={(bId) => hoverBlock(bId)}
            onPageChange={(p) => setActivePage(p)}
          />
        </div>

        {/* Right Side: Parsed Structured Content */}
        <div
          className={`flex-1 flex flex-col bg-[var(--card)] overflow-hidden ${
            mobileTab === 'parsed' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Subheader Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--background)] shrink-0">
            {/* View Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('parsed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'parsed'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Parsed View</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'markdown'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'json'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'tables'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tables</span>
              </button>

              <button
                onClick={() => setActiveTab('figures')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'figures'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Figures</span>
              </button>

              <button
                onClick={() => setActiveTab('equations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'equations'
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>Equations</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterReviewOnly(!filterReviewOnly)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  filterReviewOnly
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Review Only</span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div ref={parsedListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'parsed' || activeTab === 'tables' || activeTab === 'figures' || activeTab === 'equations' ? (
              filteredBlocks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--muted)]">
                  No blocks match the current filter.
                </div>
              ) : (
                filteredBlocks.map((block) => (
                  <div key={block.id} id={`block-${block.id}`}>
                    <BlockItem
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      isHovered={hoveredBlockId === block.id}
                      onSelect={() => selectBlock(block.id, block.page)}
                      onHover={(isH) => hoverBlock(isH ? block.id : null)}
                      onEnrichWithGemini={() => enrichBlockWithGemini(block.id)}
                    />
                  </div>
                ))
              )
            ) : activeTab === 'markdown' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-xs font-mono text-[var(--muted)]">
                    Reconstructed natural reading order Markdown
                  </span>
                  <button
                    onClick={copyMarkdown}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)]"
                  >
                    {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] font-mono text-xs whitespace-pre-wrap leading-relaxed text-[var(--foreground)] select-text">
                  {markdown}
                </div>
              </div>
            ) : (
              /* JSON View */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-xs font-mono text-[var(--muted)]">
                    Unified Structured Document Schema (JSON)
                  </span>
                  <button
                    onClick={copyJson}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--foreground)]"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] font-mono text-xs overflow-x-auto text-[var(--foreground)] select-text">
                  {JSON.stringify(activeResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Active Block Provenance Drawer */}
          {selectedBlock && (
            <div className="p-3.5 border-t border-[var(--border)] bg-[var(--background)] shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <LocateFixed className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--foreground)]">
                    Source Citation:
                  </span>{' '}
                  <span className="font-mono text-[var(--muted)]">
                    Page {selectedBlock.page} • Position: ({selectedBlock.bbox.join(', ')}) • Conf: {(selectedBlock.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedBlock.needsReview && (
                  <button
                    onClick={() => enrichBlockWithGemini(selectedBlock.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-xs font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Disambiguate with Gemini</span>
                  </button>
                )}
                <button
                  onClick={() => selectBlock(null)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
