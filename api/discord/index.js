const path = require("path");
const { commands } = require("./registerCommands");

// On construit un index { "commandName": handlerFunction }
const commandHandlers = {};

for (const cmd of commands) {
  try {
    commandHandlers[cmd.name] = require(path.join(__dirname, cmd.name));
  } catch (err) {
    return res.send({
      type: 4,
      data: {
        content: `⚠️ Commande "${cmd.name}" ignorée : fichier manquant.`,
      },
    });
  }
}
module.exports = async function interactionsHandler(req, res) {
  const { type, data, member } = req.body;

  // Approuve
  if (type === 1) return res.send({ type: 1 });

  // Slash command
  if (type === 2) {
    const commandName = data.name;

    const handler = commandHandlers[commandName];

    if (!handler) {
      return res.send({
        type: 4,
        data: { content: "❌ Commande inconnue." },
      });
    }

    return handler(req, res);
  }

  // Interactions Boutons (Ex: history pagination)
  if (type === 3) {
    // Pagination historique
    if (data.custom_id?.startsWith("history:")) {
      return require("./history_pages")(req, res);
    }

    // Select menu ticket
    if (data.custom_id === "ticket_reason_select") {
      return require("./ticket/create")(req, res);
    }
  }
};
