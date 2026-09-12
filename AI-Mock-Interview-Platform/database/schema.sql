CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS interviews (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  profile JSON NOT NULL,
  status ENUM('active','complete','abandoned') NOT NULL DEFAULT 'active',
  integrity_score TINYINT UNSIGNED NOT NULL DEFAULT 100,
  overall_score TINYINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  CONSTRAINT fk_interviews_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_interviews_user_created(user_id, created_at)
);

CREATE TABLE IF NOT EXISTS questions (
  id CHAR(36) PRIMARY KEY,
  interview_id CHAR(36) NOT NULL,
  position SMALLINT NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(40) NOT NULL,
  rubric TEXT NOT NULL,
  CONSTRAINT fk_questions_interview FOREIGN KEY(interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  CONSTRAINT uq_questions_position UNIQUE(interview_id, position)
);

CREATE TABLE IF NOT EXISTS answers (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  transcript MEDIUMTEXT NOT NULL,
  voice_metrics JSON NOT NULL,
  evaluation JSON NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_answers_question FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT uq_answers_question UNIQUE(question_id)
);

CREATE TABLE IF NOT EXISTS integrity_events (
  id CHAR(36) PRIMARY KEY,
  interview_id CHAR(36) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  severity TINYINT UNSIGNED NOT NULL,
  metadata JSON NOT NULL,
  occurred_at DATETIME NOT NULL,
  CONSTRAINT fk_integrity_interview FOREIGN KEY(interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  INDEX idx_integrity_interview_time(interview_id, occurred_at)
);
