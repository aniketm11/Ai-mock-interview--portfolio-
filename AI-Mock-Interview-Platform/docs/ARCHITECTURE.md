# Architecture

`backend` exposes the HTTP boundary. `services` holds application use cases. `ai` contains the OpenAI interview engine. `models` owns repository queries, and `database` owns MariaDB schema and pool configuration. `middleware`, `config`, and `utils` contain cross-cutting concerns. The browser client is separated into `frontend` modules and served from `public`.

The client records only observable integrity events. Browser APIs cannot reliably detect extra monitors, developer tools, Google searches, identity, or intent; these are deliberately not represented as conclusive cheating signals.
