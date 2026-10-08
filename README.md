# ParseAnything — A Universal Document Parser for AI

> **ParseAnything** transforms messy business documents into accurate, structured, searchable, and citable data. It combines document parsing, OCR, layout understanding, table extraction, figure and equation recognition, and Gemini-powered visual intelligence into one unified pipeline.

---

## 🌟 Key Features

1. **Universal Input Ingestion**: Supports 20+ file formats:
   - `PDF`, `Scanned PDF`, `JPG`, `JPEG`, `PNG`, `TIFF`, `HEIC`
   - `DOC`, `DOCX`, `PPT`, `PPTX`, `XLS`, `XLSX`, `CSV`
   - `HTML`, `Markdown`, `TXT`, `RTF`, `EML`, `MSG`
2. **Deterministic Extraction + Gemini AI Vision**: Fast deterministic layout parsing (&lt;100ms) with selective Gemini 3.8 Flash visual analysis for charts, graphs, and ambiguous formulas.
3. **Cross-Page Table Merging**: Identifies continuation tables across page boundaries and automatically consolidates them into a single logical structure.
4. **Mathematical Equation Extraction**: Detects mathematical notation and transcribes formulas into KaTeX-compatible LaTeX.
5. **Chart-to-Data Extraction**: Recovers underlying data series points `[{label, value}]` from figures and charts.
6. **Column-Aware Reading Order**: Handles multi-column layouts, sidebars, headers, footers, and footnotes without naive single-axis sorting.
7. **100% Citable Provenance**: Every extracted block preserves page number, `[x1, y1, x2, y2]` normalized bounding box, and confidence score.
8. **Interactive Split-Screen Inspector**: Click parsed blocks to highlight bounding boxes on the original page, and click bounding boxes to jump to blocks.
9. **Low-Confidence Flagging**: Blocks below the user-defined threshold are flagged as "Needs Review" instead of silently guessing corrupted text.
10. **Dynamic Theme Customizer**: Preset themes (Indigo, Blue, Purple, Emerald, Cyan, Rose, Amber) + custom color picker + dark/light mode with CSS variables.
11. **Multi-Format Export**: One-click download as clean Markdown, structured JSON, CSV tables, or bundled ZIP.

---

## 🏗️ Architecture

```text
Uploaded Document
      ↓
Format Detection (Magic Bytes & MIME)
      ↓
Page Normalization & Vector Rendering
      ↓
Layout & Column Detection
      ┌───────────────┴──────────────┐
      ↓                              ↓
Digital Text Layer             Scanned / Image OCR
      └───────────────┬──────────────┘
                      ↓
           Hierarchical Block Analysis
      ┌───────────────┼──────────────┐
      ↓               ↓              ↓
    Text            Tables        Figures
      │               │              │
      │         Cross-Page Merge     │
      │               │         Chart-to-Data (Gemini)
      ↓               ↓              ↓
              Equation (LaTeX)
                      ↓
       Reading Order Reconstruction
                      ↓
         Validation & Confidence
                      ↓
   Structured JSON + Citable Markdown Output
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- npm or yarn

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Install & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup

Build and run using Docker Compose:
```bash
docker compose up --build
```
The server will be available at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Multipart file upload and automatic parsing |
| `GET` | `/api/documents` | List all documents and metrics |
| `GET` | `/api/documents/:id` | Get document item metadata |
| `DELETE`| `/api/documents/:id` | Delete document and parsed results |
| `POST` | `/api/documents/:id/reprocess` | Reprocess document with active settings |
| `GET` | `/api/documents/:id/result` | Retrieve full structured parsing result |
| `GET` | `/api/documents/:id/markdown` | Download or view reconstructed Markdown |
| `GET` | `/api/documents/:id/json` | Download or view raw JSON output |
| `GET` | `/api/documents/:id/export/zip` | Download complete export ZIP archive |
| `GET` | `/api/documents/:id/pages/:page` | Retrieve page SVG representation |
| `POST` | `/api/documents/:id/blocks/:blockId/gemini-enrich` | Re-analyze specific block with Gemini |
| `GET` | `/api/settings` | Get parser settings & Gemini status |
| `POST` | `/api/settings` | Update parser settings |
| `POST` | `/api/support/ticket` | Submit support and troubleshooting ticket |
| `GET` | `/api/support/diagnostics` | Retrieve live system environment diagnostic health report |
| `GET` | `/api/health` | Health check endpoint |

---

## 📄 Structured JSON Schema

```json
{
  "document": {
    "id": "doc_1728345_abc",
    "filename": "Q3_2025_Acme_Financial_Report.pdf",
    "format": "pdf",
    "pages": 3,
    "totalBlocks": 14,
    "averageConfidence": 0.94
  },
  "blocks": [
    {
      "id": "block_006",
      "type": "table",
      "page": 2,
      "bbox": [80, 150, 720, 480],
      "confidence": 0.96,
      "readingOrder": 6,
      "tableData": {
        "headers": ["Line Item", "Q3 2025", "Q3 2024"],
        "rows": [["Product Revenue", "$48.9M", "$35.4M"]],
        "isMergedCrossPage": true
      }
    }
  ]
}
```

---

## 🔒 Security
- **Backend-Only API Key**: The Gemini API key is securely accessed strictly on the server (`server/services/geminiService.ts`) and is never leaked or exposed to the client bundle.
- **Fail-Safe Fallbacks**: If Gemini is offline or unconfigured, the pipeline automatically falls back to deterministic extractors without interrupting user workflow.
