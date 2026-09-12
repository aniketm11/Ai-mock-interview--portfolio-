import app from '../../backend/app.js';

export default function handler(req, res) {
  req.url = `/api/auth/logout${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
  return app(req, res);
}
