const { getPool } = require("../../database");
const {
  VALID_TYPES,
  findActiveTop,
  getLeaderboard,
} = require("../../database/leaderboards");

const CATEGORY_LABELS = {
  crystaux: "💎 Crystaux",
  pvp: "⚔️ PVP",
  iscoin: "🪙 IsCoin",
  dragonegg: "🥚 DragonEgg",
  beacon: "🔷 Beacon",
  sponge: "🧽 Sponge",
};

function formatNumber(value = 0) {
  try {
    return new Intl.NumberFormat("fr-FR").format(BigInt(String(value)));
  } catch {
    return new Intl.NumberFormat("fr-FR").format(Number(value) || 0);
  }
}

async function resolveTarget(interaction, optionName = "membre") {
  const targetOption = interaction.data.options?.find(
    (option) => option.name === optionName,
  );
  const fallbackUser = interaction.member?.user;
  const userId = String(targetOption?.value || fallbackUser?.id || "");
  const resolvedUser = interaction.data.resolved?.users?.[userId];
  const resolvedMember = interaction.data.resolved?.members?.[userId];

  let databaseName = null;
  if (userId) {
    const [rows] = await getPool().execute(
      "SELECT name FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    databaseName = rows[0]?.name || null;
  }

  const user = resolvedUser || (!targetOption ? fallbackUser : {}) || {};
  const name =
    resolvedMember?.nick ||
    user.global_name ||
    user.username ||
    databaseName ||
    "Membre inconnu";
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`
    : null;

  return { id: userId, name, avatarUrl };
}

async function getCurrentCategory(type, userId) {
  const top = await findActiveTop(type);
  if (!top) {
    return {
      type,
      top: null,
      leaderboard: [],
      score: 0,
      rank: null,
      totalPlayers: 0,
    };
  }

  const leaderboard = await getLeaderboard(top);
  const row = leaderboard.find(
    (entry) => String(entry.user_id) === String(userId),
  );

  return {
    type,
    top,
    leaderboard,
    score: row?.score || 0,
    rank: row?.rank || null,
    totalPlayers: leaderboard.length,
  };
}

async function getCurrentStats(userId) {
  return Promise.all(
    VALID_TYPES.map((type) => getCurrentCategory(type, userId)),
  );
}

async function getHistoricalStats(userId) {
  const [rows] = await getPool().execute(
    `SELECT
       t.type,
       SUM(r.score) AS total_score,
       MAX(r.score) AS best_score,
       COUNT(*) AS participations
     FROM top_rankings AS r
     INNER JOIN tops AS t ON t.id = r.top_id
     WHERE r.user_id = ?
     GROUP BY t.type`,
    [userId],
  );

  const byType = new Map(rows.map((row) => [row.type, row]));
  return VALID_TYPES.map((type) => {
    const row = byType.get(type);
    return {
      type,
      totalScore: row?.total_score || 0,
      bestScore: row?.best_score || 0,
      participations: Number(row?.participations) || 0,
    };
  });
}

function errorResponse(res, message) {
  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: `❌ ${message}`,
    },
  });
}

module.exports = {
  CATEGORY_LABELS,
  errorResponse,
  formatNumber,
  getCurrentCategory,
  getCurrentStats,
  getHistoricalStats,
  resolveTarget,
};
