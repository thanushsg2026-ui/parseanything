import { DocumentBlock, DocumentItem, PageMetadata, ParsedDocumentResult, ParserSettings } from '../types.js';
import { pdfParser } from './pdfParser.js';
import { tableParser } from './tableParser.js';

class DocumentStore {
  private documents: Map<string, DocumentItem> = new Map();
  private results: Map<string, ParsedDocumentResult> = new Map();
  private settings: ParserSettings = {
    ocrEngine: 'paddleocr',
    extractionMode: 'high_accuracy',
    geminiUsage: 'auto',
    confidenceThreshold: 0.70,
    autoMergeTables: true,
    stripRunningHeaders: false,
  };

  constructor() {
    this.seedDemoDocuments();
  }

  public getSettings(): ParserSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ParserSettings>): ParserSettings {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  public getAllDocuments(): DocumentItem[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  public getDocument(id: string): DocumentItem | undefined {
    return this.documents.get(id);
  }

  public getResult(id: string): ParsedDocumentResult | undefined {
    return this.results.get(id);
  }

  public saveDocument(doc: DocumentItem): void {
    this.documents.set(doc.id, doc);
  }

  public saveResult(result: ParsedDocumentResult): void {
    this.results.set(result.document.id, result);
    this.documents.set(result.document.id, result.document);
  }

  public deleteDocument(id: string): boolean {
    this.results.delete(id);
    return this.documents.delete(id);
  }

  /**
   * Populate realistic demonstration documents for instant hackathon evaluations
   */
  private seedDemoDocuments(): void {
    const demoId1 = 'demo-acme-financial-2025';
    const demoDoc1: DocumentItem = {
      id: demoId1,
      filename: 'Q3_2025_Acme_Financial_Report.pdf',
      originalName: 'Q3_2025_Acme_Financial_Report.pdf',
      format: 'pdf',
      fileSize: 2458920,
      uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      processedAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
      status: 'completed',
      pages: 3,
      totalBlocks: 14,
      averageConfidence: 0.94,
      needsReviewCount: 1,
      geminiUsed: true,
      geminiStatus: 'success',
      isDemo: true,
      stages: [
        { id: '1', name: 'Uploading', status: 'completed', durationMs: 120 },
        { id: '2', name: 'Detecting format', status: 'completed', durationMs: 45, detail: 'PDF 1.7 (scanned + digital)' },
        { id: '3', name: 'Rendering pages', status: 'completed', durationMs: 230 },
        { id: '4', name: 'Detecting layout', status: 'completed', durationMs: 180, detail: 'Multi-column + grid tables' },
        { id: '5', name: 'OCR / text extraction', status: 'completed', durationMs: 410, detail: 'Surya OCR engine' },
        { id: '6', name: 'Table detection', status: 'completed', durationMs: 190, detail: '2 cross-page segments' },
        { id: '7', name: 'Figure detection', status: 'completed', durationMs: 310, detail: 'Revenue bar chart' },
        { id: '8', name: 'Equation detection', status: 'completed', durationMs: 220, detail: 'LaTeX transcribed' },
        { id: '9', name: 'Reading-order reconstruction', status: 'completed', durationMs: 75 },
        { id: '10', name: 'Validation', status: 'completed', durationMs: 60, detail: '1 flagged review' },
        { id: '11', name: 'Generating output', status: 'completed', durationMs: 40 },
      ],
    };

    const pages1: PageMetadata[] = [
      {
        pageNumber: 1,
        width: 800,
        height: 1100,
        hasTextLayer: false,
        isScanned: true,
        dpi: 300,
        blockCount: 4,
        previewSvg: pdfParser.generateSvgPreview(1, true, 'Q3 2025 Financial Report'),
      },
      {
        pageNumber: 2,
        width: 800,
        height: 1100,
        hasTextLayer: true,
        isScanned: false,
        dpi: 150,
        blockCount: 5,
        previewSvg: pdfParser.generateSvgPreview(2, false, 'Q3 2025 Financial Report'),
      },
      {
        pageNumber: 3,
        width: 800,
        height: 1100,
        hasTextLayer: true,
        isScanned: false,
        dpi: 150,
        blockCount: 5,
        previewSvg: pdfParser.generateSvgPreview(3, false, 'Q3 2025 Financial Report'),
      },
    ];

    const blocks1: DocumentBlock[] = [
      // Page 1
      {
        id: 'block_001',
        type: 'header',
        page: 1,
        bbox: [60, 40, 740, 80],
        confidence: 0.98,
        readingOrder: 1,
        text: 'ACME CORPORATION // QUARTERLY REPORT (FORM 10-Q) // FISCAL YEAR 2025',
      },
      {
        id: 'block_002',
        type: 'heading',
        level: 1,
        page: 1,
        bbox: [80, 100, 720, 155],
        confidence: 0.99,
        readingOrder: 2,
        text: 'Part I — Financial Information: Condensed Consolidated Statements',
      },
      {
        id: 'block_003',
        type: 'paragraph',
        page: 1,
        bbox: [80, 175, 720, 260],
        confidence: 0.96,
        readingOrder: 3,
        text: 'The accompanying unaudited condensed consolidated financial statements have been prepared in accordance with GAAP for interim financial information. In the opinion of management, all adjustments necessary for a fair presentation have been included. Total operating income expanded substantially across all segments during the third quarter.',
      },
      {
        id: 'block_004',
        type: 'paragraph',
        page: 1,
        bbox: [580, 130, 740, 180],
        confidence: 0.62,
        readingOrder: 4,
        needsReview: true,
        text: 'CERTIFIED AUDIT STAMP // REF# 2025-998A-OX [SCAN BLURRED]',
        sourceContext: {
          isOcr: true,
          rawSnippet: 'CERTIF...D AUD... STAMP // 2025-998A...',
        },
      },

      // Page 2
      {
        id: 'block_005',
        type: 'heading',
        level: 2,
        page: 2,
        bbox: [80, 80, 680, 130],
        confidence: 0.97,
        readingOrder: 5,
        text: 'Statements of Income & Core Operations (Unaudited, in Millions)',
      },
      {
        id: 'block_006',
        type: 'table',
        page: 2,
        bbox: [80, 150, 720, 480],
        confidence: 0.96,
        readingOrder: 6,
        tableData: {
          headers: ['Line Item', 'Three Months Ended Sep 30, 2025', 'Nine Months Ended Sep 30, 2025'],
          rows: [
            ['Total Product Revenue', '$ 48.9', '$ 142.1'],
            ['Service & Subscription Revenue', '$ 22.4', '$ 64.8'],
            ['Total Consolidated Revenue', '$ 71.3', '$ 206.9'],
            ['Cost of Goods Sold (COGS)', '$ 28.1', '$ 82.4'],
            ['Gross Profit', '$ 43.2', '$ 124.5'],
            ['Research & Development (R&D)', '$ 14.6', '$ 41.8'],
            ['Sales & Marketing (S&M)', '$ 11.2', '$ 33.1'],
            ['General & Administrative', '$ 6.8', '$ 19.4'],
            ['Total Operating Expenses', '$ 32.6', '$ 94.3'],
            ['Operating Income', '$ 10.6', '$ 30.2'],
            ['Provision for Income Taxes', '$ 2.1', '$ 6.0'],
            ['Net Income Attributable to Common Stock', '$ 8.5', '$ 24.2'],
          ],
          caption: 'Consolidated Statements of Operations (in Millions USD)',
          rowCount: 12,
          colCount: 3,
          isMergedCrossPage: true,
          continuationPage: 3,
          notes: 'Merged seamlessly across pages 2 and 3 into one continuous logical statement table.',
        },
        text: '| Line Item | Three Months Ended Sep 30, 2025 | Nine Months Ended Sep 30, 2025 |\n| --- | --- | --- |\n| Total Product Revenue | $ 48.9 | $ 142.1 |\n| Service & Subscription Revenue | $ 22.4 | $ 64.8 |\n| Total Consolidated Revenue | $ 71.3 | $ 206.9 |\n| Cost of Goods Sold (COGS) | $ 28.1 | $ 82.4 |\n| Gross Profit | $ 43.2 | $ 124.5 |\n| Total Operating Expenses | $ 32.6 | $ 94.3 |\n| Net Income | $ 8.5 | $ 24.2 |',
      },
      {
        id: 'block_007',
        type: 'heading',
        level: 3,
        page: 2,
        bbox: [80, 520, 520, 560],
        confidence: 0.96,
        readingOrder: 7,
        text: 'Earnings Per Share (EPS) Methodology',
      },
      {
        id: 'block_008',
        type: 'equation',
        page: 2,
        bbox: [80, 580, 720, 680],
        confidence: 0.97,
        readingOrder: 8,
        equationData: {
          latex: '\\mathrm{Diluted\\ EPS} = \\frac{\\mathrm{Net\\ Income} - \\mathrm{Preferred\\ Dividends}}{\\mathrm{Weighted\\ Average\\ Common\\ Shares\\ Outstanding} + \\mathrm{Dilutive\\ Potential\\ Common\\ Shares}}',
          displayMode: true,
          explanation: 'Formula for Diluted Earnings Per Share calculated under GAAP ASC 260',
          variables: [
            { symbol: 'Net Income', meaning: 'Net earnings of $8.5M for the quarter' },
            { symbol: 'Preferred Dividends', meaning: '$0.00 (No preferred stock issued)' },
            { symbol: 'Weighted Average Common Shares', meaning: '42.1 million shares' },
            { symbol: 'Dilutive Potential Shares', meaning: '1.8 million stock options' },
          ],
        },
        text: '$$\\mathrm{Diluted\\ EPS} = \\frac{\\mathrm{Net\\ Income} - \\mathrm{Preferred\\ Dividends}}{\\mathrm{Weighted\\ Average\\ Common\\ Shares\\ Outstanding} + \\mathrm{Dilutive\\ Potential\\ Common\\ Shares}}$$',
      },
      {
        id: 'block_009',
        type: 'paragraph',
        page: 2,
        bbox: [80, 700, 720, 760],
        confidence: 0.95,
        readingOrder: 9,
        text: 'Diluted EPS for the quarter was $0.19 per share, compared to $0.14 per share in the prior year period, representing year-over-year earnings expansion of 35.7%.',
      },

      // Page 3
      {
        id: 'block_010',
        type: 'heading',
        level: 2,
        page: 3,
        bbox: [80, 80, 620, 125],
        confidence: 0.98,
        readingOrder: 10,
        text: 'Figure 1 — Quarterly Revenue Expansion & Trend Analysis',
      },
      {
        id: 'block_011',
        type: 'figure',
        page: 3,
        bbox: [80, 140, 720, 480],
        confidence: 0.94,
        readingOrder: 11,
        figureData: {
          chartType: 'bar',
          caption: 'Figure 1: Quarterly Product & Cloud Revenue (USD Millions, FY2024-FY2025)',
          extractedData: [
            { label: 'Q1 FY24', value: 24.5, category: 'Product' },
            { label: 'Q2 FY24', value: 28.1, category: 'Product' },
            { label: 'Q3 FY24', value: 31.0, category: 'Product' },
            { label: 'Q4 FY24', value: 35.4, category: 'Product' },
            { label: 'Q1 FY25', value: 39.2, category: 'Product' },
            { label: 'Q2 FY25', value: 44.0, category: 'Product' },
            { label: 'Q3 FY25', value: 48.9, category: 'Product' },
          ],
          summary: 'Steady sequential acceleration with 57.7% growth over 7 consecutive quarters.',
          dataConfidence: 0.95,
          isExtractedWithGemini: true,
        },
        text: '![Figure 1: Quarterly Revenue Trend](figure_chart_1) — Extracted 7 data points indicating steady top-line growth.',
      },
      {
        id: 'block_012',
        type: 'paragraph',
        page: 3,
        bbox: [80, 510, 720, 600],
        confidence: 0.95,
        readingOrder: 12,
        text: 'As depicted in Figure 1 above, quarterly revenue has risen consecutively from $24.5M to $48.9M. Growth in the enterprise cloud segment accounted for over 68% of new contract bookings in the reported timeframe.',
      },
      {
        id: 'block_013',
        type: 'footnote',
        page: 3,
        bbox: [80, 840, 720, 890],
        confidence: 0.93,
        readingOrder: 13,
        text: '* Note 1: Excludes non-cash stock-based compensation of $3.2M. Revenue figures rounded to the nearest tenth of a million.',
      },
      {
        id: 'block_014',
        type: 'footer',
        page: 3,
        bbox: [60, 930, 740, 960],
        confidence: 0.99,
        readingOrder: 14,
        text: 'ACME CORP | FORM 10-Q REPORTING PERIOD ENDED SEPTEMBER 30, 2025 | PAGE 3 OF 3',
      },
    ];

    const markdown1 = `# Part I — Financial Information: Condensed Consolidated Statements

ACME CORPORATION // QUARTERLY REPORT (FORM 10-Q) // FISCAL YEAR 2025

The accompanying unaudited condensed consolidated financial statements have been prepared in accordance with GAAP for interim financial information. In the opinion of management, all adjustments necessary for a fair presentation have been included. Total operating income expanded substantially across all segments during the third quarter.

## Statements of Income & Core Operations (Unaudited, in Millions)

| Line Item | Three Months Ended Sep 30, 2025 | Nine Months Ended Sep 30, 2025 |
| --- | --- | --- |
| Total Product Revenue | $ 48.9 | $ 142.1 |
| Service & Subscription Revenue | $ 22.4 | $ 64.8 |
| Total Consolidated Revenue | $ 71.3 | $ 206.9 |
| Cost of Goods Sold (COGS) | $ 28.1 | $ 82.4 |
| Gross Profit | $ 43.2 | $ 124.5 |
| Research & Development (R&D) | $ 14.6 | $ 41.8 |
| Sales & Marketing (S&M) | $ 11.2 | $ 33.1 |
| General & Administrative | $ 6.8 | $ 19.4 |
| Total Operating Expenses | $ 32.6 | $ 94.3 |
| Operating Income | $ 10.6 | $ 30.2 |
| Provision for Income Taxes | $ 2.1 | $ 6.0 |
| Net Income Attributable to Common Stock | $ 8.5 | $ 24.2 |

### Earnings Per Share (EPS) Methodology

$$
\\mathrm{Diluted\\ EPS} = \\frac{\\mathrm{Net\\ Income} - \\mathrm{Preferred\\ Dividends}}{\\mathrm{Weighted\\ Average\\ Common\\ Shares\\ Outstanding} + \\mathrm{Dilutive\\ Potential\\ Common\\ Shares}}
$$

Diluted EPS for the quarter was $0.19 per share, compared to $0.14 per share in the prior year period, representing year-over-year earnings expansion of 35.7%.

## Figure 1 — Quarterly Revenue Expansion & Trend Analysis

| Quarter | Value ($M) |
| --- | --- |
| Q1 FY24 | 24.5 |
| Q2 FY24 | 28.1 |
| Q3 FY24 | 31.0 |
| Q4 FY24 | 35.4 |
| Q1 FY25 | 39.2 |
| Q2 FY25 | 44.0 |
| Q3 FY25 | 48.9 |

As depicted in Figure 1 above, quarterly revenue has risen consecutively from $24.5M to $48.9M. Growth in the enterprise cloud segment accounted for over 68% of new contract bookings in the reported timeframe.

---
\\* Note 1: Excludes non-cash stock-based compensation of $3.2M. Revenue figures rounded to the nearest tenth of a million.
`;

    const res1: ParsedDocumentResult = {
      document: demoDoc1,
      pages: pages1,
      blocks: blocks1,
      markdown: markdown1,
      summary: 'Q3 2025 Financial Statement parsed with 94% average confidence. Cross-page table merged across pages 2-3, 1 revenue chart converted to data, 1 EPS formula transcribed to LaTeX, and 1 low-confidence scanned stamp flagged.',
      crossPageTablesMergedCount: 1,
    };

    this.documents.set(demoId1, demoDoc1);
    this.results.set(demoId1, res1);

    // Seed Demo 2: Legal Master Services Agreement
    const demoId2 = 'demo-legal-contract-2025';
    const demoDoc2: DocumentItem = {
      id: demoId2,
      filename: 'Master_Services_Agreement_2025.docx',
      originalName: 'Master_Services_Agreement_2025.docx',
      format: 'docx',
      fileSize: 1184020,
      uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      processedAt: new Date(Date.now() - 3600000 * 4.9).toISOString(),
      status: 'completed',
      pages: 2,
      totalBlocks: 9,
      averageConfidence: 0.98,
      needsReviewCount: 0,
      geminiUsed: false,
      isDemo: true,
      stages: [
        { id: '1', name: 'Uploading', status: 'completed' },
        { id: '2', name: 'Detecting format', status: 'completed', detail: 'DOCX (Office Open XML)' },
        { id: '3', name: 'Rendering pages', status: 'completed' },
        { id: '4', name: 'Detecting layout', status: 'completed', detail: 'Legal two-column clauses' },
        { id: '5', name: 'OCR / text extraction', status: 'completed', detail: 'Direct digital text layer' },
        { id: '6', name: 'Table detection', status: 'completed', detail: 'Rate schedule table' },
        { id: '7', name: 'Figure detection', status: 'completed', detail: '0 figures' },
        { id: '8', name: 'Equation detection', status: 'completed', detail: '0 equations' },
        { id: '9', name: 'Reading-order reconstruction', status: 'completed' },
        { id: '10', name: 'Validation', status: 'completed', detail: 'All blocks verified' },
        { id: '11', name: 'Generating output', status: 'completed' },
      ],
    };

    const pages2: PageMetadata[] = [
      {
        pageNumber: 1,
        width: 800,
        height: 1100,
        hasTextLayer: true,
        isScanned: false,
        blockCount: 5,
        previewSvg: pdfParser.generateSvgPreview(1, false, 'Master Services Agreement'),
      },
      {
        pageNumber: 2,
        width: 800,
        height: 1100,
        hasTextLayer: true,
        isScanned: false,
        blockCount: 4,
        previewSvg: pdfParser.generateSvgPreview(2, false, 'Master Services Agreement'),
      },
    ];

    const blocks2: DocumentBlock[] = [
      {
        id: 'block_leg_01',
        type: 'heading',
        level: 1,
        page: 1,
        bbox: [80, 80, 720, 130],
        confidence: 0.99,
        readingOrder: 1,
        text: 'MASTER SERVICES & CLOUD ENTERPRISE AGREEMENT',
      },
      {
        id: 'block_leg_02',
        type: 'paragraph',
        page: 1,
        bbox: [80, 150, 720, 220],
        confidence: 0.98,
        readingOrder: 2,
        text: 'This Master Services Agreement ("Agreement") is made effective as of October 1, 2025 by and between Acme Cloud Systems Inc. ("Provider") and Enterprise Global Logistics Corp. ("Client").',
      },
      {
        id: 'block_leg_03',
        type: 'heading',
        level: 2,
        page: 1,
        bbox: [80, 240, 480, 280],
        confidence: 0.98,
        readingOrder: 3,
        text: 'Section 4. Service Level Commitments & Remedies',
      },
      {
        id: 'block_leg_04',
        type: 'paragraph',
        page: 1,
        bbox: [80, 300, 720, 410],
        confidence: 0.97,
        readingOrder: 4,
        text: 'Provider warrants that production workloads will achieve 99.95% monthly uptime. In the event of an unplanned outage in excess of fifteen (15) minutes, Client shall be entitled to service fee credits proportional to total impact as defined in Exhibit B.',
      },
      {
        id: 'block_leg_05',
        type: 'table',
        page: 1,
        bbox: [80, 440, 720, 680],
        confidence: 0.98,
        readingOrder: 5,
        tableData: {
          headers: ['Role / Tier', 'Standard Hourly Rate (USD)', 'After-Hours Support Rate', 'SLA Response Window'],
          rows: [
            ['Principal Cloud Architect', '$ 275.00', '$ 385.00', '< 1 Hour'],
            ['Senior DevOps Engineer', '$ 210.00', '$ 295.00', '< 2 Hours'],
            ['Data Engineering Lead', '$ 195.00', '$ 270.00', '< 4 Hours'],
            ['Technical Support Specialist', '$ 125.00', '$ 175.00', '< 30 Minutes'],
          ],
          caption: 'Schedule A: Engineering Staffing & Rate Card',
          rowCount: 4,
          colCount: 4,
        },
        text: '| Role / Tier | Standard Hourly Rate (USD) | After-Hours Support Rate | SLA Response Window |\n| --- | --- | --- | --- |\n| Principal Cloud Architect | $ 275.00 | $ 385.00 | < 1 Hour |\n| Senior DevOps Engineer | $ 210.00 | $ 295.00 | < 2 Hours |\n| Data Engineering Lead | $ 195.00 | $ 270.00 | < 4 Hours |\n| Technical Support Specialist | $ 125.00 | $ 175.00 | < 30 Minutes |',
      },
      {
        id: 'block_leg_06',
        type: 'heading',
        level: 2,
        page: 2,
        bbox: [80, 80, 520, 120],
        confidence: 0.99,
        readingOrder: 6,
        text: 'Section 8. Limitation of Liability & Indemnification',
      },
      {
        id: 'block_leg_07',
        type: 'paragraph',
        page: 2,
        bbox: [80, 140, 720, 240],
        confidence: 0.98,
        readingOrder: 7,
        text: 'NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, REGARDLESS OF WHETHER INFORMED OF THE POSSIBILITY OF SUCH LOSS.',
      },
      {
        id: 'block_leg_08',
        type: 'paragraph',
        page: 2,
        bbox: [80, 260, 720, 360],
        confidence: 0.97,
        readingOrder: 8,
        text: 'Each party shall defend, indemnify, and hold harmless the other from third-party claims alleging infringement of intellectual property rights, gross negligence, or willful misconduct.',
      },
      {
        id: 'block_leg_09',
        type: 'footer',
        page: 2,
        bbox: [80, 920, 720, 950],
        confidence: 0.99,
        readingOrder: 9,
        text: 'CONFIDENTIAL MSA // ACME CLOUD SYSTEMS // PAGE 2 OF 2',
      },
    ];

    const markdown2 = `# MASTER SERVICES & CLOUD ENTERPRISE AGREEMENT

This Master Services Agreement ("Agreement") is made effective as of October 1, 2025 by and between Acme Cloud Systems Inc. ("Provider") and Enterprise Global Logistics Corp. ("Client").

## Section 4. Service Level Commitments & Remedies

Provider warrants that production workloads will achieve 99.95% monthly uptime. In the event of an unplanned outage in excess of fifteen (15) minutes, Client shall be entitled to service fee credits proportional to total impact as defined in Exhibit B.

### Schedule A: Engineering Staffing & Rate Card

| Role / Tier | Standard Hourly Rate (USD) | After-Hours Support Rate | SLA Response Window |
| --- | --- | --- | --- |
| Principal Cloud Architect | $ 275.00 | $ 385.00 | < 1 Hour |
| Senior DevOps Engineer | $ 210.00 | $ 295.00 | < 2 Hours |
| Data Engineering Lead | $ 195.00 | $ 270.00 | < 4 Hours |
| Technical Support Specialist | $ 125.00 | $ 175.00 | < 30 Minutes |

## Section 8. Limitation of Liability & Indemnification

NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, REGARDLESS OF WHETHER INFORMED OF THE POSSIBILITY OF SUCH LOSS.

Each party shall defend, indemnify, and hold harmless the other from third-party claims alleging infringement of intellectual property rights, gross negligence, or willful misconduct.
`;

    const res2: ParsedDocumentResult = {
      document: demoDoc2,
      pages: pages2,
      blocks: blocks2,
      markdown: markdown2,
      summary: 'Legal contract successfully parsed with 98% confidence. Structured SLA clauses and engineering rate card table preserved with complete source citations.',
      crossPageTablesMergedCount: 0,
    };

    this.documents.set(demoId2, demoDoc2);
    this.results.set(demoId2, res2);
  }
}

export const documentStore = new DocumentStore();
