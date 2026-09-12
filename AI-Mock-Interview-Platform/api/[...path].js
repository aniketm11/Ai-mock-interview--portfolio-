import app from '../backend/app.js';

export default function handler(req, res) {
  // Vercel mounts this catch-all function at /api and may strip that prefix
  // before invoking Express. The application routes intentionally include /api.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
