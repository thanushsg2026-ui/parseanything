/**
 * Utility functions for safely executing HTTP requests and parsing responses
 * without throwing "Unexpected token ... is not valid JSON" errors when servers
 * return plain text, HTML 404/500 pages, or proxy errors.
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Safely parses any Fetch Response as JSON, gracefully handling non-JSON responses.
 */
export async function safeParseResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch (err: any) {
    console.error('[Network Error]: Could not read response stream:', err);
    return {
      success: false,
      error: 'Network error',
      details: `Could not read response body (${res.status} ${res.statusText})`,
    };
  }

  // Attempt to parse text as JSON
  try {
    const parsed = JSON.parse(rawText);
    return parsed;
  } catch (_jsonErr) {
    console.error(`[Non-JSON Server Response] HTTP ${res.status}:`, rawText.substring(0, 300));
    
    // Clean HTML / proxy errors
    let cleaned = rawText.replace(/<[^>]*>?/gm, '').trim();
    if (!cleaned || cleaned.length > 150 || cleaned.startsWith('<!DOCTYPE') || cleaned.toLowerCase().includes('the page c')) {
      cleaned = `Server returned HTTP ${res.status} (${res.statusText || 'Error'})`;
    }

    return {
      success: false,
      error: res.ok ? 'Invalid response format' : `Server error (${res.status})`,
      details: cleaned,
      _rawText: rawText,
    };
  }
}

/**
 * Perform a safe fetch that guarantees valid JSON output or structured error
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: ApiResponse<T> }> {
  try {
    const res = await fetch(url, options);
    const data = await safeParseResponse<T>(res);
    return {
      ok: res.ok && data.success !== false,
      status: res.status,
      data,
    };
  } catch (netErr: any) {
    console.error('[Fetch Exception]:', netErr);
    return {
      ok: false,
      status: 0,
      data: {
        success: false,
        error: 'Connection error',
        details: netErr?.message || 'Unable to connect to the server.',
      },
    };
  }
}
