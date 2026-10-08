import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './src/serverApp';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  console.log(`[wastech] Initializing server in ${process.env.NODE_ENV || 'development'} mode...`);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[wastech] Vite development middleware mounted successfully.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[wastech] Serving production build from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('----------------------------------------------------');
    console.log(`🚀 wastech Concierge server is running!`);
    console.log(`👉 Local:   http://localhost:${PORT}`);
    console.log(`👉 Network: http://0.0.0.0:${PORT}`);
    console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Missing ⚠️ (Local fallback mode active)'}`);
    console.log('----------------------------------------------------');
  });
}

startServer().catch((err) => {
  console.error('[wastech] Fatal server startup error:', err);
  process.exit(1);
});
