# AI Mock Interview Platform

A full-stack AI Mock Interview project for realistic interview practice. It is **not a personal portfolio**.

## What the project does

- AI-generated role-specific interview questions
- Beginner / Intermediate / Advanced / Expert levels
- Candidate setup: name, email, optional phone, LinkedIn, location and resume
- Target role, skills and job-description context
- Browser speech-to-text for spoken answers
- Word count, speaking pace, filler words and hesitation signals
- Camera + microphone during the session
- Browser vision signals: face presence, multiple faces, approximate gaze attention, looking-away events and selected visible expression signals
- Video is analyzed during the session and is **not saved as an interview recording**
- OpenAI answer evaluation
- Technical, HR, communication, grammar, vocabulary, confidence, relevance, completeness, depth and problem-solving scores
- Strengths, weaknesses, suggestions and adaptive follow-up questions
- Interview history
- Downloadable PDF report
- Authentication and MariaDB persistence

## Project structure

```text
Ai-mock-interview--portfolio-
├── index.html                         # Project overview page
├── css/
│   └── style.css                     # Overview page styles
├── images/
├── assets/
│
└── AI-Mock-Interview-Platform/
    ├── ai/                            # OpenAI question/evaluation engine
    ├── api/                           # Vercel API entrypoint
    ├── backend/                       # Express application
    ├── config/                        # Environment validation
    ├── database/                      # MariaDB schema/connection
    ├── middleware/                    # Authentication/security
    ├── models/                        # Database repositories
    ├── public/
    │   ├── index.html                 # Actual interview application
    │   └── frontend/
    │       ├── application.js
    │       ├── media-monitor.js
    │       ├── integrity-monitor.js
    │       └── styles.css
    ├── services/                      # Interview/auth/report services
    ├── utils/                         # Resume parsing
    ├── test/
    ├── .env.example
    ├── package.json
    └── vercel.json
```

## Run the project correctly

### Requirements

- Node.js 24.x
- npm 10+
- MariaDB 10.6+ or compatible MySQL/MariaDB service
- OpenAI API key
- Chrome or Edge for camera, microphone and speech features

### 1. Clone

```bash
git clone https://github.com/aniketm11/Ai-mock-interview--portfolio-.git
cd Ai-mock-interview--portfolio-/AI-Mock-Interview-Platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Set the OpenAI and MariaDB values in `.env`. Never commit `.env`.

### 4. Create the database

Create the database configured in `.env` and run:

```text
database/schema.sql
```

### 5. Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Health checks

```text
http://localhost:3000/api/health
http://localhost:3000/api/health/db
```

## Important: Live Server vs the real application

Opening the root `index.html` with VS Code Live Server only shows the **project overview**. It does not provide the backend, OpenAI API or database.

For the actual AI interview, use the Express application with `npm run dev` and open `http://localhost:3000`.

The OpenAI key stays on the server. Do **not** put it in browser JavaScript.

## Interview analysis

The camera stream is used while the interview is running. The application does not save the interview video as a recording.

Vision values are observable estimates. They should not be interpreted as reliable measurements of a candidate's emotions, honesty, intelligence, competence or hiring suitability.

## Deployment

The backend is structured for Vercel, with an externally managed MariaDB/MySQL-compatible database. HTTPS is required for production camera/microphone access.

## Author

Project: **AI Mock Interview Platform**

Repository: https://github.com/aniketm11/Ai-mock-interview--portfolio-
