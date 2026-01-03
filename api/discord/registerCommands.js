require("dotenv/config");
const fetch = require("node-fetch");

const appId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_CLIENT_TOKEN;

/**
 * 🔹 Liste des commandes exportées pour le /help
 */
const commands = [
  // uptime
  {
    name: "uptime",
    description: "Voir depuis combien de temps le serveur est UP.",
  },
  // leaderboard
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
  // points
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
  // help
  {
    name: "help",
    description: "Affiche la liste des commandes disponibles",
  },
  // history
  {
    name: "history",
    description:
      "Consulter les anciens classements et naviguer entre les semaines",
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
        ],
      },
    ],
  },

  // admin commands
  {
    name: "admin",
    description: "Commandes administrateurs",
    options: [
      {
        type: 2, // Subcommand Group
        name: "ticket",
        description: "Gestion du système de tickets",
        options: [
          {
            type: 1, // Subcommand
            name: "setup",
            description: "Configurer le système de tickets",
          },
          {
            type: 1, // Subcommand
            name: "updatereason",
            description: "Mettre à jour une raison de ticket",
            options: [
              {
                type: 3, // STRING
                name: "reason",
                description: "Raison du ticket à mettre à jour",
                required: true,
                choices: [
                  {
                    name: "Gang LFF",
                    value: "gang_lff",
                  },
                  {
                    name: "Île FireDroX",
                    value: "ile_firedrox",
                  },
                  {
                    name: "Île Nalyd_40",
                    value: "ile_nalyd",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * 🔹 Fonction d’enregistrement des commandes Discord
 */
async function registerCommands() {
  console.log("📡 Enregistrement des commandes...");

  const res = await fetch(
    `https://discord.com/api/v10/applications/${appId}/commands`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${token}`,
      },
      body: JSON.stringify(commands),
    }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("❌ Erreur lors du register :", data);
    return;
  }

  console.log("✅ Slash Commands Registered !");
  console.log("📌 Commandes enregistrées :");

  data.forEach((cmd) => {
    console.log(`   ➜ ${cmd.name} (id: ${cmd.id})`);
  });
}

/**
 * 🔹 Si le fichier est exécuté directement → enregistre les commandes
 */
if (require.main === module) {
  registerCommands().catch((err) => {
    console.error("❌ Error registering commands:", err);
  });
}

module.exports = { commands, registerCommands };
