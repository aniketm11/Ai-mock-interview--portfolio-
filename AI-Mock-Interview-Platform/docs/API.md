# API Reference

Local base URL: `http://localhost:3000/api`

Production base URL: `https://your-project.vercel.app/api`

## Health

### Application health
`GET /health`

Returns the public runtime health response. It does not require database access.

```json
{"ok":true,"service":"ai-mock-interview-platform","runtime":"v24.x"}
```

### Database readiness
`GET /health/db`

Checks the database connection and verifies that all five required tables exist. It returns `503` when the database is unavailable or the schema is incomplete.

## Authentication

### Register
`POST /auth/register`

```json
{"email":"user@example.com","password":"strong-password"}
```

Password must be 10–200 characters.

### Login
`POST /auth/login`

### Logout
`POST /auth/logout`

Authentication uses an HTTP-only JWT cookie.

## Interviews

### Create interview
`POST /interviews`

Multipart form fields:

- `role`
- `level`: `junior`, `mid`, or `senior`
- `skills`
- `jobDescription`
- `resume`: optional PDF/TXT file, maximum 4 MB

### List interview history
`GET /interviews`

### Submit answer
`POST /interviews/:id/answers`

```json
{
  "position": 0,
  "transcript": "My answer...",
  "voiceMetrics": {
    "pace": 130,
    "fillerCount": 2,
    "silenceSeconds": 0,
    "hesitationCount": 2,
    "confidence": 77,
    "fluency": 80
  }
}
```

Answers are idempotent per question. After all six questions are answered, the interview is marked complete and its overall score is stored.

### Record integrity event
`POST /interviews/:id/integrity-events`

### Download report
`GET /interviews/:id/report.pdf`

All interview endpoints require authentication and verify that the requested interview belongs to the authenticated user.
