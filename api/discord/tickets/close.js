const DISCORD_API = "https://discord.com/api";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

module.exports = async function closeTicket(req, res) {
  const interaction = req.body;

  const channelId = interaction.channel_id;

  // Sécurité
  if (!interaction.member || !channelId) {
    return res.sendStatus(200);
  }

  const match = interaction.channel.name.match(/(\d{17,19})/);
  const userId = match ? match[1] : null;
  const closedAt = Math.floor(Date.now() / 1000); // timestamp Discord (secondes)

  /* =========================
     1️⃣ Récupérer le salon
  ========================== */
  const channelRes = await fetch(`${DISCORD_API}/channels/${channelId}`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  const channel = await channelRes.json();

  // Si le salon est deja fermer
  if (channel.name.startsWith("fermé-")) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Ce ticket est déjà fermé.",
      },
    });
  }

  /* =========================
     2️⃣ Bloquer la visibilité
     - tout le monde
     - utilisateur
     - rôles précédents
  ========================== */
  const overwrites = channel.permission_overwrites.map((perm) => ({
    id: perm.id,
    type: perm.type,
    deny: "1024", // VIEW_CHANNEL
  }));

  await fetch(`${DISCORD_API}/channels/${channelId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `fermé-${userId}`,
      permission_overwrites: overwrites,
      topic: `Ticket de <@${userId}> fermé le <t:${closedAt}:F>\n${
        channel.topic?.match(/reason:\w+/)?.[0] ?? ""
      }`,
    }),
  });

  /* =========================
     3️⃣ Confirmation interaction
  ========================== */
  return res.send({
    type: 4,
    data: {
      content:
        "🔒 **Ticket fermé**\nClique sur le bouton ci-dessous pour le réouvrir.",
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: "🔓 Réouvrir",
              custom_id: "ticket_reopen",
            },
          ],
        },
      ],
    },
  });
};
