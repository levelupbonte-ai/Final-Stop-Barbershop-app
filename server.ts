import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import sendEmailHandler from './api/send-email';

async function startServer() {
  const app = express();
  const PORT = 3000;
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

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
