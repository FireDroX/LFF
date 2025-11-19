require("dotenv/config");
const fetch = require("node-fetch");

const appId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_CLIENT_TOKEN;

async function registerCommands() {
  const commands = [
    {
      name: "uptime",
      description: "Voir depuis combien de temps le serveur est UP.",
    },
    {
      name: "leaderboard",
      description: "Voir un leaderboard spécifique",
      options: [
        {
          name: "type",
          type: 3,
          required: true,
          description: "Type de leaderboard",
          choices: [
            { name: "crystaux", value: "crystaux" },
            { name: "pvp", value: "pvp" },
            { name: "iscoin", value: "iscoin" },
            { name: "dragonegg", value: "dragonegg" },
            { name: "beacon", value: "beacon" },
            { name: "sponge", value: "sponge" },
          ],
        },
      ],
    },
    {
      name: "points",
      description: "Ajouter ou retirer des points",
      options: [
        {
          name: "option",
          type: 3,
          required: true,
          description: "add/remove",
          choices: [
            { name: "add", value: "add" },
            { name: "remove", value: "remove" },
          ],
        },
        {
          name: "type",
          type: 3,
          required: true,
          description: "Type de points",
          choices: [
            { name: "crystaux", value: "crystaux" },
            { name: "pvp", value: "pvp" },

            { name: "iscoin", value: "iscoin" },
            { name: "dragonegg", value: "dragonegg" },
            { name: "beacon", value: "beacon" },
            { name: "sponge", value: "sponge" },
          ],
        },
        {
          name: "amount",
          type: 4,
          required: true,
          description: "Nombre de points",
        },
      ],
    },
  ];

  await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(commands),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("❌ Erreur lors du register des commandes :", data);
        return;
      }

      console.log("✅ Slash Commands Registered !");
      console.log("📌 Commandes enregistrées :");

      data.forEach((cmd) => {
        console.log(`   ➜ ${cmd.name} (id: ${cmd.id})`);
      });
    })
    .catch((err) => {
      console.error("❌ Erreur réseau :", err);
    });
}

registerCommands().catch((err) => {
  console.error("❌ Error registering commands:", err);
});
