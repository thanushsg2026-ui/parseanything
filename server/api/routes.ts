import express, { Request, Response } from 'express';
import multer from 'multer';
import JSZip from 'jszip';
import { documentStore } from '../services/documentStore.js';
import { parsingPipeline } from '../services/pipeline.js';
import { geminiService } from '../services/geminiService.js';
import { detectFileType } from '../services/fileDetector.js';
import { DocumentItem } from '../types.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// GET /api/health
router.get('/health', (req: Request, res: Response) => {
  const geminiStatus = geminiService.getStatus();
  res.json({
    status: 'ok',
    version: '1.0.0',
    gemini: geminiStatus,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/settings
router.get('/settings', (req: Request, res: Response) => {
  const settings = documentStore.getSettings();
  const gemini = geminiService.getStatus();
  res.json({ settings, gemini });
});

// POST /api/settings
router.post('/settings', (req: Request, res: Response) => {
  const updated = documentStore.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// GET /api/documents
router.get('/documents', (req: Request, res: Response) => {
  const docs = documentStore.getAllDocuments();
  res.json({ documents: docs });
});

// POST /api/documents/upload
router.post('/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let filename = 'document.pdf';
    let buffer: Buffer | undefined;
    let size = 10240;

    if (req.file) {
      filename = req.file.originalname;
      buffer = req.file.buffer;
      size = req.file.size;
    } else if (req.body.filename) {
      filename = req.body.filename;
      size = req.body.fileSize || 10240;
    }

    const detected = detectFileType(filename, req.file?.mimetype, buffer);

    if (!detected.isSupported) {
      return res.status(400).json({
        status: 'error',
        error_type: 'unsupported_format',
        message: `The format .${detected.format} is not supported. Supported formats include PDF, DOCX, XLSX, PPTX, CSV, JPG, PNG, TIFF, HEIC, HTML, EML, etc.`,
        filename,
      });
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDoc: DocumentItem = {
      id: docId,
      filename,
      originalName: filename,
      format: detected.format,
      fileSize: size,
      uploadedAt: new Date().toISOString(),
      status: 'queued',
      pages: detected.estimatedPages,
      totalBlocks: 0,
      averageConfidence: 0,
      needsReviewCount: 0,
      geminiUsed: false,
      stages: [],
    };

    documentStore.saveDocument(newDoc);

    // Process immediately through pipeline
    const fileTextContent = buffer && detected.format !== 'pdf' && !detected.isImage
      ? buffer.toString('utf-8')
      : undefined;

    const result = await parsingPipeline.processDocument(newDoc, buffer, fileTextContent);
    return res.status(201).json({
      success: true,
      document: result.document,
      resultId: result.document.id,
    });
  } catch (err: any) {
    console.error('Upload & parse error:', err);
    return res.status(500).json({
      status: 'error',
      error_type: 'processing_failure',
      message: err?.message || 'Failed to process document',
    });
  }
});

// GET /api/documents/:id
router.get('/documents/:id', (req: Request, res: Response) => {
  const doc = documentStore.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json({ document: doc });
});

// DELETE /api/documents/:id
router.get('/documents/:id/delete', (req: Request, res: Response) => {
  // Support GET delete fallback
  documentStore.deleteDocument(req.params.id);
  res.json({ success: true });
});

router.delete('/documents/:id', (req: Request, res: Response) => {
  const deleted = documentStore.deleteDocument(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json({ success: true });
});

// POST /api/documents/:id/parse or /reprocess
router.post(['/documents/:id/parse', '/documents/:id/reprocess'], async (req: Request, res: Response) => {
  const doc = documentStore.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const result = await parsingPipeline.processDocument(doc);
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Reprocessing failed' });
  }
});

// GET /api/documents/:id/result
router.get('/documents/:id/result', (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Result not found for this document' });
  }
  return res.json({ result });
});

// GET /api/documents/:id/markdown
router.get('/documents/:id/markdown', (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).send('Document not found');
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${result.document.filename}.md"`);
  return res.send(result.markdown);
});

// GET /api/documents/:id/json
router.get('/documents/:id/json', (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${result.document.filename}.json"`);
  return res.send(JSON.stringify(result, null, 2));
});

// GET /api/documents/:id/export/zip
router.get('/documents/:id/export/zip', async (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).send('Document not found');
  }

  try {
    const zip = new JSZip();
    zip.file('parsed_result.json', JSON.stringify(result, null, 2));
    zip.file('document_clean.md', result.markdown);
    zip.file('metadata.json', JSON.stringify(result.document, null, 2));

    // Add figure data or tables
    const tableBlocks = result.blocks.filter(b => b.type === 'table' && b.tableData);
    if (tableBlocks.length > 0) {
      const tablesFolder = zip.folder('tables');
      tableBlocks.forEach((tb, idx) => {
        const csvRows = [
          tb.tableData!.headers.join(','),
          ...tb.tableData!.rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        tablesFolder?.file(`table_${idx + 1}_p${tb.page}.csv`, csvRows);
      });
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${result.document.filename}_parsed.zip"`);
    return res.send(zipBuffer);
  } catch (err: any) {
    return res.status(500).send('Error generating ZIP export');
  }
});

// GET /api/documents/:id/pages/:page
router.get('/documents/:id/pages/:page', (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const pageNum = parseInt(req.params.page, 10);
  const page = result.pages.find(p => p.pageNumber === pageNum);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  return res.json({ page });
});

// POST /api/documents/:id/blocks/:blockId/gemini-enrich
router.post('/documents/:id/blocks/:blockId/gemini-enrich', async (req: Request, res: Response) => {
  const result = documentStore.getResult(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const block = result.blocks.find(b => b.id === req.params.blockId);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }

  try {
    if (block.type === 'figure') {
      const geminiRes = await geminiService.extractChartData(block.figureData?.caption || block.text || 'Financial Chart');
      if (geminiRes.success && geminiRes.result) {
        block.figureData = {
          ...block.figureData,
          chartType: geminiRes.result.chartType,
          extractedData: geminiRes.result.data,
          summary: geminiRes.result.summary,
          dataConfidence: geminiRes.result.confidence,
          isExtractedWithGemini: true,
        };
        block.confidence = geminiRes.result.confidence;
      }
    } else if (block.type === 'equation') {
      const geminiRes = await geminiService.transcribeEquationToLatex(block.sourceContext?.rawSnippet || block.text || '');
      if (geminiRes.success && geminiRes.result) {
        block.equationData = {
          latex: geminiRes.result.latex,
          displayMode: true,
          explanation: geminiRes.result.explanation,
          variables: geminiRes.result.variables,
        };
        block.confidence = geminiRes.result.confidence;
      }
    } else {
      const geminiRes = await geminiService.enrichAmbiguousRegion(block.text || '', 'Business document');
      if (geminiRes.success && geminiRes.result) {
        block.text = geminiRes.result.cleanedText;
        block.confidence = geminiRes.result.confidence;
        block.needsReview = false;
        block.sourceContext = {
          ...block.sourceContext,
          geminiEnriched: true,
        };
      }
    }

    documentStore.saveResult(result);
    return res.json({ success: true, updatedBlock: block });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Enrichment failed' });
  }
});

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  category: string;
  documentId?: string;
  subject: string;
  message: string;
  attachDiagnostics: boolean;
  createdAt: string;
  status: 'received' | 'investigating' | 'resolved';
}

const supportTickets: SupportTicket[] = [];

// POST /api/support/ticket
router.post('/support/ticket', (req: Request, res: Response) => {
  const { name, email, category, documentId, subject, message, attachDiagnostics } = req.body;
  if (!name || !email || !category || !message) {
    return res.status(400).json({ error: 'Please provide all required fields (name, email, category, message).' });
  }

  const ticketId = `PA-TICK-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket: SupportTicket = {
    id: ticketId,
    name,
    email,
    category,
    documentId: documentId || undefined,
    subject: subject || `${category} Inquiry`,
    message,
    attachDiagnostics: Boolean(attachDiagnostics),
    createdAt: new Date().toISOString(),
    status: 'received',
  };

  supportTickets.push(ticket);
  return res.status(201).json({
    success: true,
    ticketId,
    message: 'Your support ticket has been submitted to ParseAnything engineering. Our team typically replies within 2-4 hours.',
    ticket,
  });
});

// GET /api/support/diagnostics
router.get('/support/diagnostics', (req: Request, res: Response) => {
  const gemini = geminiService.getStatus();
  res.json({
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    geminiOnline: gemini.available,
    geminiModel: gemini.model,
    documentsCount: documentStore.getAllDocuments().length,
    parserSettings: documentStore.getSettings(),
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    platform: process.platform,
    supportedFormatsCount: 20,
  });
});

export default router;
