const DISCORD_API = "https://discord.com/api";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

const CATEGORY_ID = "1439283006836707429";

// même mapping que pour la création
const ROLE_MAP = {
  gang_lff: "1432749715962990713",
  ile_firedrox: "1451659478419112148",
  ile_nalyd: "1442638982717378761",
};

module.exports = async function reopenTicket(req, res) {
  const interaction = req.body;

  const channelId = interaction.channel_id;
  const messageId = interaction.message?.id;
  const guildId = interaction.guild_id;

  if (!channelId) return res.sendStatus(200);

  /* =========================
     1️⃣ Récupérer le salon
  ========================== */
  const channelRes = await fetch(`${DISCORD_API}/channels/${channelId}`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  const channel = await channelRes.json();

  /* =========================
     2️⃣ Récupérer l'ID user
     depuis le nom du salon
  ========================== */
  const match = channel.name.match(/(\d{17,19})/);
  const userId = match ? match[1] : null;

  if (!userId) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Impossible de déterminer le propriétaire du ticket.",
      },
    });
  }

  /* =========================
     3️⃣ Déterminer le rôle
     (via l'ancien topic)
  ========================== */
  const reasonMatch = channel.topic?.match(/reason:(\w+)/);
  const choice = reasonMatch ? reasonMatch[1] : null;
  const roleId = choice ? ROLE_MAP[choice] : null;

  /* =========================
     4️⃣ Réactiver permissions
  ========================== */
  const reopenedAt = Math.floor(Date.now() / 1000);

  const overwrites = [
    {
      id: guildId,
      type: 0,
      deny: "1024", // @everyone
    },
    {
      id: userId,
      type: 1,
      allow: "1024",
    },
  ];

  if (roleId) {
    overwrites.push({
      id: roleId,
      type: 0,
      allow: "1024",
    });
  }

  await fetch(`${DISCORD_API}/channels/${channelId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `ticket-${userId}`,
      parent_id: CATEGORY_ID,
      permission_overwrites: overwrites,
      topic: `Ticket de <@${userId}> réouvert le <t:${reopenedAt}:F>\nreason:${choice}`,
    }),
  });

  /* =========================
     5️⃣ Modifier le message
     principal du ticket
  ========================== */
  if (messageId) {
    await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `<@${userId}> ton ticket a été **réouvert** ✅`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 1,
                label: "Fermer",
                custom_id: "ticket_close_confirm",
              },
              {
                type: 2,
                style: 4,
                label: "Supprimer",
                custom_id: "ticket_delete_confirm",
              },
              {
                type: 2,
                style: 2,
                label: "Enregistrer",
                custom_id: "ticket_save",
              },
            ],
          },
        ],
      }),
    });
  }

  /* =========================
     6️⃣ Réponse interaction
  ========================== */
  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: "🔓 Le ticket a été réouvert avec succès.",
    },
  });
};
