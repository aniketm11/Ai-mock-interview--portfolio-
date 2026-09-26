# AI Mock Interview + AI Cloud Portfolio

A modern AI/Cloud portfolio for Aniket Mulik with an OpenAI-powered mock interview application.

## Portfolio

The repository root now contains a simple multi-page portfolio:

```text
index.html
about.html
projects.html
skills.html
contact.html
css/style.css
js/script.js
images/
assets/
```

Open `index.html` directly to preview the portfolio without Node.js. The portfolio pages do not require a database or API key.

## AI Mock Interview

The working interview application remains under `AI-Mock-Interview-Platform/` because OpenAI API calls, authentication, database persistence and secure server-side processing require a backend.

### Interview setup

Each candidate can enter their own:

- Full name
- Email
- Phone (optional)
- LinkedIn (optional)
- Location (optional)
- Resume (optional)
- Target role
- Skills
- Job description
- Level: Beginner / Intermediate / Advanced / Expert

### Live interview analysis

The application can use the browser camera and microphone during the interview without saving the video recording.

It tracks observable signals including:

- Speech-to-text transcript
- Word count
- Speaking pace
- Filler words
- Hesitation signals
- Face presence
- Multiple-face events
- Approximate gaze/attention signal
- Looking-away events
- Camera and microphone status
- Browser vision expression signals

The browser vision layer uses MediaPipe Face Landmarker when available and falls back to the browser FaceDetector where supported. Video is analyzed in memory and is not uploaded as a recording.

> Vision results are approximate observable signals. They are not measurements of emotion, honesty, competence, or hiring suitability.

### AI evaluation

OpenAI generates role-specific questions and evaluates spoken answers. Reports include:

- Overall score
- Technical score
- Communication score
- Grammar score
- Vocabulary
- Confidence
- Word count
- Speaking pace
- Filler words
- Hesitations
- Face presence
- Gaze attention estimate
- Looking-away events
- Multiple-face events
- Strengths
- Weaknesses
- Improvement suggestions
- Follow-up question

## Run the interview application

Requirements:

- Node.js 24.x
- npm 10+
- MariaDB/MySQL-compatible database
- OpenAI API key
- Chrome or Edge recommended for browser media and speech features

```bash
git clone https://github.com/aniketm11/Ai-mock-interview--portfolio-.git
cd Ai-mock-interview--portfolio-/AI-Mock-Interview-Platform
npm install
cp .env.example .env
```

Configure `.env`, create the `ai_interview` database, execute `database/schema.sql`, then:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Security

Never commit `.env`, OpenAI keys or database passwords. HTTPS is recommended/required by browsers for camera and microphone access on deployed domains.

## Author

**Aniket Mulik**  
AI & Cloud Engineering Portfolio

GitHub: https://github.com/aniketm11
