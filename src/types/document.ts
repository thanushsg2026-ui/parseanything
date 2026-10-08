export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'figure'
  | 'caption'
  | 'equation'
  | 'header'
  | 'footer'
  | 'footnote';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface BoundingBox {
  // [x1, y1, x2, y2] normalized or points: 0 to 1000 scale for universal resolution independence
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ChartDataPoint {
  label: string;
  value: number | string;
  category?: string;
}

export interface FigureData {
  chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'diagram' | 'photo' | 'unknown';
  caption?: string;
  extractedData?: ChartDataPoint[];
  summary?: string;
  dataConfidence?: number;
  isExtractedWithGemini?: boolean;
}

export interface TableRow {
  cells: string[];
  isHeader?: boolean;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
  rowCount: number;
  colCount: number;
  isMergedCrossPage?: boolean;
  continuationPage?: number;
  notes?: string;
}

export interface EquationData {
  latex: string;
  displayMode?: boolean;
  explanation?: string;
  variables?: { symbol: string; meaning: string }[];
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  text?: string;
  page: number; // 1-indexed
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] normalized 0-1000
  confidence: number; // 0.0 - 1.0
  readingOrder: number;
  needsReview?: boolean;
  level?: number; // for headings (h1, h2, h3)
  listType?: 'bullet' | 'numbered';
  tableData?: TableData;
  figureData?: FigureData;
  equationData?: EquationData;
  sourceContext?: {
    rawSnippet?: string;
    detectedFont?: string;
    isOcr?: boolean;
    geminiEnriched?: boolean;
  };
}

export interface PageMetadata {
  pageNumber: number;
  width: number;
  height: number;
  hasTextLayer: boolean;
  isScanned: boolean;
  dpi?: number;
  rotation?: number;
  previewUrl?: string; // Data URL or endpoint
  previewSvg?: string;
  blockCount: number;
}

export interface ProcessingStageStatus {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  durationMs?: number;
  detail?: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  originalName: string;
  format: string; // pdf, docx, png, etc.
  fileSize: number;
  uploadedAt: string;
  processedAt?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  pages: number;
  totalBlocks: number;
  averageConfidence: number;
  needsReviewCount: number;
  errorMessage?: string;
  geminiUsed: boolean;
  geminiStatus?: 'success' | 'failed' | 'bypassed';
  stages: ProcessingStageStatus[];
  isDemo?: boolean;
}

export interface ParsedDocumentResult {
  document: DocumentItem;
  pages: PageMetadata[];
  blocks: DocumentBlock[];
  markdown: string;
  summary?: string;
  crossPageTablesMergedCount: number;
}

export interface ParserSettings {
  ocrEngine: 'tesseract' | 'paddleocr' | 'surya' | 'hybrid';
  extractionMode: 'fast' | 'balanced' | 'high_accuracy';
  geminiUsage: 'auto' | 'always' | 'disabled';
  confidenceThreshold: number; // 0.5 - 1.0
  autoMergeTables: boolean;
  stripRunningHeaders: boolean;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  foreground: string;
  border: string;
  muted: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type PresetThemeName = 'indigo' | 'blue' | 'purple' | 'emerald' | 'cyan' | 'rose' | 'amber';
