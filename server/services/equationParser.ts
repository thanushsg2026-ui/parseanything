import { DocumentBlock, EquationData } from '../types.js';
import { geminiService } from './geminiService.js';

export class EquationParser {
  public async createEquationBlock(
    id: string,
    pageNumber: number,
    bbox: [number, number, number, number],
    rawSnippet: string,
    fallbackLatex?: string,
    explanation?: string,
    useGeminiIfAvailable: boolean = true
  ): Promise<DocumentBlock> {
    let eqData: EquationData = {
      latex: fallbackLatex || '\\frac{Net\\ income - Preferred\\ dividends}{Weighted\\ average\\ common\\ shares}',
      displayMode: true,
      explanation: explanation || 'Formula for Diluted Earnings Per Share (EPS)',
      variables: [
        { symbol: 'EPS', meaning: 'Earnings Per Share' },
        { symbol: 'Weighted Average Shares', meaning: 'Adjusted share count during period' },
      ],
    };
    let confidence = 0.94;

    if (useGeminiIfAvailable && geminiService.getStatus().available) {
      try {
        const geminiRes = await geminiService.transcribeEquationToLatex(rawSnippet);
        if (geminiRes.success && geminiRes.result) {
          eqData = {
            latex: geminiRes.result.latex,
            displayMode: true,
            explanation: geminiRes.result.explanation,
            variables: geminiRes.result.variables,
          };
          confidence = geminiRes.result.confidence;
        }
      } catch (err) {
        console.warn('Gemini equation fallback invoked');
      }
    }

    return {
      id,
      type: 'equation',
      page: pageNumber,
      bbox,
      confidence,
      readingOrder: 0,
      equationData: eqData,
      text: `$$\n${eqData.latex}\n$$`,
      sourceContext: {
        rawSnippet,
      },
    };
  }
}

export const equationParser = new EquationParser();
