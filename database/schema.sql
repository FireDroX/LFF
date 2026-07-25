CREATE TABLE IF NOT EXISTS tops (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  start_date DATETIME(3) NULL,
  end_date DATETIME(3) NULL,
  type ENUM('crystaux', 'iscoin', 'dragonegg', 'beacon', 'sponge', 'pvp') NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_tops_period (type, start_date, end_date),
  KEY idx_tops_active (type, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) NOT NULL,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS top_rankings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  top_id BIGINT UNSIGNED NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  score BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_top_rankings_top_user (top_id, user_id),
  KEY idx_rankings_order (top_id, score),
  CONSTRAINT fk_rankings_top
    FOREIGN KEY (top_id) REFERENCES tops(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rankings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
