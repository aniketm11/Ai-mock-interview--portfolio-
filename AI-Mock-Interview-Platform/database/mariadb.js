import mariadb from 'mariadb';
import fs from 'node:fs';
import path from 'node:path';
import env from '../config/env.js';

// MARIADB_SSL_CA may be either:
// 1) a path to a PEM file (recommended for local/Vercel deployments), or
// 2) PEM certificate content with literal \n escapes.
let ssl;

if (env.MARIADB_SSL_CA) {
  const configuredValue = env.MARIADB_SSL_CA.trim();
  const caPath = path.resolve(process.cwd(), configuredValue);

  if (fs.existsSync(caPath)) {
    const ca = fs.readFileSync(caPath, 'utf8');
    ssl = { ca, rejectUnauthorized: true };
  } else {
    const ca = configuredValue.replace(/\\n/g, '\n').trim();
    ssl = { ca, rejectUnauthorized: true };
  }
} else {
  ssl = { rejectUnauthorized: true };
}

const pool = mariadb.createPool({
  host: env.MARIADB_HOST,
  port: Number(env.MARIADB_PORT),
  user: env.MARIADB_USER,
  password: env.MARIADB_PASSWORD,
  database: env.MARIADB_DATABASE,
  connectionLimit: 5,
  acquireTimeout: 15000,
  connectTimeout: 15000,
  socketTimeout: 30000,
  idleTimeout: 60,
  insertIdAsNumber: false,
  ssl
});

export default pool;
