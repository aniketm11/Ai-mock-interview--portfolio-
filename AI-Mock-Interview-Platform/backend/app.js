import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import env from '../config/env.js';
import { register, login } from '../services/auth-service.js';
import { authenticate, errorHandler } from '../middleware/security.js';
import { parseResume } from '../utils/resume-parser.js';
import { startInterview, submitAnswer, logIntegrity } from '../services/interview-service.js';
import { interviews } from '../models/repositories.js';
import { writeReport } from '../services/report-service.js';

const app = express();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
const profile = z.object({ role: z.string().trim().min(2).max(100), level: z.enum(['junior', 'mid', 'senior']), skills: z.string().trim().max(600), jobDescription: z.string().trim().max(12000) });
const answer = z.object({ position: z.number().int().min(0), transcript: z.string().trim().min(3).max(10000), voiceMetrics: z.object({ pace: z.number().min(0).max(300), fillerCount: z.number().min(0), silenceSeconds: z.number().min(0), hesitationCount: z.number().min(0), confidence: z.number().min(0).max(100), fluency: z.number().min(0).max(100) }) });
const integrity = z.object({ type: z.string().trim().max(64), metadata: z.record(z.unknown()).optional() });
const allowedOrigin = env.APP_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${env.PORT}`);

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: (origin, callback) => !origin || origin === allowedOrigin ? callback(null, true) : callback(new Error('Origin not allowed')), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 900000, limit: 100, standardHeaders: true, legacyHeaders: false }));

const session = (res, token) => res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: 604800000, path: '/' }).json({ ok: true });

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ai-mock-interview-platform' }));
app.post('/api/auth/register', async (req, res, next) => { try { session(res, await register(req.body.email?.toLowerCase(), req.body.password)); } catch (e) { next(e); } });
app.post('/api/auth/login', async (req, res, next) => { try { session(res, await login(req.body.email?.toLowerCase(), req.body.password)); } catch (e) { next(e); } });
app.post('/api/auth/logout', (_req, res) => res.clearCookie('token', { path: '/' }).sendStatus(204));

app.post('/api/interviews', authenticate, upload.single('resume'), async (req, res, next) => { try { const body = profile.parse(req.body); const resume = req.file ? await parseResume(req.file) : null; res.status(201).json(await startInterview(req.user.sub, { ...body, resume })); } catch (e) { next(e); } });
app.get('/api/interviews', authenticate, async (req, res, next) => { try { res.json(await interviews.list(req.user.sub)); } catch (e) { next(e); } });
app.post('/api/interviews/:id/answers', authenticate, async (req, res, next) => { try { const interview = await interviews.owned(req.params.id, req.user.sub); if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 }); const body = answer.parse(req.body); res.json(await submitAnswer(interview, body.position, body.transcript, body.voiceMetrics)); } catch (e) { next(e); } });
app.post('/api/interviews/:id/integrity-events', authenticate, async (req, res, next) => { try { const interview = await interviews.owned(req.params.id, req.user.sub); if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 }); res.status(201).json({ severity: await logIntegrity(interview.id, integrity.parse(req.body)) }); } catch (e) { next(e); } });
app.get('/api/interviews/:id/report.pdf', authenticate, async (req, res, next) => { try { const interview = await interviews.owned(req.params.id, req.user.sub); if (!interview) throw Object.assign(new Error('Interview not found'), { status: 404 }); await writeReport(res, interview); } catch (e) { next(e); } });

app.use(express.static(path.join(root, 'public')));
app.use('/frontend', express.static(path.join(root, 'frontend')));
app.use('/api/frontend', express.static(path.join(root, 'frontend')));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'public', 'index.html')));
app.use(errorHandler);

export default app;
