import { DocumentBlock } from '../types.js';

export class ReadingOrderEngine {
  /**
   * Sorts and establishes natural reading order across pages, multi-column layouts,
   * sidebars, and footnotes without naive single-axis Y-sorting.
   */
  public reconstructReadingOrder(blocks: DocumentBlock[], stripRunningHeaders: boolean = false): DocumentBlock[] {
    // Group blocks by page
    const pageMap = new Map<number, DocumentBlock[]>();
    for (const block of blocks) {
      const pageBlocks = pageMap.get(block.page) || [];
      pageBlocks.push(block);
      pageMap.set(block.page, pageBlocks);
    }

    const orderedBlocks: DocumentBlock[] = [];
    const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);

    let globalOrder = 1;

    for (const pageNum of sortedPages) {
      const pageBlocks = pageMap.get(pageNum)!;
      const sortedPageBlocks = this.orderPageBlocks(pageBlocks, stripRunningHeaders);

      for (const block of sortedPageBlocks) {
        block.readingOrder = globalOrder++;
        orderedBlocks.push(block);
      }
    }

    return orderedBlocks;
  }

  private orderPageBlocks(blocks: DocumentBlock[], stripRunningHeaders: boolean): DocumentBlock[] {
    // Separate headers, footers, footnotes, and main body
    const headers: DocumentBlock[] = [];
    const footers: DocumentBlock[] = [];
    const footnotes: DocumentBlock[] = [];
    const body: DocumentBlock[] = [];

    for (const b of blocks) {
      const [x1, y1, x2, y2] = b.bbox;
      if (b.type === 'header' || y1 < 90) {
        headers.push(b);
      } else if (b.type === 'footer' || y2 > 920) {
        footers.push(b);
      } else if (b.type === 'footnote' || (y1 > 840 && b.text?.toLowerCase().includes('*'))) {
        footnotes.push(b);
      } else {
        body.push(b);
      }
    }

    // Determine if page has multi-column layout
    // Check if blocks bifurcate into distinct X partitions (e.g., column 1 and column 2)
    const midX = 500;
    const leftCol: DocumentBlock[] = [];
    const rightCol: DocumentBlock[] = [];
    const fullSpan: DocumentBlock[] = [];

    for (const b of body) {
      const [x1, _, x2] = b.bbox;
      const width = x2 - x1;

      if (width > 600 || (x1 < 350 && x2 > 650)) {
        // Spanning title, full-width table or banner
        fullSpan.push(b);
      } else if (x2 <= midX + 30) {
        leftCol.push(b);
      } else if (x1 >= midX - 30) {
        rightCol.push(b);
      } else {
        fullSpan.push(b);
      }
    }

    const isTwoColumn = leftCol.length >= 2 && rightCol.length >= 2;

    const orderedBody: DocumentBlock[] = [];

    if (isTwoColumn) {
      // Sort full spans, left col, right col with vertical bands
      // Group by vertical bands between full spans
      const allSpansSorted = [...fullSpan].sort((a, b) => a.bbox[1] - b.bbox[1]);

      let currentY = 0;
      for (const span of allSpansSorted) {
        const spanY = span.bbox[1];

        // Process left col items above this span
        const leftItems = leftCol
          .filter(b => b.bbox[1] >= currentY && b.bbox[1] < spanY)
          .sort((a, b) => a.bbox[1] - b.bbox[1]);
        orderedBody.push(...leftItems);

        // Process right col items above this span
        const rightItems = rightCol
          .filter(b => b.bbox[1] >= currentY && b.bbox[1] < spanY)
          .sort((a, b) => a.bbox[1] - b.bbox[1]);
        orderedBody.push(...rightItems);

        orderedBody.push(span);
        currentY = span.bbox[3];
      }

      // Remaining items below last span
      const remainingLeft = leftCol
        .filter(b => b.bbox[1] >= currentY)
        .sort((a, b) => a.bbox[1] - b.bbox[1]);
      orderedBody.push(...remainingLeft);

      const remainingRight = rightCol
        .filter(b => b.bbox[1] >= currentY)
        .sort((a, b) => a.bbox[1] - b.bbox[1]);
      orderedBody.push(...remainingRight);
    } else {
      // Single column layout: sort top to bottom, with slight bias for X left-to-right on similar Y
      orderedBody.push(
        ...body.sort((a, b) => {
          const yDiff = a.bbox[1] - b.bbox[1];
          if (Math.abs(yDiff) < 15) {
            return a.bbox[0] - b.bbox[0]; // same line, sort left to right
          }
          return yDiff;
        })
      );
    }

    // Footnotes go after main body, before footer
    const sortedFootnotes = footnotes.sort((a, b) => a.bbox[1] - b.bbox[1]);
    const sortedFooters = footers.sort((a, b) => a.bbox[1] - b.bbox[1]);
    const sortedHeaders = headers.sort((a, b) => a.bbox[1] - b.bbox[1]);

    const result: DocumentBlock[] = [];
    if (!stripRunningHeaders) {
      result.push(...sortedHeaders);
    }
    result.push(...orderedBody);
    result.push(...sortedFootnotes);
    if (!stripRunningHeaders) {
      result.push(...sortedFooters);
    }

    return result;
  }
}

export const readingOrderEngine = new ReadingOrderEngine();
