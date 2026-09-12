import app from '../backend/app.js';

export default function handler(req, res) {
  // Keep Express routes compatible with Vercel's /api function mounting.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
