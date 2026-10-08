import { GoogleGenAI } from '@google/genai';
import { ChartDataPoint } from '../types.js';

interface ChartExtractionResult {
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'diagram' | 'unknown';
  caption: string;
  data: ChartDataPoint[];
  summary: string;
  confidence: number;
}

interface EquationExtractionResult {
  latex: string;
  explanation: string;
  variables: { symbol: string; meaning: string }[];
  confidence: number;
}

interface AmbiguousLayoutResult {
  blockType: 'heading' | 'paragraph' | 'table' | 'footnote' | 'caption';
  cleanedText: string;
  confidence: number;
  notes?: string;
}

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        this.isAvailable = true;
      } catch (err) {
        console.warn('Gemini client initialization failed:', err);
        this.ai = null;
        this.isAvailable = false;
      }
    } else {
      this.isAvailable = false;
    }
  }

  public getStatus(): { available: boolean; model: string; keyConfigured: boolean } {
    return {
      available: this.isAvailable,
      model: 'gemini-3.8-flash',
      keyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    };
  }

  /**
   * Extract structured tabular data from a chart or diagram
   */
  public async extractChartData(
    descriptionOrText: string,
    imageSnippetBase64?: string
  ): Promise<{ success: boolean; result?: ChartExtractionResult; fallbackUsed: boolean; error?: string }> {
    if (!this.isAvailable || !this.ai) {
      return {
        success: false,
        fallbackUsed: true,
        error: 'Gemini API key not configured or service unavailable',
      };
    }

    try {
      const prompt = `You are a precision enterprise document intelligence engine.
Analyze this financial / technical chart or figure context:
"${descriptionOrText}"

Task:
Extract the underlying chart data as strict JSON without markdown formatting.
Schema:
{
  "chartType": "bar" | "line" | "pie" | "scatter" | "diagram",
  "caption": "Short descriptive title",
  "summary": "Key insight from the visualization",
  "confidence": 0.95,
  "data": [
    {"label": "Category or X-axis value", "value": 12.4, "category": "optional series"}
  ]
}
If precise values cannot be confidently extracted, assign a lower confidence (<0.7) and do not invent arbitrary numbers.`;

      let contents: any = prompt;
      if (imageSnippetBase64) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: imageSnippetBase64,
              },
            },
            { text: prompt },
          ],
        };
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text) as ChartExtractionResult;
      return {
        success: true,
        result: parsed,
        fallbackUsed: false,
      };
    } catch (err: any) {
      console.error('Gemini chart extraction error:', err?.message || err);
      return {
        success: false,
        fallbackUsed: true,
        error: err?.message || 'Gemini chart analysis failed',
      };
    }
  }

  /**
   * Convert messy math equation or formula text into valid LaTeX
   */
  public async transcribeEquationToLatex(
    rawEquationText: string
  ): Promise<{ success: boolean; result?: EquationExtractionResult; fallbackUsed: boolean; error?: string }> {
    if (!this.isAvailable || !this.ai) {
      return {
        success: false,
        fallbackUsed: true,
        error: 'Gemini API not configured',
      };
    }

    try {
      const prompt = `You are an expert mathematical document layout extractor.
Transcribe this detected mathematical formula into accurate, pristine KaTeX-compatible LaTeX:
"${rawEquationText}"

Output JSON format:
{
  "latex": "\\\\frac{Net\\\\ Income - Preferred\\\\ Dividends}{Weighted\\\\ Average\\\\ Common\\\\ Shares}",
  "explanation": "Formula for Basic Earnings Per Share (EPS)",
  "variables": [
    {"symbol": "EPS", "meaning": "Earnings Per Share"}
  ],
  "confidence": 0.96
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text) as EquationExtractionResult;
      return {
        success: true,
        result: parsed,
        fallbackUsed: false,
      };
    } catch (err: any) {
      console.error('Gemini equation extraction error:', err?.message || err);
      return {
        success: false,
        fallbackUsed: true,
        error: err?.message,
      };
    }
  }

  /**
   * Disambiguate noisy OCR or unclear layout block
   */
  public async enrichAmbiguousRegion(
    rawText: string,
    surroundingContext?: string
  ): Promise<{ success: boolean; result?: AmbiguousLayoutResult; fallbackUsed: boolean }> {
    if (!this.isAvailable || !this.ai) {
      return { success: false, fallbackUsed: true };
    }

    try {
      const prompt = `A document OCR step produced this noisy or ambiguous text snippet:
"${rawText}"
Context: "${surroundingContext || 'Business contract / report'}"

Classify the correct structural block type and restore corrupted characters (e.g. OCR artifacts).
Output JSON:
{
  "blockType": "heading" | "paragraph" | "table" | "footnote" | "caption",
  "cleanedText": "Clean, human-readable text",
  "confidence": 0.92,
  "notes": "Corrected scanning artifact on signature block"
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text) as AmbiguousLayoutResult;
      return {
        success: true,
        result: parsed,
        fallbackUsed: false,
      };
    } catch (err) {
      return { success: false, fallbackUsed: true };
    }
  }
}

export const geminiService = new GeminiService();
