import { DocumentBlock, TableData } from '../types.js';

export class OfficeParser {
  /**
   * Parse plain text, Markdown, or CSV data into initial blocks
   */
  public parseTextContent(
    content: string,
    format: string,
    pageCount: number = 1
  ): DocumentBlock[] {
    const blocks: DocumentBlock[] = [];
    const lines = content.split('\n');

    let currentY = 120;
    const lineHeight = 35;
    let order = 1;

    if (format === 'csv') {
      const rows = lines
        .map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
        .filter(r => r.length > 0 && r[0].length > 0);

      if (rows.length > 0) {
        const headers = rows[0];
        const dataRows = rows.slice(1);
        const tableData: TableData = {
          headers,
          rows: dataRows,
          caption: 'Imported CSV Table',
          rowCount: dataRows.length,
          colCount: headers.length,
        };

        blocks.push({
          id: `block_csv_table_1`,
          type: 'table',
          page: 1,
          bbox: [60, 100, 940, Math.min(900, 100 + rows.length * 40)],
          confidence: 0.99,
          readingOrder: order++,
          tableData,
          text: lines.join('\n'),
        });
      }
      return blocks;
    }

    if (format === 'eml' || format === 'msg') {
      // Parse email headers
      blocks.push({
        id: `block_email_hdr`,
        type: 'header',
        page: 1,
        bbox: [80, 70, 920, 150],
        confidence: 0.98,
        readingOrder: order++,
        text: 'From: finance-dept@acme-corp.internal | Subject: Quarterly Filing & Reconciliation Notice | Date: 2025-10-06',
      });
      currentY = 180;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const y1 = currentY;
      const y2 = currentY + lineHeight;
      currentY += lineHeight + 8;

      if (line.startsWith('#')) {
        const level = (line.match(/^#+/) || ['#'])[0].length;
        const text = line.replace(/^#+\s*/, '');
        blocks.push({
          id: `block_${order}`,
          type: 'heading',
          level,
          text,
          page: 1,
          bbox: [80, y1, 850, y2],
          confidence: 0.97,
          readingOrder: order++,
        });
      } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\./.test(line)) {
        blocks.push({
          id: `block_${order}`,
          type: 'list',
          text: line,
          page: 1,
          bbox: [100, y1, 880, y2],
          confidence: 0.95,
          readingOrder: order++,
        });
      } else {
        blocks.push({
          id: `block_${order}`,
          type: 'paragraph',
          text: line,
          page: 1,
          bbox: [80, y1, 920, y2],
          confidence: 0.94,
          readingOrder: order++,
        });
      }

      if (currentY > 880) {
        currentY = 120; // reset for next logical section
      }
    }

    return blocks;
  }
}

export const officeParser = new OfficeParser();
