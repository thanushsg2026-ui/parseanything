import React, { useState, useEffect } from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  Search,
  BookOpen,
  UploadCloud,
  FileSearch,
  Table as TableIcon,
  Sparkles,
  Download,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCw,
  Send,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  Activity,
  FileText,
  X,
} from 'lucide-react';

interface HelpdeskPageProps {
  navigate: (route: string) => void;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articlesCount: number;
  color: string;
  articles: { title: string; content: string }[];
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface TroubleshootingItem {
  id: string;
  problem: string;
  category: string;
  solutions: string[];
  tips: string;
}

export const HelpdeskPage: React.FC<HelpdeskPageProps> = ({ navigate }) => {
  const { documents } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaqId, setActiveFaqId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedTroubleshoot, setSelectedTroubleshoot] = useState<TroubleshootingItem | null>(null);

  // Diagnostics state
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<any | null>(null);

  // Support Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Upload Issue');
  const [contactDocId, setContactDocId] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [attachDiagnostics, setAttachDiagnostics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Categories definitions
  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Learn how to upload documents and understand the ParseAnything workflow.',
      icon: BookOpen,
      articlesCount: 4,
      color: 'text-blue-500 bg-blue-500/10',
      articles: [
        {
          title: 'Welcome to ParseAnything',
          content: 'ParseAnything transforms unstructured business files (PDFs, scans, Office docs, emails) into structured Markdown and hierarchical JSON with bounding-box citations.',
        },
        {
          title: 'Understanding the 11-Stage Processing Pipeline',
          content: 'Every document goes through format detection, page normalization, layout zoning, OCR, table detection, figure analysis, LaTeX equation parsing, reading order sorting, and validation.',
        },
        {
          title: 'Interpreting Bounding Boxes and Provenance',
          content: 'Every extracted block includes normalized [x1, y1, x2, y2] coordinates and source page numbers, allowing audit compliance and verifiable AI citation.',
        },
        {
          title: 'Exploring Built-in Evaluation Demos',
          content: 'Try out pre-loaded financial reports and legal contracts instantly without needing to upload files from your local disk.',
        },
      ],
    },
    {
      id: 'document-upload',
      name: 'Document Upload',
      description: 'Supported formats, file limits, uploads and common upload errors.',
      icon: UploadCloud,
      articlesCount: 5,
      color: 'text-indigo-500 bg-indigo-500/10',
      articles: [
        {
          title: 'Supported Document Formats',
          content: 'ParseAnything accepts 20 formats: PDF, Scanned PDF, JPG, PNG, TIFF, HEIC, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, HTML, Markdown, TXT, RTF, EML, and MSG.',
        },
        {
          title: 'File Size Limits & Recommendations',
          content: 'Files up to 50 MB can be uploaded directly. For multi-hundred page documents, high accuracy mode will perform thorough OCR and table stitching.',
        },
        {
          title: 'Handling Drag-and-Drop Uploads',
          content: 'Simply drag and drop one or more business documents onto the upload zone, or click to browse your local filesystem.',
        },
        {
          title: 'Batch Processing & Queuing',
          content: 'Multiple documents can be queued and tracked in the Document Library with individual stage progress indicators.',
        },
      ],
    },
    {
      id: 'parsing-ocr',
      name: 'Parsing & OCR',
      description: 'Learn how OCR, layout detection and document parsing work.',
      icon: FileSearch,
      articlesCount: 6,
      color: 'text-purple-500 bg-purple-500/10',
      articles: [
        {
          title: 'Digital Text Layer vs. Scanned OCR Pages',
          content: 'The parser detects whether a page has native digital font glyphs or rasterized pixels, intelligently switching to the OCR engine when needed.',
        },
        {
          title: 'Pluggable OCR Engine Options',
          content: 'Choose between PaddleOCR, Surya OCR, Tesseract, or Hybrid voting in Settings to customize speed and accuracy.',
        },
        {
          title: 'Column-Aware Reading Order Reconstruction',
          content: 'Multi-column contracts and sidebars are analyzed geometrically so sentences remain coherent rather than jumbled across columns.',
        },
        {
          title: 'Confidence Scoring Metrics',
          content: 'Blocks are scored from 0% to 100%. Blocks scoring under the configured threshold (default 70%) are flagged for review.',
        },
      ],
    },
    {
      id: 'tables-figures',
      name: 'Tables & Figures',
      description: 'Troubleshoot table extraction, charts, figures and cross-page tables.',
      icon: TableIcon,
      articlesCount: 5,
      color: 'text-emerald-500 bg-emerald-500/10',
      articles: [
        {
          title: 'Cross-Page Table Merging Workflow',
          content: 'When financial tables continue from page 2 to page 3, schema matching stitches them into a single consolidated logical table with preserved headers.',
        },
        {
          title: 'Chart-to-Data Extraction via Gemini Vision',
          content: 'Rasterized bar, line, and pie charts are analyzed to reconstruct underlying data series [{label, value}] and summaries.',
        },
        {
          title: 'Mathematical Equation Extraction & KaTeX',
          content: 'Complex mathematical equations and GAAP financial formulas are transcribed into valid LaTeX displayed cleanly with KaTeX.',
        },
        {
          title: 'Copying and Exporting Extracted Tables',
          content: 'Click "Copy Data" on any table block to copy tab-separated values ready for pasting into Excel or Google Sheets.',
        },
      ],
    },
    {
      id: 'ai-gemini',
      name: 'AI & Gemini',
      description: 'Information about Gemini-powered extraction and API-related problems.',
      icon: Sparkles,
      articlesCount: 4,
      color: 'text-amber-500 bg-amber-500/10',
      articles: [
        {
          title: 'Selective AI Architecture',
          content: 'Deterministic extractors handle standard text quickly (&lt;100ms), while Gemini 3.8 Flash is invoked selectively for visual interpretation.',
        },
        {
          title: 'Zero API Key Exposure',
          content: 'Gemini API calls are made exclusively on the backend server. The GEMINI_API_KEY environment variable is never transmitted to the browser.',
        },
        {
          title: 'Graceful Fallback Mode',
          content: 'If the Gemini API key is missing or network times out, the pipeline continues deterministic parsing without crashing.',
        },
        {
          title: 'On-Demand Block Disambiguation',
          content: 'Click "AI Clean Up" or "Disambiguate with Gemini" on any low-confidence block in the Results viewer to re-analyze it.',
        },
      ],
    },
    {
      id: 'results-export',
      name: 'Results & Export',
      description: 'Learn about Markdown, JSON, citations, confidence scores and exports.',
      icon: Download,
      articlesCount: 4,
      color: 'text-cyan-500 bg-cyan-500/10',
      articles: [
        {
          title: 'Exporting Clean Markdown (.md)',
          content: 'Download reading-order Markdown with natural headings, tables, LaTeX formulas, and stripped running headers.',
        },
        {
          title: 'Unified JSON Schema Output',
          content: 'Integrate parsed documents with downstream LLMs or vector databases using the unified blocks schema with coordinates.',
        },
        {
          title: 'Complete ZIP Archive Bundle',
          content: 'Download parsed_result.json, document_clean.md, metadata.json, and individual table CSV files bundled together in a ZIP.',
        },
        {
          title: 'Source Citations & Interactive Inspection',
          content: 'Click parsed blocks to highlight the exact visual bounding box on the original document page in the split-view inspector.',
        },
      ],
    },
    {
      id: 'account-settings',
      name: 'Account & Settings',
      description: 'Theme customization, preferences and application settings.',
      icon: Settings,
      articlesCount: 4,
      color: 'text-rose-500 bg-rose-500/10',
      articles: [
        {
          title: 'Customizing Theme & Design Tokens',
          content: 'Navigate to Settings to switch between Indigo, Blue, Purple, Emerald, Cyan, Rose, Amber presets or use the custom color picker.',
        },
        {
          title: 'Light, Dark, and System Mode',
          content: 'Toggle between dark and light appearance modes with real-time CSS variable updates.',
        },
        {
          title: 'Setting Confidence Review Thresholds',
          content: 'Adjust the review threshold slider between 0.50 and 1.00 to flag more or fewer uncertain blocks.',
        },
        {
          title: 'Toggling Running Header Filtering',
          content: 'Choose whether to strip repetitive page numbers and confidentiality watermarks from main reading text.',
        },
      ],
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      description: 'Common errors and solutions for OCR, upload, and format issues.',
      icon: AlertTriangle,
      articlesCount: 5,
      color: 'text-amber-600 bg-amber-600/10',
      articles: [
        {
          title: 'Resolving Unsupported Format Errors',
          content: 'Verify file extension against the 20 supported types. Convert DRM-protected or proprietary encrypted PDFs before upload.',
        },
        {
          title: 'Fixing Skewed or Low-Resolution Scans',
          content: 'Ensure scans have at least 150-300 DPI resolution and are not upside-down or severely skewed.',
        },
        {
          title: 'Handling Missing Table Rows',
          content: 'Check the original document preview to verify if a table continues across page boundaries. Ensure Auto-Merge Tables is enabled.',
        },
        {
          title: 'Verifying Gemini Connectivity',
          content: 'Run the in-app System Diagnostics tool to confirm backend Gemini API availability and response latencies.',
        },
      ],
    },
  ];

  // FAQs
  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'What is ParseAnything?',
      answer: 'ParseAnything is a universal document parser that converts PDFs, images, Office documents, spreadsheets, emails and other business files into structured, AI-ready and citable data. It combines deterministic layout analysis, pluggable OCR, table extraction, KaTeX math parsing, and Gemini-powered visual intelligence into one unified pipeline.',
      category: 'General',
    },
    {
      id: 'faq-2',
      question: 'What file formats are supported?',
      answer: 'ParseAnything supports 20 business document formats: PDF (digital and scanned), PNG, JPG/JPEG, TIFF, HEIC, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV, HTML, Markdown, TXT, RTF, EML, and MSG.',
      category: 'Formats',
    },
    {
      id: 'faq-3',
      question: 'Can ParseAnything process scanned PDFs?',
      answer: 'Yes. The system automatically inspects each page to determine whether a digital text layer is present. If a page is image-only or scanned, ParseAnything routes it through the pluggable OCR engine (PaddleOCR, Surya, or Tesseract) to extract text, bounding coordinates, and confidence metrics.',
      category: 'OCR',
    },
    {
      id: 'faq-4',
      question: 'Why does my document have a low confidence score?',
      answer: 'Confidence represents how certain the parser and OCR engine are about an extracted block. Low scores (under 70%) can be caused by blurry scans, noisy watermarks, obscured stamps, or low-contrast text. Rather than silently guessing corrupted text, ParseAnything flags these blocks with a "Needs Review" badge so humans or downstream agents can verify them.',
      category: 'Confidence',
    },
    {
      id: 'faq-5',
      question: 'Why is my table incorrectly extracted?',
      answer: 'Table extraction errors usually occur due to merged cells with complex spans, unusual borders, low-quality scans, skewed pages, or tables that continue across page breaks. Inspect the original page beside the parsed table using the Results viewer. You can also verify that "Auto-merge cross-page tables" is enabled in Settings.',
      category: 'Tables',
    },
    {
      id: 'faq-6',
      question: 'Can ParseAnything extract chart values?',
      answer: 'Yes. Where a chart or figure contains sufficiently readable information, ParseAnything uses Gemini 3.8 Flash visual analysis to extract underlying series labels, numerical data points, and descriptive summaries into structured JSON without fabricating numbers.',
      category: 'Figures',
    },
    {
      id: 'faq-7',
      question: 'Why did Gemini fail or show fallback mode?',
      answer: 'Gemini is used selectively for difficult visual/semantic regions (charts, complex formulas, noisy stamps). If the GEMINI_API_KEY environment variable is not configured, quota is exceeded, or a network timeout occurs, ParseAnything automatically invokes deterministic fallback extractors so your document parsing never crashes.',
      category: 'Gemini AI',
    },
    {
      id: 'faq-8',
      question: 'How do I download my parsed document?',
      answer: 'Navigate to the Results page for your document and click the "Export" dropdown in the top-right header. You can download clean Markdown (.md), full structured JSON (.json), individual table CSVs, or a complete ZIP package containing all outputs.',
      category: 'Exports',
    },
    {
      id: 'faq-9',
      question: 'How do I change the application theme?',
      answer: 'Navigate to Settings (or click the Settings icon in the header) and scroll to Theme & Appearance. You can select from 7 color presets (Indigo, Blue, Purple, Emerald, Cyan, Rose, Amber), customize specific CSS color variables, or switch between Light and Dark mode.',
      category: 'Settings',
    },
    {
      id: 'faq-10',
      question: 'Is my Gemini API key visible to users in the browser?',
      answer: 'No. The Gemini API key is strictly maintained on the backend server via process.env.GEMINI_API_KEY and is never included in the frontend bundle or exposed to browser network calls.',
      category: 'Security',
    },
  ];

  // Troubleshooting Items
  const troubleshootingList: TroubleshootingItem[] = [
    {
      id: 'ts-upload',
      problem: "My document won't upload",
      category: 'Upload',
      solutions: [
        'Check that your file extension matches the 20 supported types (PDF, DOCX, XLSX, PPTX, CSV, JPG, PNG, TIFF, HEIC, EML, MSG, etc.).',
        'Ensure the file size is under 50 MB.',
        'Verify the document is not password-encrypted or corrupted.',
        'Try uploading the file again or drag and drop via the /upload interface.',
      ],
      tips: 'If uploading an unusual format, try exporting it as PDF or DOCX first.',
    },
    {
      id: 'ts-ocr',
      problem: "OCR isn't detecting text",
      category: 'OCR',
      solutions: [
        'Check the image resolution—ensure scans are at least 150–300 DPI.',
        'Verify the page is not severely rotated or inverted upside down.',
        'Check the confidence score in the Results view to see if text was flagged for review.',
        'Switch the OCR Engine to Surya or PaddleOCR in Settings for advanced layout recognition.',
      ],
      tips: 'Pages with high contrast between text and background yield the highest OCR confidence.',
    },
    {
      id: 'ts-reading-order',
      problem: 'The reading order is incorrect',
      category: 'Layout',
      solutions: [
        'Multi-column layouts, sidebars, floating figures, and complex headers can challenge naive sorting.',
        'Inspect the block bounding boxes in the Results viewer to check column division boundaries.',
        'Enable "Strip Running Headers & Footers" in Settings to keep repeated headers from splitting body text.',
        'Use the Markdown view tab to inspect the natural reconstructed narrative order.',
      ],
      tips: 'ParseAnything uses topological column clustering rather than simple top-to-bottom Y sorting.',
    },
    {
      id: 'ts-table-rows',
      problem: 'The table is missing rows',
      category: 'Tables',
      solutions: [
        'Check if the table continues across a page boundary (e.g. page 2 into page 3).',
        'Verify that "Auto-merge cross-page tables" is enabled in Settings.',
        'Inspect the table in the Results viewer: merged tables display a green "Cross-Page Merged" badge.',
        'Click "Copy Data" to verify all cells and headers in a spreadsheet application.',
      ],
      tips: 'If headers on page 2 differ slightly from page 1, verify the column counts match.',
    },
    {
      id: 'ts-gemini-error',
      problem: 'Gemini API error or missing analysis',
      category: 'AI & Gemini',
      solutions: [
        'Check whether the GEMINI_API_KEY environment variable is configured in .env or the Secrets panel.',
        'Verify your API quota has not been exceeded in Google AI Studio.',
        'Check network connectivity or run the System Diagnostics tool below.',
        'Remember ParseAnything provides deterministic fallbacks so processing never stops.',
      ],
      tips: 'You can test Gemini availability anytime by clicking "Run System Diagnostics" below.',
    },
  ];

  // Run System Diagnostics
  const handleRunDiagnostics = async () => {
    setDiagnosticsRunning(true);
    try {
      const res = await fetch('/api/support/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnosticsData(data);
      } else {
        setDiagnosticsData({ error: 'Diagnostics service responded with error status' });
      }
    } catch (err: any) {
      setDiagnosticsData({ error: err?.message || 'Failed to reach diagnostic service' });
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setFormError('Please fill out all required fields: Name, Email, and Message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          category: contactCategory,
          documentId: contactDocId || undefined,
          subject: contactSubject || `${contactCategory} Support Request`,
          message: contactMessage,
          attachDiagnostics,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedTicket({
          id: data.ticketId,
          message: data.message,
        });
        setContactSubject('');
        setContactMessage('');
      } else {
        const err = await res.json();
        setFormError(err.error || 'Failed to submit support ticket.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Network error submitting support request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering based on search query
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.articles.some((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTroubleshooting = troubleshootingList.filter(
    (t) =>
      t.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.solutions.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      {/* 1. HERO SECTION & SEARCH */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ParseAnything Knowledgebase & Support</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
          How can we help?
        </h1>

        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
          Find answers, troubleshoot document parsing issues, or contact the ParseAnything support team.
        </p>

        {/* Prominent Search Box */}
        <div className="relative max-w-2xl mx-auto pt-2">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles, features, and troubleshooting..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-md focus:outline-hidden focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[var(--muted)] pt-1">
          <span>Popular:</span>
          {['scanned PDF', 'table error', 'confidence score', 'theme', 'Gemini API', 'OCR', 'export JSON'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] text-[11px] transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* 2. QUICK HELP CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Knowledge Categories
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Browse guides across document ingestion, extraction, AI vision, and exports.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            {filteredCategories.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--muted)]">
                    {cat.articlesCount} articles
                  </span>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    <span>View articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TROUBLESHOOTING CENTER */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                Troubleshooting Center
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Instant diagnostic steps for common upload, OCR, table extraction, and Gemini AI issues.
            </p>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={diagnosticsRunning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] text-xs font-semibold text-[var(--foreground)] shadow-xs transition-colors cursor-pointer"
          >
            <Activity className={`w-4 h-4 text-emerald-500 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
            <span>{diagnosticsRunning ? 'Checking System...' : 'Run System Diagnostics'}</span>
          </button>
        </div>

        {/* Live Diagnostics Card Output */}
        {diagnosticsData && (
          <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ParseAnything Diagnostic Report
              </span>
              <button
                onClick={() => setDiagnosticsData(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div className="text-[var(--muted)] text-[10px]">Gemini Vision API</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  {diagnosticsData.geminiOnline ? 'Connected (gemini-3.8-flash)' : 'Offline / Fallback'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div className="text-[var(--muted)] text-[10px]">Active OCR Engine</div>
                <div className="font-bold text-[var(--foreground)] capitalize">
                  {diagnosticsData.parserSettings?.ocrEngine || 'PaddleOCR'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div className="text-[var(--muted)] text-[10px]">Formats Loaded</div>
                <div className="font-bold text-[var(--foreground)]">
                  {diagnosticsData.supportedFormatsCount || 20} Formats Active
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <div className="text-[var(--muted)] text-[10px]">Server Memory</div>
                <div className="font-bold text-[var(--foreground)]">
                  {diagnosticsData.memoryUsageMB ? `${diagnosticsData.memoryUsageMB} MB` : 'Normal'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTroubleshooting.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedTroubleshoot(item)}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[var(--muted)] mb-2">
                  <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
                    {item.category}
                  </span>
                  <span>Click to diagnose</span>
                </div>
                <h4 className="font-bold text-sm text-[var(--foreground)] mb-2">
                  "{item.problem}"
                </h4>
                <ul className="space-y-1.5 text-xs text-[var(--muted)]">
                  {item.solutions.slice(0, 2).map((sol, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span className="line-clamp-2">{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
                <span>View solutions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="space-y-4 pt-4">
        <div className="pb-2 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Detailed answers regarding document intelligence, table stitching, math formatting, and exports.
          </p>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isOpen = activeFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[var(--foreground)] hover:bg-[var(--background)]/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--muted)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--muted)] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--border)]/40 bg-[var(--background)]/30">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONTACT SUPPORT SECTION */}
      <section className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] shadow-lg space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold mb-2">
            <Send className="w-3 h-3" />
            <span>ParseAnything Support Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Contact Support & Engineering
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Encountering an unusual document format or parsing edge case? Submit a ticket and our team will inspect your document logs.
          </p>
        </div>

        {submittedTicket ? (
          <div className="p-6 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[var(--foreground)]">
              Support Ticket Submitted
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
              {submittedTicket.message}
            </p>
            <div className="inline-block px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--primary)]">
              Ticket ID: {submittedTicket.id}
            </div>
            <div>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-3xl">
            {formError && (
              <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="alex.morgan@company.com"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Issue Category *
                </label>
                <select
                  value={contactCategory}
                  onChange={(e) => setContactCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden"
                >
                  <option value="Upload Issue">Document Upload Issue</option>
                  <option value="OCR Extraction">OCR & Text Extraction</option>
                  <option value="Table Merging">Table Extraction / Cross-Page Merge</option>
                  <option value="Figure & Chart">Figure / Chart Data Extraction</option>
                  <option value="Math Equation">Mathematical Equation LaTeX</option>
                  <option value="Gemini API Error">Gemini AI / API Error</option>
                  <option value="Feature Request">Feature Request or Feedback</option>
                  <option value="General Question">General Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Document ID (Optional)
                </label>
                <select
                  value={contactDocId}
                  onChange={(e) => setContactDocId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden"
                >
                  <option value="">Select a document (or leave empty)</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename} ({d.format.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Subject
              </label>
              <input
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="Brief summary of the inquiry..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Description / Message *
              </label>
              <textarea
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Please describe the document structure, unexpected behavior, or specific error message you observed..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="attachDiag"
                checked={attachDiagnostics}
                onChange={(e) => setAttachDiagnostics(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
              />
              <label htmlFor="attachDiag" className="text-xs text-[var(--muted)] cursor-pointer select-none">
                Include system environment diagnostics (browser, OS, active OCR engine, and Gemini connectivity)
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ARTICLE DRILLDOWN MODAL */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${selectedCategory.color}`}>
                  <selectedCategory.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--foreground)]">
                    {selectedCategory.name}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">{selectedCategory.articlesCount} Articles</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategory(null)}
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedCategory.articles.map((art, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1.5"
                >
                  <h4 className="font-bold text-xs text-[var(--foreground)] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
                    {art.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {art.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold cursor-pointer"
              >
                Close Articles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TROUBLESHOOTING DRILLDOWN MODAL */}
      {selectedTroubleshoot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">
                  Troubleshooting Guide // {selectedTroubleshoot.category}
                </span>
                <h3 className="font-bold text-base text-[var(--foreground)] mt-0.5">
                  "{selectedTroubleshoot.problem}"
                </h3>
              </div>

              <button
                onClick={() => setSelectedTroubleshoot(null)}
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-semibold text-[var(--foreground)]">Recommended Diagnostic Steps:</div>
              <div className="space-y-2">
                {selectedTroubleshoot.solutions.map((sol, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold font-mono text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[var(--foreground)] leading-relaxed">{sol}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Pro Tip: </strong>
                  {selectedTroubleshoot.tips}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedTroubleshoot(null);
                  navigate('/upload');
                }}
                className="text-xs text-[var(--primary)] font-semibold hover:underline"
              >
                Go to Document Upload →
              </button>

              <button
                onClick={() => setSelectedTroubleshoot(null)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
