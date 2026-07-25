const { getPool } = require("./index");

const VALID_TYPES = [
  "crystaux",
  "iscoin",
  "dragonegg",
  "beacon",
  "sponge",
  "pvp",
];
const PERMANENT_TYPES = new Set(["dragonegg", "beacon", "sponge"]);

function normalizeTop(row) {
  if (!row) return null;

  return {
    ...row,
    id: Number(row.id),
  };
}

function normalizeScore(score) {
  const value = Number(score);
  if (!Number.isSafeInteger(value)) {
    throw new RangeError("A score exceeds JavaScript's safe integer range");
  }
  return value;
}

async function findActiveTop(type, connection = getPool(), lock = false) {
  const permanentFirst = PERMANENT_TYPES.has(type)
    ? "(start_date IS NULL AND end_date IS NULL) DESC,"
    : "";
  const [rows] = await connection.execute(
    `SELECT id, type, start_date, end_date
     FROM tops
     WHERE type = ?
       AND (
         (start_date <= UTC_TIMESTAMP(3) AND end_date >= UTC_TIMESTAMP(3))
         OR (start_date IS NULL AND end_date IS NULL)
       )
     ORDER BY ${permanentFirst} start_date DESC, id DESC
     LIMIT 1${lock ? " FOR UPDATE" : ""}`,
    [type],
  );

  return normalizeTop(rows[0]);
}

async function findLastTop(type, connection = getPool()) {
  const [rows] = await connection.execute(
    `SELECT id, type, start_date, end_date
     FROM tops
     WHERE type = ?
       AND end_date < UTC_TIMESTAMP(3)
     ORDER BY end_date DESC, id DESC
     LIMIT 1`,
    [type],
  );

  return normalizeTop(rows[0]);
}

async function getLeaderboard(top, connection = getPool()) {
  if (!top) return [];

  const [rows] = await connection.execute(
    `SELECT r.user_id, u.name, r.score
     FROM top_rankings AS r
     INNER JOIN users AS u ON u.id = r.user_id
     WHERE r.top_id = ?
     ORDER BY r.score DESC, r.updated_at ASC, r.user_id ASC`,
    [top.id],
  );

  let previousScore;
  let currentRank = 0;

  return rows.map((row, index) => {
    const score = normalizeScore(row.score);
    if (score !== previousScore) {
      currentRank = index + 1;
      previousScore = score;
    }

    return {
      user_id: row.user_id,
      name: row.name,
      score,
      rank: currentRank,
      start_date: top.start_date,
      end_date: top.end_date,
    };
  });
}

async function createTop({ type, startDate, endDate }) {
  await getPool().execute(
    `INSERT INTO tops (type, start_date, end_date)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [type, startDate, endDate],
  );

  return findActiveTop(type);
}

async function adjustScore(
  { type, userId, name, delta },
  existingConnection = null,
) {
  const connection =
    existingConnection || (await getPool().getConnection());
  const ownsTransaction = existingConnection === null;

  try {
    if (ownsTransaction) {
      await connection.beginTransaction();
    }

    const top = await findActiveTop(type, connection, true);
    if (!top) {
      const error = new Error("No active leaderboard found");
      error.code = "NO_ACTIVE_TOP";
      throw error;
    }

    const beforeLeaderboard = await getLeaderboard(top, connection);
    const previousLeader = beforeLeaderboard[0] || null;
    const userWasInLeaderboard = beforeLeaderboard.some(
      (row) => row.user_id === userId,
    );

    const [existingRows] = await connection.execute(
      `SELECT score
       FROM top_rankings
       WHERE top_id = ? AND user_id = ?
       FOR UPDATE`,
      [top.id, userId],
    );

    const currentScore = existingRows[0]
      ? normalizeScore(existingRows[0].score)
      : 0;
    const newScore = currentScore + delta;

    if (!Number.isSafeInteger(newScore)) {
      throw new RangeError("The resulting score is outside the safe range");
    }

    if (newScore <= 0) {
      await connection.execute(
        "DELETE FROM top_rankings WHERE top_id = ? AND user_id = ?",
        [top.id, userId],
      );
    } else {
      await connection.execute(
        `INSERT INTO users (id, name)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [userId, name],
      );
      await connection.execute(
        `INSERT INTO top_rankings (top_id, user_id, score)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           score = VALUES(score)`,
        [top.id, userId, newScore],
      );
    }

    const leaderboard = await getLeaderboard(top, connection);
    if (ownsTransaction) {
      await connection.commit();
    }

    return {
      top,
      leaderboard,
      newScore: Math.max(newScore, 0),
      deleted: newScore <= 0,
      previousLeader,
      userWasInLeaderboard,
    };
  } catch (error) {
    if (ownsTransaction) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (ownsTransaction) {
      connection.release();
    }
  }
}

async function getHistory() {
  const [rows] = await getPool().query(
    `SELECT
       t.id,
       t.type,
       t.start_date,
       t.end_date,
       r.user_id,
       u.name,
       r.score
     FROM tops AS t
     LEFT JOIN top_rankings AS r ON r.top_id = t.id
     LEFT JOIN users AS u ON u.id = r.user_id
     WHERE t.end_date < UTC_TIMESTAMP(3)
     ORDER BY t.start_date DESC, t.id DESC, r.score DESC, r.user_id ASC`,
  );

  const grouped = new Map();
  for (const row of rows) {
    const id = Number(row.id);
    if (!grouped.has(id)) {
      grouped.set(id, {
        id,
        type: row.type,
        start_date: row.start_date,
        end_date: row.end_date,
        users: [],
      });
    }

    if (row.user_id !== null) {
      grouped.get(id).users.push({
        userId: row.user_id,
        user_id: row.user_id,
        name: row.name,
        score: normalizeScore(row.score),
      });
    }
  }

  return [...grouped.values()];
}

module.exports = {
  VALID_TYPES,
  adjustScore,
  createTop,
  findActiveTop,
  findLastTop,
  getHistory,
  getLeaderboard,
};
