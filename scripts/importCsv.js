require("dotenv/config");

const fs = require("node:fs/promises");
const path = require("node:path");
const { closeDatabase, getPool } = require("../database");
const { VALID_TYPES } = require("../database/leaderboards");

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("CSV invalide : guillemet non fermé");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter((values) =>
    values.some((value) => String(value).trim() !== ""),
  );
}

async function readRows(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const rows = parseCsv(content.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    throw new Error(`CSV vide ou invalide : ${filePath}`);
  }
  return rows.slice(1);
}

function assertIdentifier(value, label) {
  const normalized = String(value || "").trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${label} invalide : ${value}`);
  }
  return normalized;
}

function parseNullableDate(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} invalide : ${value}`);
  }
  return date;
}

function parseUsers(rows) {
  const users = rows.map((row, index) => {
    const id = assertIdentifier(row[1], `users ligne ${index + 2}, id`);
    const name = String(row[2] || "").trim();
    if (!name || name.length > 100) {
      throw new Error(`users ligne ${index + 2}, nom invalide`);
    }
    return { id, name };
  });

  assertUnique(users.map((user) => user.id), "utilisateur");
  return users;
}

function parseTops(rows) {
  const validTypes = new Set(VALID_TYPES);
  const tops = rows.map((row, index) => {
    const sourceId = assertIdentifier(
      row[1],
      `tops ligne ${index + 2}, id`,
    );
    const startDate = parseNullableDate(
      row[2],
      `tops ligne ${index + 2}, start_date`,
    );
    const endDate = parseNullableDate(
      row[3],
      `tops ligne ${index + 2}, end_date`,
    );
    const type = String(row[4] || "").trim().toLowerCase();

    if (!validTypes.has(type)) {
      throw new Error(`tops ligne ${index + 2}, type invalide : ${type}`);
    }
    if ((startDate === null) !== (endDate === null)) {
      throw new Error(
        `tops ligne ${index + 2}, les deux dates doivent être renseignées`,
      );
    }
    if (startDate && startDate >= endDate) {
      throw new Error(`tops ligne ${index + 2}, période invalide`);
    }

    return { sourceId, startDate, endDate, type };
  });

  assertUnique(tops.map((top) => top.sourceId), "période");
  return tops;
}

function parseRankings(rows) {
  const rankings = rows.map((row, index) => {
    const sourceId = assertIdentifier(
      row[1],
      `top_rankings ligne ${index + 2}, id`,
    );
    const sourceTopId = assertIdentifier(
      row[2],
      `top_rankings ligne ${index + 2}, top_id`,
    );
    const userId = assertIdentifier(
      row[3],
      `top_rankings ligne ${index + 2}, user_id`,
    );
    const score = Number(String(row[4] || "").trim());
    if (!Number.isSafeInteger(score) || score < 0) {
      throw new Error(
        `top_rankings ligne ${index + 2}, score invalide : ${row[4]}`,
      );
    }
    return { sourceId, sourceTopId, userId, score };
  });

  assertUnique(rankings.map((ranking) => ranking.sourceId), "classement");
  assertUnique(
    rankings.map(
      (ranking) => `${ranking.sourceTopId}:${ranking.userId}`,
    ),
    "couple période/utilisateur",
  );
  return rankings;
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Doublon détecté pour ${label} : ${value}`);
    }
    seen.add(value);
  }
}

function validateRelations(users, tops, rankings) {
  const userIds = new Set(users.map((user) => user.id));
  const topIds = new Set(tops.map((top) => top.sourceId));

  for (const ranking of rankings) {
    if (!userIds.has(ranking.userId)) {
      throw new Error(
        `Utilisateur absent pour le classement ${ranking.sourceId}`,
      );
    }
    if (!topIds.has(ranking.sourceTopId)) {
      throw new Error(
        `Période absente pour le classement ${ranking.sourceId}`,
      );
    }
  }
}

async function createBackup(connection) {
  const backup = {};
  for (const table of ["users", "tops", "top_rankings"]) {
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    backup[table] = rows;
  }

  const backupDirectory = path.join(__dirname, "..", "backups");
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const backupPath = path.join(
    backupDirectory,
    `before-csv-import-${timestamp}.json`,
  );
  await fs.mkdir(backupDirectory, { recursive: true });
  await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), "utf8");
  return backupPath;
}

async function importData(users, tops, rankings) {
  const connection = await getPool().getConnection();
  let backupPath;

  try {
    await connection.beginTransaction();
    backupPath = await createBackup(connection);

    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (id, name)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [user.id, user.name],
      );
    }

    const topIdMap = new Map();
    let insertedTops = 0;
    let reusedTops = 0;

    for (const top of tops) {
      const [existingRows] = await connection.execute(
        `SELECT id
         FROM tops
         WHERE type = ?
           AND start_date <=> ?
           AND end_date <=> ?
         ORDER BY id
         LIMIT 1`,
        [top.type, top.startDate, top.endDate],
      );

      let targetId = existingRows[0]?.id;
      if (targetId) {
        reusedTops += 1;
      } else {
        const [result] = await connection.execute(
          `INSERT INTO tops (type, start_date, end_date)
           VALUES (?, ?, ?)`,
          [top.type, top.startDate, top.endDate],
        );
        targetId = result.insertId;
        insertedTops += 1;
      }

      topIdMap.set(top.sourceId, String(targetId));
    }

    for (const ranking of rankings) {
      const targetTopId = topIdMap.get(ranking.sourceTopId);
      await connection.execute(
        `INSERT INTO top_rankings (top_id, user_id, score)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score = VALUES(score)`,
        [targetTopId, ranking.userId, ranking.score],
      );
    }

    const userPlaceholders = users.map(() => "?").join(",");
    const [userCountRows] = await connection.execute(
      `SELECT COUNT(*) AS count
       FROM users
       WHERE id IN (${userPlaceholders})`,
      users.map((user) => user.id),
    );

    const rankingTuples = rankings.map(() => "(?, ?)").join(",");
    const rankingParams = rankings.flatMap((ranking) => [
      topIdMap.get(ranking.sourceTopId),
      ranking.userId,
    ]);
    const [rankingCountRows] = await connection.execute(
      `SELECT COUNT(*) AS count
       FROM top_rankings
       WHERE (top_id, user_id) IN (${rankingTuples})`,
      rankingParams,
    );

    const importedUsers = Number(userCountRows[0].count);
    const importedRankings = Number(rankingCountRows[0].count);
    if (
      importedUsers !== users.length ||
      importedRankings !== rankings.length
    ) {
      throw new Error(
        `Vérification échouée : ${importedUsers}/${users.length} utilisateurs, ` +
          `${importedRankings}/${rankings.length} classements`,
      );
    }

    await connection.commit();
    return {
      backupPath,
      importedUsers,
      insertedTops,
      reusedTops,
      importedRankings,
    };
  } catch (error) {
    await connection.rollback();
    if (backupPath) {
      error.message += ` (sauvegarde : ${backupPath})`;
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function main() {
  const [usersPath, rankingsPath, topsPath] = process.argv.slice(2);
  if (!usersPath || !rankingsPath || !topsPath) {
    throw new Error(
      "Usage: npm run db:import-csv -- <users.csv> <top_rankings.csv> <tops.csv>",
    );
  }

  const [userRows, rankingRows, topRows] = await Promise.all([
    readRows(usersPath),
    readRows(rankingsPath),
    readRows(topsPath),
  ]);
  const users = parseUsers(userRows);
  const tops = parseTops(topRows);
  const rankings = parseRankings(rankingRows);
  validateRelations(users, tops, rankings);

  console.log(
    `CSV validés : ${users.length} utilisateurs, ` +
      `${tops.length} périodes, ${rankings.length} classements.`,
  );

  const result = await importData(users, tops, rankings);
  console.log(`Sauvegarde : ${result.backupPath}`);
  console.log(
    `Import terminé : ${result.importedUsers} utilisateurs, ` +
      `${result.insertedTops} périodes ajoutées, ` +
      `${result.reusedTops} périodes réutilisées, ` +
      `${result.importedRankings} classements.`,
  );
}

main()
  .catch((error) => {
    console.error(`Import CSV échoué : ${error.message}`);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
