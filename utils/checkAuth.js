const fetch = require("node-fetch");

const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ISLAND = process.env.DISCORD_ROLE_ISLAND;
const ROLE_GANG = process.env.DISCORD_ROLE_GANG;
const ROLE_STAFF = process.env.DISCORD_ROLE_STAFF;

const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

async function checkAuth(req, res, next) {
  try {
    const authString = req.headers.authorization;
    if (!authString) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    // 1️⃣ Vérifie le token utilisateur via /users/@me
    const me = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: authString },
    });

    if (!me.ok) {
      return res
        .status(me.status)
        .json({ error: "Unauthorized or invalid token" });
    }

    const userData = await me.json();

    // 2️⃣ Vérifie que le bot peut récupérer les infos du membre
    const memberRes = await fetch(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userData.id}`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      }
    );

    // Si l'utilisateur n'est pas dans le serveur
    if (memberRes.status === 404) {
      return res.status(403).json({ error: "User not in the Discord server" });
    }

    if (!memberRes.ok) {
      const errText = await memberRes.text();
      console.error("Discord guild fetch error:", errText);
      return res
        .status(memberRes.status)
        .json({ error: "Failed to fetch guild member" });
    }

    const memberData = await memberRes.json();

    // 3️⃣ Vérifie si le membre a l’un des deux rôles ou est l'utilisateur spécial
    const hasGangRole = memberData.roles.includes(ROLE_GANG);
    const hasIslandRole = memberData.roles.includes(ROLE_ISLAND);
    const hasStaffRole = memberData.roles.includes(ROLE_STAFF);
    const isSpecialUser = userData.id === '1167539277064843437';

    // Aucun des rôles requis et pas utilisateur spécial
    if (!hasGangRole && !hasIslandRole && !isSpecialUser) {
      return res
        .status(403)
        .json({ error: "User does not have a required Discord role" });
    }

    // 4️⃣ Définition des flags selon les rôles ou tout pour utilisateur spécial
    let flags = [];

    if (isSpecialUser) {
      flags = ["crystaux", "iscoin", "dragonegg", "beacon", "sponge", "pvp"];
    } else {
      if (hasGangRole) flags.push("crystaux", "pvp");
      if (hasIslandRole) flags.push("iscoin", "dragonegg", "beacon", "sponge");
    }

    // 5️⃣ Stocke les infos utilisateur dans req.user
    req.user = {
      id: userData.id,
      username: userData.global_name || userData.username,
      nick: memberData.nick,
      avatar: userData.avatar,
      flags,
      isAdmin: hasStaffRole,
    };

    next();
  } catch (err) {
    console.error("checkAuth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = checkAuth;
