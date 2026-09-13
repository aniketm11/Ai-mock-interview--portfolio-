# AI Mock Interview Platform

A Node.js AI mock-interview application with an Express API, OpenAI interview engine, MariaDB persistence, authentication, and a browser frontend.

## Requirements

- Node.js 24.x (the version declared in `package.json`)
- npm
- MariaDB or a compatible MySQL server
- An OpenAI API key

## 1. Open the project

Open this folder in VS Code:

```text
AI-Mock-Interview-Platform
```

In the VS Code terminal, confirm that the current directory ends with `AI-Mock-Interview-Platform`:

```bash
pwd
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Edit `.env` and set real values for:

- `OPENAI_API_KEY`
- `JWT_SECRET` (use a long random value)
- `MARIADB_HOST`
- `MARIADB_PORT`
- `MARIADB_DATABASE`
- `MARIADB_USER`
- `MARIADB_PASSWORD`
- `MARIADB_SSL_CA` when the database provider requires a CA certificate

Never commit `.env`, API keys, passwords, certificates, or private keys.

## 4. Create the database

Create the database and application user using your MariaDB provider or MariaDB client. Example:

```sql
CREATE DATABASE ai_interview;
CREATE USER 'ai_interview_app'@'%' IDENTIFIED BY 'replace-with-a-strong-password';
GRANT ALL PRIVILEGES ON ai_interview.* TO 'ai_interview_app'@'%';
FLUSH PRIVILEGES;
```

Use the actual host, username, password, and database name in `.env`.

## 5. Import the schema

From the project root, run:

```bash
mariadb --host="$MARIADB_HOST" --port="$MARIADB_PORT" --user="$MARIADB_USER" --password="$MARIADB_PASSWORD" "$MARIADB_DATABASE" < database/schema.sql
```

If your provider supplies a TLS CA certificate, configure `MARIADB_SSL_CA` in `.env` before starting the application.

## 6. Validate the project

Run these commands separately:

```bash
npm run check
npm test
```

Optional AI-domain benchmark:

```bash
npm run test:ai-benchmark
```

## 7. Start the application

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Open the local address shown by the terminal. The default port is `3000`, so normally the website is available at:

```text
http://localhost:3000
```

## Troubleshooting

- `node: command not found`: install Node.js 24.x and restart VS Code.
- `mariadb: command not found` or `mysql: command not found`: install a MariaDB/MySQL client or use your provider's SQL console.
- Database connection errors: verify host, port, database, user, password, and TLS CA settings in `.env`.
- OpenAI errors: verify `OPENAI_API_KEY` and the configured model.
- Port already in use: stop the other process using port 3000 or change `PORT` in `.env`.

## Security

The repository `.gitignore` excludes environment files, dependencies, logs, certificates, private keys, and local database files. Keep all real secrets only in your local `.env` file or your deployment provider's secret settings.
