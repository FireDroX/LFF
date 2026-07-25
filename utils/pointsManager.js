const { adjustScore, VALID_TYPES } = require("../database/leaderboards");

const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_GANG = process.env.DISCORD_ROLE_GANG;
const ROLE_ISLAND = process.env.DISCORD_ROLE_ISLAND;
const ROLE_STAFF = process.env.DISCORD_ROLE_STAFF;

async function getUserRoles(userId) {
  const memberResponse = await fetch(
    `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    },
  );

  if (!memberResponse.ok) return null;
  return memberResponse.json();
}

async function modifyPoints({ username, userId, type, amount }) {
  if (!VALID_TYPES.includes(type)) {
    return { error: "Type de classement invalide." };
  }

  const scoreDelta = Number(amount);
  if (!Number.isSafeInteger(scoreDelta) || scoreDelta === 0) {
    return { error: "Le nombre de points doit être un entier non nul." };
  }

  const member = await getUserRoles(userId);
  if (!member) {
    return { error: "Impossible de récupérer vos rôles Discord." };
  }

  const roles = member.roles || [];
  const hasGang = roles.includes(ROLE_GANG);
  const hasIsland = roles.includes(ROLE_ISLAND);
  const isStaff = roles.includes(ROLE_STAFF);

  if (!isStaff) {
    if (["crystaux", "pvp"].includes(type) && !hasGang) {
      return {
        error:
          "Vous n'avez pas le rôle nécessaire pour modifier ce classement.",
      };
    }

    if (
      ["iscoin", "dragonegg", "beacon", "sponge"].includes(type) &&
      !hasIsland
    ) {
      return {
        error:
          "Vous n'avez pas le rôle nécessaire pour modifier ce classement.",
      };
    }
  }

  try {
    const result = await adjustScore({
      type,
      userId,
      name: username,
      delta: scoreDelta,
    });
    const newLeader = result.leaderboard[0] || null;

    return {
      success: true,
      total: result.newScore,
      deleted: result.deleted,
      isFirstPlace:
        newLeader?.user_id === userId &&
        result.previousLeader?.user_id !== userId,
      previousLeader: result.previousLeader,
      userWasInLeaderboard: result.userWasInLeaderboard,
    };
  } catch (error) {
    if (error.code === "NO_ACTIVE_TOP") {
      return {
        error: `Aucun classement actif trouvé. Essayez \`/leaderboard ${type}\`.`,
      };
    }

    console.error("Discord point update failed:", error);
    return { error: "La mise à jour du score a échoué." };
  }
}

module.exports = modifyPoints;
