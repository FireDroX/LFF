const { ROLE_MAP, FIELDS_MAP } = require("../../../utils/tickets");

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

module.exports = async function updateTicketReason(req, res, reason) {
  const interaction = req.body;
  const channel = interaction.channel;

  // Vérifie que c'est un ticket
  if (!channel?.name?.startsWith("ticket-")) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Cette commande doit être utilisée dans un ticket.",
      },
    });
  }

  // Récupération raison actuelle
  const topic = channel.topic || "";
  const match = topic.match(/reason:(\w+)/);

  if (!match) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Aucune raison trouvée dans le ticket.",
      },
    });
  }

  const oldReason = match[1];

  if (oldReason === reason) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Le ticket possède déjà cette raison.",
      },
    });
  }

  /* =========================
     Update topic
     ========================= */

  const newTopic = topic.replace(`reason:${oldReason}`, `reason:${reason}`);

  await fetch(`${DISCORD_API}/channels/${channel.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic: newTopic }),
  });

  /* =========================
     Update permissions
     ========================= */

  const oldRole = ROLE_MAP[oldReason];
  const newRole = ROLE_MAP[reason];

  if (oldRole) {
    await fetch(
      `${DISCORD_API}/channels/${channel.id}/permissions/${oldRole}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      },
    );
  }

  if (newRole) {
    await fetch(
      `${DISCORD_API}/channels/${channel.id}/permissions/${newRole}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allow: "1024",
          type: 0,
        }),
      },
    );
  }

  /* =========================
     Envoi du nouveau message
     ========================= */

  const field = FIELDS_MAP[reason];

  if (field) {
    await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "📢 Mise à jour de la candidature",
            description:
              "La raison du ticket a été modifiée.\n" +
              "Merci de répondre aux nouvelles questions ci-dessous :",
            color: parseInt("b29a80", 16),
            fields: [
              {
                name: "📝 Informations Générales",
                value:
                  "- Ton pseudo Minecraft :\n" +
                  "- Ton grade actuel :\n" +
                  "- Date d'arrivée sur SkyOfSKill :",
              },
              field,
            ],
          },
        ],
      }),
    });
  }

  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: "✅ Raison du ticket mise à jour et nouveau formulaire envoyé.",
    },
  });
};
