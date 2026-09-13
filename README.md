# 🎯 AI Mock Interview Platform

> A production-style, AI-powered mock interview platform built to help candidates practice realistic interviews, receive structured feedback, and track improvement.

<p align="center">
  <strong>Role-specific interviews • Voice answers • AI evaluation • Integrity signals • PDF reports</strong>
</p>

## ✨ What this project does

The platform simulates a real interview workflow. A candidate can create an account, configure an interview around a target role and experience level, answer questions using voice, receive AI-generated evaluation, review interview history, and download a professional report.

### Core capabilities

| Area | Capability |
|---|---|
| 🎤 Interview | AI-generated role-specific interview questions |
| 🧠 Evaluation | Technical, communication, confidence and grammar scoring |
| 🎙️ Voice | Browser speech/media APIs for voice-first answers |
| 📹 Integrity | Camera/microphone status and interview event tracking |
| 📄 Reporting | Downloadable PDF interview reports |
| 🔐 Security | bcrypt password hashing, JWT authentication, HTTP-only cookies |
| 📚 History | Review previous interviews and performance |
| ☁️ Deployment | Vercel-ready serverless API |

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│        Candidate Browser     │
│  HTML / CSS / JS + Media API │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Vercel / Express API    │
│       /api/* + Auth          │
└───────────┬─────────┬────────┘
            │         │
            ▼         ▼
      ┌──────────┐  ┌──────────────┐
      │ OpenAI   │  │   MariaDB    │
      │ AI Engine│  │ Persistence  │
      └──────────┘  └──────────────┘
            │
            ▼
      ┌──────────────┐
      │ PDF Reports  │
      └──────────────┘
```

## 🧰 Technology Stack

**Frontend:** Semantic HTML, CSS, browser Speech/Media APIs  
**Backend:** Node.js 24, Express 4  
**AI:** OpenAI Responses API  
**Database:** MariaDB / MySQL-compatible service  
**Authentication:** bcrypt + JWT HTTP-only cookies  
**Security:** Helmet + rate limiting + validated configuration  
**Deployment:** Vercel serverless function  
**Testing:** Node.js test runner + domain benchmark checks  

## 📁 Project Structure

```text
Ai-mock-interview--portfolio-
├── AI-Mock-Interview-Platform/
│   ├── ai/                 # AI question + evaluation engine
│   ├── api/                # Vercel serverless entrypoint
│   ├── backend/            # Express application + local server
│   ├── config/             # Environment validation
│   ├── database/           # MariaDB connection + schema
│   ├── docs/               # API documentation
│   ├── frontend/           # Browser application styles/scripts
│   ├── middleware/         # Authentication + security
│   ├── models/             # Database repositories
│   ├── public/             # Public landing page
│   ├── services/           # Auth/interview/report services
│   ├── utils/              # Resume parsing utilities
│   ├── scripts/            # AI/domain benchmark scripts
│   ├── test/               # Automated tests
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
└── README.md
```

## 🚀 Run Locally

### Requirements

- Node.js 24.x
- npm 10+
- MariaDB 10.6+ or compatible managed MySQL/MariaDB service
- OpenAI API key
- Chrome or Edge for speech and media features

### Setup

```bash
git clone https://github.com/aniketm11/Ai-mock-interview--portfolio-.git
cd Ai-mock-interview--portfolio-/AI-Mock-Interview-Platform
npm install
cp .env.example .env
```

Create the database and run the schema from `database/schema.sql`, then configure `.env`.

Start the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Validate the project

```bash
npm run check
npm test
```

## ☁️ Deploy to Vercel

The application is designed for Vercel with the **`AI-Mock-Interview-Platform`** directory as the project root.

### Required environment variables

```text
NODE_ENV=production
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4.1
JWT_SECRET=your-long-random-secret
MARIADB_HOST=your-managed-db-host
MARIADB_PORT=3306
MARIADB_DATABASE=ai_interview
MARIADB_USER=ai_interview_app
MARIADB_PASSWORD=your-database-password
```

Optional:

```text
APP_ORIGIN=https://your-project.vercel.app
```

After deployment, verify the API health endpoint:

```text
https://your-project.vercel.app/api/health
```

Expected response:

```json
{"ok":true,"service":"ai-mock-interview-platform"}
```

> **Note:** Vercel hosts the application/API, but the MariaDB server must be provided by an externally managed database service that is reachable from Vercel.

## 🔐 Security & Production Notes

- Never commit `.env` files or API keys.
- Use a strong random `JWT_SECRET` in production.
- HTTPS is required for browser microphone/camera access.
- Resume uploads are limited and processed in memory.
- Reports are generated dynamically without requiring a persistent local filesystem.
- AI scores are practice guidance and should not be treated as hiring decisions.

## 📌 Why I Built It

This project combines cloud deployment, backend development, database design, authentication, AI integration, browser media APIs, automated testing, and production-oriented security into one end-to-end application.

It is intended as both a practical interview-practice tool and a portfolio project demonstrating full-stack and cloud engineering skills.

## 👨‍💻 Author

**Aniket Mulik**  
Cloud & Full-Stack Developer

GitHub: [@aniketm11](https://github.com/aniketm11)

---

⭐ If this project is useful, consider giving the repository a star.
