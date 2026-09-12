# AI Mock Interview Platform

A full-stack AI-powered mock interview platform designed to simulate a real technical interview with secure authentication, resume parsing, AI-generated questions, voice answers, interview integrity monitoring, scoring, and downloadable PDF reports.

## Features

- Secure email/password authentication with JWT cookies
- AI-generated interview questions based on role, level, skills, job description, and resume
- Voice-first interview experience using browser speech recognition
- Optional camera and microphone monitoring during interviews
- Interview integrity event tracking
- AI evaluation for technical quality, communication, confidence, and grammar
- Interview history and score tracking
- Professional PDF interview reports
- MariaDB persistence
- Security middleware with Helmet, CORS, rate limiting, validation, and password hashing

## Architecture

```text
Browser
  |
  v
Express API + Static Frontend
  |
  +--> Authentication / JWT
  +--> Interview Service
  +--> OpenAI Interview Engine
  +--> Resume Parser
  +--> Integrity Monitoring
  +--> MariaDB
  +--> PDF Report Generator
```

## Project Structure

```text
AI-Mock-Interview-Platform/
├── ai/                 # AI interview/question/evaluation engine
├── backend/            # Express server and API routes
├── config/             # Environment configuration
├── database/           # MariaDB connection and schema
├── docs/               # Architecture and setup documentation
├── frontend/           # Browser application and interview monitoring
├── middleware/         # Authentication and security middleware
├── models/             # Database repositories
├── public/              # Main HTML entry point
├── services/            # Authentication, interview and report services
├── utils/               # Resume parsing utilities
├── .env.example
└── package.json
```

## Requirements

- Node.js 20+
- npm 10+
- MariaDB 10.6+ or MySQL-compatible server
- OpenAI API key
- Modern Chromium-based browser for speech recognition and media features

## Local Setup

```bash
cd AI-Mock-Interview-Platform
npm install
cp .env.example .env
```

Create the database and application user, then run `database/schema.sql` against the selected database.

Fill `.env` with real local values. Never commit `.env` or API credentials.

Start in development mode:

```bash
npm run dev
```

Open `http://localhost:3000`.

For a production-style start:

```bash
npm run check
npm start
```

## Environment Variables

See `.env.example` for all required variables:

- `PORT`
- `APP_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `JWT_SECRET`
- `MARIADB_HOST`
- `MARIADB_PORT`
- `MARIADB_DATABASE`
- `MARIADB_USER`
- `MARIADB_PASSWORD`

## Security Notes

The project intentionally keeps secrets in environment variables. The Git ignore rules exclude `.env`, logs, dependency folders, coverage output, local databases, and macOS metadata.

For production, use HTTPS, a strong randomly generated JWT secret, restricted CORS origin, secure cookies, managed database credentials, and server-side secret management.

## Validation

Run the repository's syntax check before deployment:

```bash
npm run check
```

## Disclaimer

This project is an educational and portfolio application. AI interview scores are guidance rather than a substitute for professional hiring decisions.
