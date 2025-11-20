const { commands } = require("./registerCommands");

module.exports = async function help(req, res) {
  const embedFields = commands.map((cmd) => ({
    name: `/${cmd.name}`,
    value: cmd.description || "Aucune description",
    inline: false,
  }));

  return res.send({
    type: 4,
    data: {
      embeds: [
        {
          title: "📘 Liste des commandes disponibles",
          description: "Voici toutes les commandes utilisables sur le serveur.",
          color: parseInt("9b59b6", 16), // Couleur embed
          fields: embedFields,
          footer: {
            text: "LFF — Système de commandes",
          },
        },
      ],
    },
  });
};
