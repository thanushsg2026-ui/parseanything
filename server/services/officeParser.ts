import { DocumentBlock, TableData } from '../types.js';

export class OfficeParser {
  /**
   * Parse plain text, Markdown, CSV, HTML or Office file content into initial blocks
   */
  public parseTextContent(
    content: string,
    format: string,
    pageCount: number = 1
  ): DocumentBlock[] {
    const blocks: DocumentBlock[] = [];
    const fmt = format.toLowerCase();

    // 1. CSV Format
    if (fmt === 'csv') {
      const lines = content.split('\n');
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
          readingOrder: 1,
          tableData,
          text: lines.join('\n'),
        });
      }
      return blocks;
    }

    // 2. HTML Format
    if (fmt === 'html' || fmt === 'htm') {
      let order = 1;
      let currentY = 100;
      const lineHeight = 35;

      // Extract headings
      const headingMatches = content.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi) || [];
      for (const h of headingMatches) {
        const levelMatch = h.match(/<h([1-6])/i);
        const text = h.replace(/<[^>]+>/g, '').trim();
        if (text) {
          blocks.push({
            id: `blk_html_h_${order}`,
            type: 'heading',
            level: levelMatch ? parseInt(levelMatch[1], 10) : 1,
            text,
            page: 1,
            bbox: [80, currentY, 850, currentY + lineHeight],
            confidence: 0.98,
            readingOrder: order++,
          });
          currentY += lineHeight + 8;
        }
      }

      // Extract tables
      const tableMatches = content.match(/<table[^>]*>([\s\S]*?)<\/table>/gi) || [];
      for (const t of tableMatches) {
        const rows = (t.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []).map(tr => {
          return (tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []).map(cell =>
            cell.replace(/<[^>]+>/g, '').trim()
          );
        }).filter(r => r.length > 0);

        if (rows.length > 0) {
          const headers = rows[0];
          const dataRows = rows.slice(1);
          blocks.push({
            id: `blk_html_tbl_${order}`,
            type: 'table',
            page: 1,
            bbox: [80, currentY, 920, Math.min(880, currentY + rows.length * 35)],
            confidence: 0.97,
            readingOrder: order++,
            tableData: {
              headers,
              rows: dataRows,
              caption: 'Extracted HTML Table',
              rowCount: dataRows.length,
              colCount: headers.length,
            },
            text: rows.map(r => r.join(' | ')).join('\n'),
          });
          currentY += Math.min(400, rows.length * 35) + 15;
        }
      }

      // Extract paragraphs
      const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      for (const p of pMatches) {
        const text = p.replace(/<[^>]+>/g, '').trim();
        if (text) {
          blocks.push({
            id: `blk_html_p_${order}`,
            type: 'paragraph',
            text,
            page: 1,
            bbox: [80, currentY, 920, currentY + lineHeight],
            confidence: 0.96,
            readingOrder: order++,
          });
          currentY += lineHeight + 8;
          if (currentY > 880) currentY = 120;
        }
      }

      if (blocks.length > 0) {
        return blocks;
      }
    }

    // 3. Email (EML / MSG)
    let order = 1;
    let currentY = 120;
    const lineHeight = 35;

    if (fmt === 'eml' || fmt === 'msg') {
      blocks.push({
        id: `block_email_hdr`,
        type: 'header',
        page: 1,
        bbox: [80, 70, 920, 150],
        confidence: 0.98,
        readingOrder: order++,
        text: 'From: sender@enterprise.internal | Subject: Ingested Business Record | Date: ' + new Date().toISOString().split('T')[0],
      });
      currentY = 180;
    }

    // 4. TXT, Markdown, DOC/DOCX, PPT/PPTX, XLS/XLSX text parsing
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const y1 = currentY;
      const y2 = currentY + lineHeight;
      currentY += lineHeight + 8;

      // Table line (Markdown pipe table)
      if (line.includes('|') && i + 1 < lines.length && (lines[i + 1].includes('---') || lines[i + 1].includes('|'))) {
        const tableLines = [line];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().includes('|')) {
          tableLines.push(lines[j].trim());
          j++;
        }
        i = j - 1;

        const rawRows = tableLines
          .filter(l => !l.includes('---'))
          .map(l => l.split('|').map(c => c.trim()).filter(c => c.length > 0));

        if (rawRows.length > 0) {
          const headers = rawRows[0];
          const dataRows = rawRows.slice(1);
          blocks.push({
            id: `blk_md_tbl_${order}`,
            type: 'table',
            page: 1,
            bbox: [80, y1, 920, Math.min(880, y1 + rawRows.length * 35)],
            confidence: 0.97,
            readingOrder: order++,
            tableData: {
              headers,
              rows: dataRows,
              caption: 'Markdown Table',
              rowCount: dataRows.length,
              colCount: headers.length,
            },
            text: tableLines.join('\n'),
          });
          currentY += Math.min(400, rawRows.length * 35);
          continue;
        }
      }

      // LaTeX math line ($$ ... $$)
      if (line.startsWith('$$') && line.endsWith('$$') && line.length > 4) {
        const latex = line.slice(2, -2).trim();
        blocks.push({
          id: `blk_eq_${order}`,
          type: 'equation',
          page: 1,
          bbox: [80, y1, 850, y2 + 20],
          confidence: 0.98,
          readingOrder: order++,
          equationData: {
            latex,
            displayMode: true,
            explanation: 'Mathematical Equation',
          },
          text: line,
        });
        currentY += 20;
        continue;
      }

      // Headings
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
        currentY = 120;
      }
    }

    return blocks;
  }
}

export const officeParser = new OfficeParser();
