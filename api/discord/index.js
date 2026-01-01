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
        flags: 64,
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
        data: { flags: 64, content: "❌ Commande inconnue." },
      });
    }

    return handler(req, res);
  }

  // Interactions Boutons (Ex: history pagination)
  if (type === 3) {
    const id = data.custom_id;

    // Pagination historique
    if (id?.startsWith("history:")) {
      return require("./history_pages")(req, res);
    }

    // Select menu ticket
    if (id === "ticket_reason_select") {
      return require("./tickets/create")(req, res);
    }

    // Confirmation ticket (fermer/supprimer)
    if (id === "ticket_close_confirm" || id === "ticket_delete_confirm") {
      return require("./tickets/confirm")(req, res);
    }

    // Salon ticket - fermer
    if (id === "ticket_close") {
      return require("./tickets/close")(req, res);
    }

    // Salon ticket - annuler
    if (id === "ticket_cancel") {
      return require("./tickets/cancel")(req, res);
    }

    // Salon ticket - reouvrir
    if (id === "ticket_reopen") {
      return require("./tickets/reopen")(req, res);
    }
  }
};
