async function hasColumn(connection, table, column) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

async function hasIndex(connection, table, index) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [table, index],
  );
  return rows.length > 0;
}

async function hasForeignKeyTo(connection, table, referencedTable) {
  const [rows] = await connection.execute(
    `SELECT 1
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND REFERENCED_TABLE_NAME = ?
     LIMIT 1`,
    [table, referencedTable],
  );
  return rows.length > 0;
}

async function getPrimaryKeyColumns(connection, table) {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME AS column_name
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND CONSTRAINT_NAME = 'PRIMARY'
     ORDER BY ORDINAL_POSITION`,
    [table],
  );
  return rows.map((row) => row.column_name);
}

async function migrateRankingsToUsers(connection) {
  const rankingsHaveName = await hasColumn(
    connection,
    "top_rankings",
    "name",
  );

  if (rankingsHaveName) {
    await connection.query(
      `INSERT INTO users (id, name)
       SELECT user_id, MAX(name)
       FROM top_rankings
       GROUP BY user_id
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    );
  }

  await connection.query(
    `INSERT IGNORE INTO users (id, name)
     SELECT DISTINCT user_id, 'Unknown'
     FROM top_rankings`,
  );

  if (!(await hasColumn(connection, "top_rankings", "id"))) {
    const primaryKeyColumns = await getPrimaryKeyColumns(
      connection,
      "top_rankings",
    );
    const dropPrimaryKey =
      primaryKeyColumns.length > 0 ? "DROP PRIMARY KEY," : "";

    await connection.query(
      `ALTER TABLE top_rankings
       ${dropPrimaryKey}
       ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST`,
    );
  }

  if (
    !(await hasIndex(
      connection,
      "top_rankings",
      "uq_top_rankings_top_user",
    ))
  ) {
    await connection.query(
      `ALTER TABLE top_rankings
       ADD UNIQUE KEY uq_top_rankings_top_user (top_id, user_id)`,
    );
  }

  if (
    !(await hasForeignKeyTo(connection, "top_rankings", "users"))
  ) {
    await connection.query(
      `ALTER TABLE top_rankings
       ADD CONSTRAINT fk_rankings_user
       FOREIGN KEY (user_id) REFERENCES users(id)
       ON DELETE CASCADE`,
    );
  }

  if (rankingsHaveName) {
    await connection.query(
      "ALTER TABLE top_rankings DROP COLUMN name",
    );
  }
}

async function runMigrations(connection) {
  await migrateRankingsToUsers(connection);
}

module.exports = runMigrations;
