require("dotenv/config");

const {
  closeDatabase,
  getPool,
  initializeDatabase,
} = require("../database");
const {
  adjustScore,
  getLeaderboard,
} = require("../database/leaderboards");

const REQUIRED_COLUMNS = {
  tops: ["id", "start_date", "end_date", "type", "created_at"],
  users: ["id", "name"],
  top_rankings: ["id", "top_id", "user_id", "score", "updated_at"],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function verifySchema() {
  const [rows] = await getPool().query(
    `SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN ('tops', 'users', 'top_rankings')`,
  );

  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    const actualColumns = new Set(
      rows
        .filter((row) => row.table_name === table)
        .map((row) => row.column_name),
    );

    for (const column of columns) {
      assert(
        actualColumns.has(column),
        `Missing database column: ${table}.${column}`,
      );
    }
  }
}

async function verifyLeaderboardTransactions() {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60_000);
    const [insertResult] = await connection.execute(
      `INSERT INTO tops (type, start_date, end_date)
       VALUES ('pvp', ?, ?)`,
      [startDate, endDate],
    );
    const top = {
      id: Number(insertResult.insertId),
      type: "pvp",
      start_date: startDate,
      end_date: endDate,
    };

    await adjustScore(
      { type: "pvp", userId: "db-check-a", name: "Check A", delta: 10 },
      connection,
    );
    await adjustScore(
      { type: "pvp", userId: "db-check-b", name: "Check B", delta: 10 },
      connection,
    );

    let leaderboard = await getLeaderboard(top, connection);
    assert(leaderboard.length === 2, "Leaderboard insertion failed");
    assert(
      leaderboard.every((row) => row.rank === 1),
      "Tied scores must share the same rank",
    );

    const adjustment = await adjustScore(
      { type: "pvp", userId: "db-check-a", name: "Check A", delta: 5 },
      connection,
    );
    assert(adjustment.newScore === 15, "Atomic score increment failed");
    assert(adjustment.leaderboard[0].user_id === "db-check-a", "Sort failed");

    const removal = await adjustScore(
      { type: "pvp", userId: "db-check-b", name: "Check B", delta: -10 },
      connection,
    );
    assert(removal.deleted, "Zero-score removal failed");

    leaderboard = await getLeaderboard(top, connection);
    assert(
      leaderboard.length === 1 &&
        leaderboard[0].user_id === "db-check-a",
      "Leaderboard deletion verification failed",
    );
  } finally {
    await connection.rollback();
    connection.release();
  }
}

async function main() {
  await initializeDatabase();
  await verifySchema();
  await verifyLeaderboardTransactions();
  console.log("MySQL schema and leaderboard transactions are valid.");
}

main()
  .catch((error) => {
    console.error("MySQL verification failed:", error.message);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
