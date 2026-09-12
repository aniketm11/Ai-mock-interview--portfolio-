# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

### Register
`POST /auth/register`

```json
{"email":"user@example.com","password":"strong-password"}
```

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
- `resume`: optional PDF/TXT file

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

### Record integrity event
`POST /interviews/:id/integrity-events`

### Download report
`GET /interviews/:id/report.pdf`

All interview endpoints require authentication and verify that the requested interview belongs to the authenticated user.
