import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Request logging middleware for API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/documents') || req.originalUrl.startsWith('/upload')) {
      console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Mount API endpoints under both /api and root aliases
  app.use('/api', apiRouter);
  app.use('/documents', apiRouter);

  // Catch-all 404 for unhandled API and data mutation routes - NEVER return HTML
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isApi = req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/documents') ||
      req.originalUrl.startsWith('/upload') ||
      req.headers['accept']?.includes('application/json') ||
      req.headers['content-type']?.includes('multipart/form-data') ||
      req.headers['content-type']?.includes('application/json');

    if (isApi || (req.method !== 'GET' && req.method !== 'HEAD')) {
      console.warn(`[incorrect API route] 404 Not Found: ${req.method} ${req.originalUrl}`);
      return res.status(404).setHeader('Content-Type', 'application/json').json({
        success: false,
        error: 'incorrect API route',
        details: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
      });
    }
    next();
  });

  // Global error handler for API and upload requests - NEVER return HTML
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[API Internal Error] on ${req.method} ${req.originalUrl}:`, err);
    res.status(err.status || 500).setHeader('Content-Type', 'application/json').json({
      success: false,
      error: err.message || 'Document processing failed',
      details: err.stack || String(err),
    });
  });

  if (isProduction) {
    // Serve static production build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In dev mode, mount Vite dev server middlewares ONLY for non-API requests
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    const keyConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    console.log(`[ParseAnything] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[ParseAnything] Gemini API key configured: ${keyConfigured ? 'YES' : 'NO (fallback mode ready)'}`);
  });
}

startServer().catch((err) => {
  console.error('[ParseAnything] Server initialization failure:', err);
  process.exit(1);
});
