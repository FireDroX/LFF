const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_GANG = process.env.DISCORD_ROLE_GANG;
const ROLE_ISLAND = process.env.DISCORD_ROLE_ISLAND;
const ROLE_STAFF = process.env.DISCORD_ROLE_STAFF;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Vérifie les rôles du membre dans le serveur Discord
 */
async function getUserRoles(userId) {
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    }
  );

  if (!memberRes.ok) return null;

  return await memberRes.json();
}

/**
 * Modification des points
 */
async function modifyPoints({ username, userId, type, amount }) {
  // 1️⃣ Récupération des rôles du membre
  const member = await getUserRoles(userId);

  if (!member) {
    return { error: "Impossible de récupérer vos rôles Discord." };
  }

  const roles = member.roles || [];

  const hasGang = roles.includes(ROLE_GANG);
  const hasIsland = roles.includes(ROLE_ISLAND);
  const isStaff = roles.includes(ROLE_STAFF);

  // 2️⃣ Vérification permission selon le type
  if (!isStaff) {
    if (["crystaux", "pvp"].includes(type) && !hasGang) {
      return {
        error:
          "Vous n'avez pas le rôle nécessaire pour modifier les points *crystaux*.",
      };
    }

    if (
      ["iscoin", "dragonegg", "beacon", "sponge"].includes(type) &&
      !hasIsland
    ) {
      return {
        error: `Vous n'avez pas le rôle nécessaire pour modifier les points *${type}*.`,
      };
    }
  }

  // 3️⃣ Récupération du top actif
  const now = new Date();

  let { data: currentTop, error } = await supabase
    .from("tops")
    .select("*")
    .eq("type", type)
    .or(
      `and(start_date.lte.'${now.toISOString()}',end_date.gte.'${now.toISOString()}'),and(start_date.is.null,end_date.is.null)`
    )
    .single();

  if (error || !currentTop) {
    return {
      error: `Aucun classement actif trouvé. Essayez \`/leaderboard ${type}\``,
    };
  }

  let users = currentTop.users || [];
  let index = users.findIndex((u) => u.userId === userId);

  let finalScore;

  if (index >= 0) {
    users[index].score += amount;
    users[index].name = username;
    finalScore = users[index].score;
  } else {
    finalScore = amount;
    users.push({
      name: username,
      userId,
      score: amount,
    });
    index = users.length - 1;
  }

  // 4️⃣ Suppression si score <= 0
  if (finalScore <= 0) {
    users = users.filter((u) => u.userId !== userId);

    // Mise à jour BDD
    await supabase.from("tops").update({ users }).eq("id", currentTop.id);

    return {
      deleted: true,
    };
  }

  // 5️⃣ Sauvegarde normale
  const { error: updateError } = await supabase
    .from("tops")
    .update({ users })
    .eq("id", currentTop.id);

  if (updateError) {
    return { error: "Erreur lors de la mise à jour du classement." };
  }

  return { success: true, total: finalScore };
}

module.exports = modifyPoints;
