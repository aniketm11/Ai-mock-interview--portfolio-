import mariadb from 'mariadb';
import env from '../config/env.js';

// Normalize CA values entered with literal escaped newlines.
const ca = env.MARIADB_SSL_CA?.replace(/\\n/g, '\n').trim();
const ssl = ca
  ? { ca, rejectUnauthorized: true }
  : { rejectUnauthorized: true };

const pool = mariadb.createPool({
  host: env.MARIADB_HOST,
  port: env.MARIADB_PORT,
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
