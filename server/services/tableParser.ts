import { DocumentBlock, TableData } from '../types.js';

export class TableParser {
  /**
   * Evaluates text blocks to detect grid-like tables, headers, and cell relationships
   */
  public parseTableFromTextLines(
    lines: string[],
    pageNumber: number,
    bbox: [number, number, number, number],
    caption?: string
  ): DocumentBlock {
    const rawRows = lines.map(line => {
      // Split by tab, pipe, or multiple spaces
      if (line.includes('|')) {
        return line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      }
      if (line.includes('\t')) {
        return line.split('\t').map(c => c.trim());
      }
      return line.split(/\s{2,}/).map(c => c.trim());
    }).filter(r => r.length > 1);

    const headers = rawRows.length > 0 ? rawRows[0] : ['Column 1', 'Column 2'];
    const dataRows = rawRows.length > 1 ? rawRows.slice(1) : [];

    const tableData: TableData = {
      headers,
      rows: dataRows,
      caption: caption || 'Extracted Data Table',
      rowCount: dataRows.length,
      colCount: headers.length,
      isMergedCrossPage: false,
    };

    return {
      id: `table_p${pageNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'table',
      page: pageNumber,
      bbox,
      confidence: 0.94,
      readingOrder: 0,
      tableData,
      text: this.tableToMarkdown(tableData),
    };
  }

  /**
   * Merges cross-page tables if consecutive tables on page N and N+1 have matching schema
   */
  public mergeCrossPageTables(blocks: DocumentBlock[]): { blocks: DocumentBlock[]; mergedCount: number } {
    let mergedCount = 0;
    const result: DocumentBlock[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];

      if (current.type === 'table' && current.tableData && i + 1 < blocks.length) {
        const next = blocks[i + 1];

        // Check if next table is on following page and matches column count
        const isNextPage = next.page === current.page + 1;
        const isTable = next.type === 'table' && Boolean(next.tableData);

        if (isNextPage && isTable && next.tableData) {
          const currentCols = current.tableData.colCount;
          const nextCols = next.tableData.colCount;

          // Check if columns match or next table is continuation
          const headersMatch =
            JSON.stringify(current.tableData.headers) === JSON.stringify(next.tableData.headers);
          const colCountMatch = Math.abs(currentCols - nextCols) <= 1;

          if (headersMatch || colCountMatch) {
            // Merge rows
            const rowsToAdd = headersMatch
              ? next.tableData.rows
              : [next.tableData.headers, ...next.tableData.rows];

            const mergedTableData: TableData = {
              headers: current.tableData.headers,
              rows: [...current.tableData.rows, ...rowsToAdd],
              caption: `${current.tableData.caption || 'Table'} (Consolidated Pages ${current.page}–${next.page})`,
              rowCount: current.tableData.rows.length + rowsToAdd.length,
              colCount: current.tableData.colCount,
              isMergedCrossPage: true,
              continuationPage: next.page,
              notes: `Continuity verified across page boundary (p.${current.page} -> p.${next.page})`,
            };

            const mergedBlock: DocumentBlock = {
              ...current,
              tableData: mergedTableData,
              text: this.tableToMarkdown(mergedTableData),
              confidence: Number(Math.min(current.confidence, next.confidence).toFixed(2)),
              sourceContext: {
                ...current.sourceContext,
                rawSnippet: `Merged from Page ${current.page} (rows: ${current.tableData.rows.length}) and Page ${next.page} (rows: ${rowsToAdd.length})`,
              },
            };

            result.push(mergedBlock);
            mergedCount++;
            i++; // Skip next block since it has been merged
            continue;
          }
        }
      }

      result.push(current);
    }

    return { blocks: result, mergedCount };
  }

  /**
   * Helper to format table data to markdown
   */
  public tableToMarkdown(table: TableData): string {
    if (!table.headers || table.headers.length === 0) return '';
    const headerRow = `| ${table.headers.join(' | ')} |`;
    const separator = `| ${table.headers.map(() => '---').join(' | ')} |`;
    const rows = table.rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    return `${headerRow}\n${separator}\n${rows}`;
  }
}

export const tableParser = new TableParser();
