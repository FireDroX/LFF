const { publicCommands } = require("./registerCommands");

module.exports = async function help(req, res) {
  const embedFields = publicCommands.map((cmd) => ({
    name: `/${cmd.name}`,
    value: cmd.description || "Aucune description",
    inline: false,
  }));

  return res.send({
    type: 4,
    data: {
      flags: 64,
      embeds: [
        {
          title: "📘 Liste des commandes disponibles",
          description: "Voici toutes les commandes utilisables sur le serveur.",
          color: parseInt("b29a80", 16),
          fields: embedFields,
          footer: {
            text: "LFF — Système de commandes",
          },
        },
      ],
    },
  });
};
