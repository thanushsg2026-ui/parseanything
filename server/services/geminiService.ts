import dotenv from 'dotenv';
dotenv.config();

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
    this.ensureClient();
  }

  private ensureClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY') {
      if (!this.ai) {
        try {
          this.ai = new GoogleGenAI({
            apiKey: apiKey.trim(),
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });
          this.isAvailable = true;
          console.log('[Gemini API key check]: Successfully initialized GoogleGenAI with backend key.');
        } catch (err: any) {
          console.error('[Gemini API failure]: Failed to initialize client:', err?.message || err);
          this.ai = null;
          this.isAvailable = false;
        }
      }
      return this.ai;
    } else {
      this.isAvailable = false;
      this.ai = null;
      console.log('[missing Gemini API key] GEMINI_API_KEY is not configured or empty. Operating in fallback mode.');
      return null;
    }
  }

  public getStatus(): { available: boolean; model: string; keyConfigured: boolean } {
    const client = this.ensureClient();
    return {
      available: Boolean(client),
      model: 'gemini-3.8-flash',
      keyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    };
  }

  /**
   * Helper to execute Gemini with a strict timeout to avoid hung upload requests
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  private cleanJsonString(str: string): string {
    return str
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  /**
   * Extract structured tabular data from a chart or diagram
   */
  public async extractChartData(
    descriptionOrText: string,
    imageSnippetBase64?: string
  ): Promise<{ success: boolean; result?: ChartExtractionResult; fallbackUsed: boolean; error?: string }> {
    const client = this.ensureClient();
    if (!client) {
      console.log('[missing Gemini API key]: GEMINI_API_KEY not configured. Using deterministic extractor.');
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

      const responsePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const response = await this.executeWithTimeout(responsePromise, 8000);
      const text = response.text || '';
      try {
        const cleaned = this.cleanJsonString(text);
        const parsed = JSON.parse(cleaned) as ChartExtractionResult;
        return {
          success: true,
          result: parsed,
          fallbackUsed: false,
        };
      } catch (parseErr: any) {
        console.error('[JSON parsing failure]: Failed to parse Gemini chart response as JSON:', parseErr?.message || parseErr);
        return {
          success: false,
          fallbackUsed: true,
          error: 'JSON parsing failure on Gemini response',
        };
      }
    } catch (err: any) {
      console.error('[Gemini API failure]: Chart analysis error:', err?.message || err);
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
    const client = this.ensureClient();
    if (!client) {
      console.log('[missing Gemini API key]: GEMINI_API_KEY not set. Using LaTeX formula template.');
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

      const responsePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const response = await this.executeWithTimeout(responsePromise, 8000);
      const text = response.text || '';
      try {
        const cleaned = this.cleanJsonString(text);
        const parsed = JSON.parse(cleaned) as EquationExtractionResult;
        return {
          success: true,
          result: parsed,
          fallbackUsed: false,
        };
      } catch (parseErr: any) {
        console.error('[JSON parsing failure]: Failed to parse Gemini equation response as JSON:', parseErr?.message || parseErr);
        return {
          success: false,
          fallbackUsed: true,
          error: 'JSON parsing failure on equation response',
        };
      }
    } catch (err: any) {
      console.error('[Gemini API failure]: Equation transcription error:', err?.message || err);
      return {
        success: false,
        fallbackUsed: true,
        error: err?.message || 'Gemini equation parsing failed',
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
    const client = this.ensureClient();
    if (!client) {
      console.log('[missing Gemini API key]: No Gemini client available for ambiguous region.');
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

      const responsePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const response = await this.executeWithTimeout(responsePromise, 8000);
      const text = response.text || '';
      try {
        const cleaned = this.cleanJsonString(text);
        const parsed = JSON.parse(cleaned) as AmbiguousLayoutResult;
        return {
          success: true,
          result: parsed,
          fallbackUsed: false,
        };
      } catch (parseErr: any) {
        console.error('[JSON parsing failure]: Failed to parse Gemini ambiguous region response:', parseErr?.message || parseErr);
        return { success: false, fallbackUsed: true };
      }
    } catch (err: any) {
      console.error('[Gemini API failure]: Ambiguous region enrichment failed:', err?.message || err);
      return { success: false, fallbackUsed: true };
    }
  }
}

export const geminiService = new GeminiService();
