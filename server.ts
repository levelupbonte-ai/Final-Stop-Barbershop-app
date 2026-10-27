import express from 'express';
import fs from 'fs';
import path from 'path';
import sendEmailHandler from './api/send-email.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.disable('x-powered-by');

  // Parse small JSON request bodies only (the API takes { kind, ticketCode }).
  app.use(express.json({ limit: '2kb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Resend email dispatch endpoint
  app.all('/api/send-email', (req, res) => {
    return sendEmailHandler(req, res);
  });

  const distPath = path.join(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || (fs.existsSync( path.join(distPath, 'index.html')) && process.env.PORT !== undefined && process.env.PORT !== '3000');

  // Vite middleware for development or static serving for production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
