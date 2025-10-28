const fetch = require("node-fetch");

const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ISLAND = process.env.DISCORD_ROLE_ISLAND;
const ROLE_GANG = process.env.DISCORD_ROLE_GANG;
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

    // 3️⃣ Vérifie si le membre a l’un des deux rôles
    const hasAllowedRole = memberData.roles.some((roleId) =>
      [ROLE_ISLAND, ROLE_GANG].includes(roleId)
    );

    if (!hasAllowedRole) {
      return res
        .status(403)
        .json({ error: "User does not have a required Discord role" });
    }

    // 4️⃣ Stocke les infos utilisateur dans req.user pour les routes suivantes
    req.user = {
      id: userData.id,
      username: userData.global_name || userData.username,
      avatar: userData.avatar,
    };

    next();
  } catch (err) {
    console.error("checkAuth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = checkAuth;
