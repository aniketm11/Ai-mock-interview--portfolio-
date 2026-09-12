import mariadb from 'mariadb';
import env from '../config/env.js';

const pool = mariadb.createPool({
  host: env.MARIADB_HOST,
  port: env.MARIADB_PORT,
  user: env.MARIADB_USER,
  password: env.MARIADB_PASSWORD,
  database: env.MARIADB_DATABASE,
  connectionLimit: 5,
  acquireTimeout: 10000,
  idleTimeout: 60,
  insertIdAsNumber: false,
  ssl: {
    rejectUnauthorized: true
  }
});

export default pool;
