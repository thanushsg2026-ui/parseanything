import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Table as TableIcon,
  Image as ImageIcon,
  Sigma,
  Eye,
  Search,
  Cpu,
  BarChart3,
  Scale,
  Building2,
  Zap,
  LocateFixed,
  AlertTriangle,
  Code,
} from 'lucide-react';

interface OverviewPageProps {
  navigate: (route: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ navigate }) => {
  const { loadDemoDocument } = useDocuments();
  const [highlightedRegion, setHighlightedRegion] = useState(false);

  const handleStartParsing = () => {
    navigate('/upload');
  };

  const handleExploreDemo = async () => {
    await loadDemoDocument('demo-acme-financial-2025');
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--border)]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tech pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Enterprise Document Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-[var(--foreground)]">
              Parse<span className="text-[var(--primary)]">Anything</span>
            </h1>

            <h2 className="text-xl sm:text-2xl font-medium text-[var(--muted)] mb-6">
              A Universal Document Parser for AI
            </h2>

            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
              ParseAnything transforms messy business documents into accurate, structured, searchable, and citable data. It combines document parsing, OCR, layout understanding, table extraction, figure and equation recognition, and Gemini-powered visual intelligence into one unified pipeline.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
              <button
                onClick={handleStartParsing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm shadow-md shadow-[var(--primary)]/20 transition-all cursor-pointer"
              >
                <span>Try ParseAnything</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleExploreDemo}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--background)] text-[var(--foreground)] font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[var(--primary)]" />
                <span>Explore Demo</span>
              </button>
            </div>
          </div>

          {/* Visual Pipeline Banner */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg max-w-4xl mx-auto">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)] text-center mb-4">
              End-to-End Processing Pipeline Architecture
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  1
                </div>
                <div className="font-semibold text-xs text-[var(--foreground)]">Business Document</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">PDF, Scans, Office, Email</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  2
                </div>
                <div className="font-semibold text-xs text-[var(--foreground)]">Detect & Route</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">20 Formats Sniffed</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  3
                </div>
                <div className="font-semibold text-xs text-[var(--foreground)]">OCR + Layout</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">Tables, Figures & Math</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  4
                </div>
                <div className="font-semibold text-xs text-[var(--foreground)]">Gemini AI</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">Charts to Data & LaTeX</div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  5
                </div>
                <div className="font-semibold text-xs text-[var(--foreground)]">Citable Output</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">BBoxes + Markdown + JSON</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY PROBLEM SECTION */}
      <section className="py-20 border-b border-[var(--border)] bg-[var(--card)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--primary)]">
              The Reality of Enterprise Data
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">
              Business Documents Are Messy.
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-3 leading-relaxed">
              Scanned contracts have no text layer. Tables lose their row and column relationships. Charts hide valuable numbers inside pixels. Equations get corrupted. Multi-column documents lose their reading order. Traditional parsers produce incomplete or unreliable output.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Scanned Documents</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Images and degraded scans with no digital font information that stall conventional text extractors.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <TableIcon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Broken Tables</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Multi-row headers and cross-page continuation tables get flattened into unintelligible raw string blobs.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Lost Figures & Charts</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Quarterly growth trends and critical metrics remain locked inside rasterized charts without numerical values.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Sigma className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Garbled Equations</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Complex mathematical expressions and GAAP EPS formulas become garbled ASCII noise.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Wrong Reading Order</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Multi-column contracts and sidebars get jumbled horizontally by naive top-to-bottom sorting.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <LocateFixed className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm mb-1 text-[var(--foreground)]">Missing Provenance</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                LLMs hallucinate answers because the extracted text cannot be traced back to bounding boxes or pages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--primary)]">
              The ParseAnything Solution
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">
              One Parser. Every Document.
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-3 leading-relaxed">
              ParseAnything detects the structure of each document, chooses the appropriate extraction strategy, and assembles everything into a unified representation that AI systems can understand and cite.
            </p>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-[var(--primary)]">
                <FileText className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Universal Input Support</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Native parsing for 20 formats: PDF, Scanned PDF, JPG, PNG, TIFF, HEIC, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, HTML, Markdown, TXT, RTF, EML, and MSG.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-emerald-500">
                <TableIcon className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Cross-Page Table Merging</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Continuity detection matches schemas across page boundaries, stitching split financial tables into one continuous logical entity with preserved headers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-amber-500">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Gemini Figure Intelligence</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Extracts raw series data from raster charts and transcribes complex mathematical equations into KaTeX-compatible LaTeX representations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-blue-500">
                <Layers className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Column-Aware Reading Order</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Multi-column analysis separates sidebars, headers, footers, and footnotes to reconstruct clean, natural reading flow without garbled sentences.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-purple-500">
                <LocateFixed className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">100% Citable Provenance</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Every extracted block maintains its page index, normalized [x1, y1, x2, y2] bounding box coordinates, and block confidence score for auditability.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-3 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Low-Confidence Flagging</h4>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Instead of silently guessing obscured characters, low-confidence OCR blocks are flagged with "Needs Review" badges for human verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE EXAMPLE SECTION */}
      <section className="py-20 border-b border-[var(--border)] bg-[var(--card)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--primary)]">
              Interactive Demonstration
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">
              See Structured Extraction in Action
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Click the "View Source" button below to witness how parsed data links directly back to its exact bounding box location.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Mock Scanned Statement */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-slate-900 shadow-md relative min-h-[380px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
                <span>SCANNED FINANCIAL STATEMENT (PAGE 2)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">DPI: 300</span>
              </div>

              <div className="py-4 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Statements of Income & Core Operations (Unaudited, in Millions)
                </div>

                {/* Highlightable Table Region */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    highlightedRegion
                      ? 'border-indigo-600 bg-indigo-500/20 ring-4 ring-indigo-500/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    <span>Revenue Metrics Area</span>
                    <span className="text-[10px] font-mono">bbox: [82, 214, 548, 620]</span>
                  </div>
                  <div className="text-xs font-mono space-y-1 text-slate-800 dark:text-slate-200">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
                      <span>Total Product Revenue</span>
                      <span className="font-bold">$ 48.9 M</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Service Revenue</span>
                      <span>$ 22.4 M</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed italic">
                  Diluted EPS for the quarter was $0.19 per share, compared to $0.14 per share in the prior year period.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>ACME CORP 10-Q</span>
                <span>PAGE 2 OF 3</span>
              </div>
            </div>

            {/* Right: Structured Output */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
                    <TableIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-[var(--foreground)]">Extracted Table Schema</span>
                </div>

                <button
                  onClick={() => setHighlightedRegion(!highlightedRegion)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    highlightedRegion
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] hover:border-[var(--primary)]'
                  }`}
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{highlightedRegion ? 'Highlighting Source' : 'View Source'}</span>
                </button>
              </div>

              {/* JSON preview */}
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] font-mono text-[11px] text-[var(--foreground)] overflow-x-auto">
                <pre>{JSON.stringify(
                  {
                    type: "table",
                    page: 2,
                    confidence: 0.96,
                    bbox: [82, 214, 548, 620],
                    reading_order: 6
                  },
                  null,
                  2
                )}</pre>
              </div>

              {/* Rendered Table */}
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold text-[var(--foreground)]">Year</th>
                      <th className="py-2 px-3 text-left font-semibold text-[var(--foreground)]">Revenue ($M)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="py-2 px-3 text-[var(--muted)]">FY2024</td>
                      <td className="py-2 px-3 font-semibold text-[var(--foreground)]">41.2</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-[var(--muted)]">FY2025</td>
                      <td className="py-2 px-3 font-semibold text-[var(--primary)]">48.9</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deterministic extraction + 96% confidence score preserved.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GEMINI INTEGRATION ARCHITECTURE */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-500">
              Visual Document Intelligence
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">
              Gemini-Powered Document Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-3 leading-relaxed">
              ParseAnything uses Gemini selectively for difficult visual and semantic regions such as charts, figures, ambiguous layouts and mathematical content, while deterministic extractors handle straightforward content whenever possible.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Hybrid Pipeline Strategy</span>
                </div>
                <h4 className="text-lg font-bold text-[var(--foreground)]">
                  Speed Where Possible, AI Where Necessary
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Deterministic regex and geometry extractors parse clean tables in &lt;100ms. When a chart, complex formula, or unreadable scan occurs, Gemini 3.8 Flash extracts structured data points with safe backend-only execution.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] font-mono text-xs text-[var(--foreground)] w-full md:w-80 space-y-2">
                <div className="text-[10px] uppercase text-[var(--muted)] font-bold">Execution Routing</div>
                <div className="p-2 rounded bg-[var(--card)] border border-[var(--border)] flex justify-between items-center">
                  <span>Clean Digital Text</span>
                  <span className="text-emerald-500 font-bold">Deterministic</span>
                </div>
                <div className="p-2 rounded bg-[var(--card)] border border-[var(--border)] flex justify-between items-center">
                  <span>Quarterly Bar Chart</span>
                  <span className="text-amber-500 font-bold">Gemini Vision</span>
                </div>
                <div className="p-2 rounded bg-[var(--card)] border border-[var(--border)] flex justify-between items-center">
                  <span>Calculus & EPS Math</span>
                  <span className="text-purple-500 font-bold">KaTeX / LaTeX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & PROVENANCE CITATION */}
      <section className="py-20 border-b border-[var(--border)] bg-[var(--card)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--primary)]">
              Verifiable Enterprise AI
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">
              Every Answer Has a Source.
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Every extracted block can be traced back to its exact location in the original document.
            </p>
          </div>

          <div className="max-w-xl mx-auto p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--muted)]">CITATION EXAMPLE</span>
              <span className="text-xs font-bold text-emerald-500">100% Citable</span>
            </div>

            <div className="text-base font-bold text-[var(--foreground)]">
              Revenue: <span className="text-[var(--primary)]">$48.9M</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] font-mono text-xs space-y-1.5 text-[var(--foreground)]">
              <div className="text-[var(--muted)] font-bold mb-1">PROVENANCE METADATA</div>
              <div>Source Page: 3</div>
              <div>Bounding Box: (105, 284, 512, 421)</div>
              <div>Confidence: 96%</div>
              <div>Block ID: #block_006</div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Downstream agents and RAG applications can display precise visual bounding box overlays to end users, ensuring audit compliance in legal and financial workflows.
            </p>
          </div>
        </div>
      </section>

      {/* 7. INDUSTRY USE CASES */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Designed for Real Business Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">Finance</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Financial statements, 10-Q/10-K filings, quarterly investor presentations, balance sheets, and cross-page operation statements.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">Legal</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Master services agreements, indemnification clauses, amendments, contracts with sidebars, footnotes, and multi-column clauses.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">Operations</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Vendor invoices, purchase orders, mixed email threads (.eml/.msg), technical specifications, and laboratory test reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="py-20 text-center bg-gradient-to-b from-transparent to-[var(--primary)]/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[var(--foreground)]">
            Turn Any Document Into AI-Ready Knowledge.
          </h2>
          <p className="text-sm sm:text-base text-[var(--muted)] mb-8 leading-relaxed">
            Upload a document and see ParseAnything extract, structure, and explain its contents with complete provenance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStartParsing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Start Parsing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleExploreDemo}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--background)] text-[var(--foreground)] font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[var(--primary)]" />
              <span>View Demo</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
