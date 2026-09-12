# AI Mock Interview Platform

A full-stack AI-powered mock interview platform for role-specific interview practice, voice answers, adaptive AI evaluation, integrity signals, interview history and professional PDF reports.

## Stack

- Frontend: semantic HTML, CSS, browser speech/media APIs
- Backend: Node.js 24 + Express
- AI: OpenAI Responses API
- Database: MariaDB
- Auth: bcrypt + JWT HTTP-only cookies
- Deployment: Vercel serverless Node.js function

## Features

- Secure registration/login
- AI-generated six-question interviews based on role, level, skills, job description and resume
- Voice-first interview experience
- Camera/microphone status monitoring
- Interview integrity event tracking
- Technical, communication, confidence and grammar scoring
- Interview history
- Downloadable PDF report
- Responsive premium blue/white SaaS frontend
- Production Vercel entrypoint with `/api/health`

## Architecture

```text
Browser
  |
  +--> Vercel static frontend
  |
  +--> /api/* -> Express serverless function
                    |
                    +--> OpenAI
                    +--> MariaDB
                    +--> PDF generation
```

## Project Structure

```text
AI-Mock-Interview-Platform/
├── ai/                 # OpenAI question/evaluation engine
├── api/                # Vercel serverless entrypoint
├── backend/            # Express app + local server
├── config/             # Environment validation
├── database/           # MariaDB connection and schema
├── docs/               # API documentation
├── frontend/           # CSS and browser application
├── middleware/         # Authentication/security
├── models/             # Database repositories
├── public/             # Landing page
├── services/           # Auth/interview/report services
├── utils/              # Resume parser
├── vercel.json         # Vercel runtime configuration
├── .env.example
└── package.json
```

## Requirements

- Node.js 24.x
- npm 10+
- MariaDB 10.6+ or a compatible managed MariaDB/MySQL service
- OpenAI API key
- Chrome or Edge for speech recognition and media features

## Local Setup

```bash
cd AI-Mock-Interview-Platform
npm install
cp .env.example .env
```

Create the database and application user, then run `database/schema.sql`.

Set the values in `.env`, then:

```bash
npm run check
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

This repository is prepared to deploy with the **`AI-Mock-Interview-Platform` directory as the Vercel Root Directory**.

### 1. Import GitHub repository

In Vercel:

1. Add New Project.
2. Import `aniketm11/Ai-mock-interview--portfolio-`.
3. Set **Root Directory** to:

```text
AI-Mock-Interview-Platform
```

4. Keep the detected Node/Express configuration.
5. Add the environment variables below before deploying.

### 2. Add Vercel environment variables

Under **Project Settings → Environment Variables**, add:

```text
NODE_ENV=production
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4.1
JWT_SECRET=long-random-secret-at-least-32-characters
MARIADB_HOST=your-managed-mariadb-host
MARIADB_PORT=3306
MARIADB_DATABASE=ai_interview
MARIADB_USER=ai_interview_app
MARIADB_PASSWORD=your-database-password
```

After the first deployment, you can optionally set:

```text
APP_ORIGIN=https://your-project.vercel.app
```

Same-origin browser requests work without setting `APP_ORIGIN`; set it when you use a separate frontend/API origin.

### 3. Database

Vercel does not provide the MariaDB server for this application. Use an externally managed MariaDB/MySQL-compatible database that is reachable from Vercel, then execute `database/schema.sql` once.

### 4. Verify deployment

Open:

```text
https://your-project.vercel.app/api/health
```

Expected response:

```json
{"ok":true,"service":"ai-mock-interview-platform"}
```

The API function is configured for a 120-second maximum duration to allow time for AI and database operations.

## Important production notes

- Do not commit `.env` or API keys.
- Use a strong random `JWT_SECRET`.
- Use HTTPS in production; Vercel provides HTTPS automatically.
- Browser microphone/camera permissions require a secure context.
- Resume uploads are held in memory and are limited to 4 MB.
- The PDF report is generated dynamically; no persistent local filesystem is required.
- AI interview scores are practice guidance, not hiring decisions.

## Validation

```bash
npm run check
```

The GitHub Actions workflow also validates the application with Node.js 24.

## API

See `docs/API.md` for the endpoint reference.
