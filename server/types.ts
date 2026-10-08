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
  confidence: number;
  readingOrder: number;
  needsReview?: boolean;
  level?: number;
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
  format: string;
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
  confidenceThreshold: number;
  autoMergeTables: boolean;
  stripRunningHeaders: boolean;
}
