import fetch from "node-fetch";
import "dotenv/config";

const appId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_CLIENT_TOKEN;

export default async function registerCommands() {
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
            { name: "iscoin", value: "iscoin" },
            { name: "dragonegg", value: "dragonegg" },
            { name: "beacon", value: "beacon" },
            { name: "sponge", value: "sponge" },
          ],
        },
      ],
    },

    // {
    //   name: "points",
    //   description: "Ajouter ou retirer des points",
    //   options: [
    //     {
    //       name: "option",
    //       type: 3,
    //       required: true,
    //       description: "add/remove",
    //       choices: [
    //         { name: "add", value: "add" },
    //         { name: "remove", value: "remove" },
    //       ],
    //     },
    //     {
    //       name: "type",
    //       type: 3,
    //       required: true,
    //       description: "Type de points",
    //       choices: [
    //         { name: "crystaux", value: "crystaux" },
    //         { name: "iscoin", value: "iscoin" },
    //         { name: "dragonegg", value: "dragonegg" },
    //         { name: "beacon", value: "beacon" },
    //         { name: "sponge", value: "sponge" },
    //       ],
    //     },
    //     {
    //       name: "amount",
    //       type: 4,
    //       required: true,
    //       description: "Nombre de points",
    //     },
    //   ],
    // },
  ];

  await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(commands),
  });

  console.log("Slash Commands Registered ✔");
}

registerCommands().catch((err) => {
  console.error("❌ Error registering commands:", err);
});
