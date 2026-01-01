const DISCORD_API = "https://discord.com/api";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

const CATEGORY_ID = "1439283006836707429";

const ROLE_MAP = {
  gang_lff: "1432749715962990713",
  ile_firedrox: "1451659478419112148",
  ile_nalyd: "1442638982717378761",
};

const FIELDS_MAP = {
  gang_lff: {
    name: "💎 Rejoindre le Gang LFF",
    value:
      "- Nombre de TFARM / semaine : \n- Activité (temps de jeu par jour/semaine) : \n- Pourquoi nous rejoindre ?",
  },
  ile_firedrox: {
    name: "🏝️ Rejoindre l'île de FireDroX",
    value:
      "- Prestige et Pioche (fortune) :  \n- Nombre d'heures de minage / semaine : \n- Pourquoi nous rejoindre ?",
  },
  ile_nalyd: {
    name: "🏝️ Rejoindre l'île de Nalyd_40",
    value:
      "- Prestige et Pioche (fortune) :  \n- Nombre d'heures de minage / semaine : \n- Pourquoi nous rejoindre ?",
  },
};

module.exports = async function createTicket(req, res) {
  const interaction = req.body;

  const guildId = interaction.guild_id;
  const userId = interaction.member.user.id;
  const choice = interaction.data.values[0];

  const roleId = ROLE_MAP[choice];
  if (!roleId) return res.sendStatus(200);

  const channelName = `ticket-${userId}`;

  // ❌ Anti double ticket
  const channelsRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  const channels = await channelsRes.json();

  const existingTicket = channels.find(
    (c) => c.parent_id === CATEGORY_ID && c.name === `ticket-${userId}`
  );

  if (existingTicket) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Tu as déjà un ticket ouvert.",
      },
    });
  }

  // 1️⃣ Création du salon
  const channelRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: channelName,
      topic: `Ticket de <@${userId}> ouvert le <t:${Math.floor(
        Date.now() / 1000
      )}:F>\nreason:${choice}`,
      type: 0,
      parent_id: CATEGORY_ID,
      permission_overwrites: [
        {
          id: guildId,
          type: 0,
          deny: "1024", // VIEW_CHANNEL
        },
        {
          id: userId,
          type: 1,
          allow: "1024",
        },
        {
          id: roleId,
          type: 0,
          allow: "1024",
        },
      ],
    }),
  });

  const channel = await channelRes.json();

  // 2️⃣ Message par défaut
  await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `<@${userId}> bienvenue dans ton ticket !`,
      embeds: [
        {
          title: "📢 Recrutement – Présentation Obligatoire 📢",
          description:
            "Si vous souhaitez nous rejoindre, merci de copier-coller le formulaire ci-dessous et de remplir les informations manquantes en ticket :",
          color: parseInt("9b59b6", 16),
          fields: [
            {
              name: "📝 Informations Générales",
              value:
                "- Ton pseudo Minecraft: \n- Ton grade actuel: \n- Date d'arrivée sur SkyOfSKill: ",
            },
            {
              name: FIELDS_MAP[choice].name,
              value: FIELDS_MAP[choice].value,
            },
          ],
        },
      ],
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
          ],
        },
      ],
    }),
  });

  // 3️⃣ Réponse interaction
  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: "✅ Ton ticket a été créé avec succès !",
    },
  });
};
