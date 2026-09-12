import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import multer from 'multer';
import env from '../config/env.js';

export function authenticate(req, res, next) {
  try {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = req.cookies.token || bearer;
    if (!token) throw new Error('Missing token');
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
}

export function errorHandler(error, _req, res, _next) {
  console.error({ message: error.message, stack: error.stack });

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request',
      details: error.issues.map(issue => ({ path: issue.path, message: issue.message }))
    });
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Resume must be 4 MB or smaller.'
      : 'Invalid file upload.';
    return res.status(400).json({ error: message });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  return res.status(status).json({
    error: status >= 500 ? 'Internal server error' : error.message
  });
}
