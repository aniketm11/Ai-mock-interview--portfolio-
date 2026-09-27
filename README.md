# AI Mock Interview

A **static, browser-only AI Mock Interview practice website** built with HTML, CSS and JavaScript.

## What this version does

- Role and difficulty based interview question bank
- Cloud/AWS, DevOps, Software Engineering, Data/AI and HR practice
- Text answers with word counting and timer
- Browser Speech Recognition when supported
- Optional camera + microphone practice
- Local practice scoring for relevance, structure, detail, clarity and completeness
- Local interview history using `localStorage`
- Responsive UI for desktop and mobile

## Important

This is intentionally a **static project**. It does not require Node.js, npm, Express, an OpenAI API key, MariaDB/MySQL, Vercel, API routes or a backend server.

The scoring engine is a local practice heuristic, not a real OpenAI evaluation service.

## Run locally

### Option 1 — VS Code Live Server

1. Clone the repository.
2. Open the repository folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html`.
5. Select **Open with Live Server**.
6. Open the local address shown by VS Code.

### Option 2 — Python local server

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

Camera/microphone access works best through `localhost` or Live Server rather than opening the HTML file directly with `file://`.

## Project structure

```text
Ai-mock-interview--portfolio-
├── index.html
├── app.js
├── css/
│   └── style.css
└── README.md
```

## Privacy

Answers and session history stay in the browser's local storage. Camera and microphone streams are requested only when you enable them and are not uploaded by this static application.

## Limitations

Because this is a static website, it does not provide server-side OpenAI evaluation, authentication, database persistence or PDF generation. Those backend features were intentionally removed to keep the project simple and locally runnable.
