import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import env from '../config/env.js';
import pool from '../database/mariadb.js';
import { register, login } from '../services/auth-service.js';
import { authenticate, errorHandler } from '../middleware/security.js';
import { parseResume } from '../utils/resume-parser.js';
import { startInterview, submitAnswer, logIntegrity } from '../services/interview-service.js';
import { interviews } from '../models/repositories.js';
import { writeReport } from '../services/report-service.js';

const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

const credentials = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(10).max(200)
});
const profile = z.object({
  role: z.string().trim().min(2).max(100),
  level: z.enum(['junior', 'mid', 'senior']),
  skills: z.string().trim().max(600),
  jobDescription: z.string().trim().max(12000)
});
const answer = z.object({
  position: z.number().int().min(0).max(5),
  transcript: z.string().trim().min(3).max(10000),
  voiceMetrics: z.object({
    pace: z.number().min(0).max(300),
    fillerCount: z.number().min(0),
    silenceSeconds: z.number().min(0),
    hesitationCount: z.number().min(0),
    confidence: z.number().min(0).max(100),
    fluency: z.number().min(0).max(100)
  })
});
const integrity = z.object({
  type: z.string().trim().min(2).max(64),
  metadata: z.record(z.unknown()).optional()
});

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api', apiLimiter);

const session = (res, token) => res
  .cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  })
  .json({ ok: true });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-mock-interview-platform', runtime: process.version });
});

app.get('/api/health/db', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1 AS ok');
    const tables = await pool.query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users','interviews','questions','answers','integrity_events')");
    const tableCount = Number(tables[0]?.count || 0);
    if (tableCount !== 5) throw Object.assign(new Error('Database schema is incomplete'), { status: 503 });
    res.json({ ok: true, database: 'connected', schema: 'ready' });
  } catch (error) {
    next(Object.assign(new Error('Database is not ready'), { status: 503, cause: error }));
  }
});

app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const body = credentials.parse(req.body);
    session(res, await register(body.email, body.password));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const body = credentials.parse(req.body);
    session(res, await login(body.email, body.password));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', (_req, res) => res.clearCookie('token', { path: '/' }).sendStatus(204));

app.post('/api/interviews', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    const body = profile.parse(req.body);
    const resume = req.file ? await parseResume(req.file) : null;
    res.status(201).json(await startInterview(req.user.sub, { ...body, resume }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/interviews', authenticate, async (req, res, next) => {
  try {
    res.json(await interviews.list(req.user.sub));
  } catch (error) {
    next(error);
  }
});

app.post('/api/interviews/:id/answers', authenticate, async (req, res, next) => {
  try {
    const interview = await interviews.owned(req.params.id, req.user.sub);
    if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 });
    const body = answer.parse(req.body);
    res.json(await submitAnswer(interview, body.position, body.transcript, body.voiceMetrics));
  } catch (error) {
    next(error);
  }
});

app.post('/api/interviews/:id/integrity-events', authenticate, async (req, res, next) => {
  try {
    const interview = await interviews.owned(req.params.id, req.user.sub);
    if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 });
    res.status(201).json({ severity: await logIntegrity(interview.id, integrity.parse(req.body)) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/interviews/:id/report.pdf', authenticate, async (req, res, next) => {
  try {
    const interview = await interviews.owned(req.params.id, req.user.sub);
    if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 });
    await writeReport(res, interview);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(publicRoot));
app.use('/frontend', express.static(path.join(publicRoot, 'frontend')));
app.use('/api/frontend', express.static(path.join(publicRoot, 'frontend')));
app.get('*', (_req, res) => res.sendFile(path.join(publicRoot, 'index.html')));
app.use(errorHandler);

export default app;
