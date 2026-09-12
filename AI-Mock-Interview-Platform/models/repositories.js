import crypto from 'node:crypto';
import pool from '../database/mariadb.js';

const id = () => crypto.randomUUID();
const now = () => new Date();

export const users = {
  async find(email) {
    const rows = await pool.query('SELECT id, email, password_hash, created_at FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  async create(email, passwordHash) {
    const user = { id: id(), email };
    await pool.query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [user.id, email, passwordHash, now()]
    );
    return user;
  }
};

export const interviews = {
  async create(userId, profile, questions) {
    const interviewId = id();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO interviews (id, user_id, profile, status, integrity_score, created_at) VALUES (?, ?, ?, ?, 100, ?)',
        [interviewId, userId, JSON.stringify(profile), 'active', now()]
      );
      for (const [position, question] of questions.entries()) {
        await conn.query(
          'INSERT INTO questions (id, interview_id, position, prompt, category, rubric) VALUES (?, ?, ?, ?, ?, ?)',
          [id(), interviewId, position, question.prompt, question.category, question.rubric]
        );
      }
      await conn.commit();
      return interviewId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async owned(interviewId, userId) {
    const rows = await pool.query(
      'SELECT * FROM interviews WHERE id = ? AND user_id = ?',
      [interviewId, userId]
    );
    return rows[0];
  },

  async question(interviewId, position) {
    const rows = await pool.query(
      'SELECT * FROM questions WHERE interview_id = ? AND position = ?',
      [interviewId, position]
    );
    return rows[0];
  },

  async history(interviewId) {
    return pool.query(
      'SELECT q.prompt, a.transcript, a.evaluation FROM questions q LEFT JOIN answers a ON a.question_id = q.id WHERE q.interview_id = ? ORDER BY q.position',
      [interviewId]
    );
  },

  async saveAnswer(questionId, transcript, voice, evaluation) {
    await pool.query(
      `INSERT INTO answers (id, question_id, transcript, voice_metrics, evaluation, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         transcript = VALUES(transcript),
         voice_metrics = VALUES(voice_metrics),
         evaluation = VALUES(evaluation),
         created_at = VALUES(created_at)`,
      [id(), questionId, transcript, JSON.stringify(voice), JSON.stringify(evaluation), now()]
    );
  },

  async completeIfFinished(interviewId) {
    const rows = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END) AS answered
       FROM questions q
       LEFT JOIN answers a ON a.question_id = q.id
       WHERE q.interview_id = ?`,
      [interviewId]
    );
    const total = Number(rows[0]?.total || 0);
    const answered = Number(rows[0]?.answered || 0);
    if (total > 0 && answered === total) {
      const score = await this.score(interviewId);
      await pool.query(
        'UPDATE interviews SET status = ?, overall_score = ?, completed_at = ? WHERE id = ? AND status = ?',
        ['complete', score, now(), interviewId, 'active']
      );
      return { complete: true, score };
    }
    return { complete: false, score: null };
  },

  async event(interviewId, type, severity, metadata) {
    await pool.query(
      'INSERT INTO integrity_events (id, interview_id, event_type, severity, metadata, occurred_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id(), interviewId, type, severity, JSON.stringify(metadata), now()]
    );
    await pool.query(
      'UPDATE interviews SET integrity_score = GREATEST(0, integrity_score - ?) WHERE id = ?',
      [severity, interviewId]
    );
  },

  async score(interviewId) {
    const rows = await pool.query(
      'SELECT evaluation FROM answers a JOIN questions q ON q.id = a.question_id WHERE q.interview_id = ?',
      [interviewId]
    );
    return rows.length
      ? Math.round(rows.reduce((sum, row) => sum + JSON.parse(row.evaluation).overall, 0) / rows.length)
      : 0;
  },

  async list(userId) {
    return pool.query(
      'SELECT id, profile, status, overall_score, integrity_score, created_at, completed_at FROM interviews WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }
};
