# Setup

1. Create a MariaDB database and application user, then run `database/schema.sql`.
2. Copy `.env.example` to `.env` and set MariaDB, JWT, and OpenAI values.
3. Run `npm install`, then `npm run dev`.

For production use HTTPS, a managed MariaDB instance, secret manager, trusted reverse proxy, database backups, error monitoring, and a browser compatibility policy that requires SpeechRecognition support.
