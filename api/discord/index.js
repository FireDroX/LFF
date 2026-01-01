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

  // Interaction composant (bouton, select menu)
  if (type === 3) {
    const id = data.custom_id;

    const handlers = {
      ticket_reason_select: "./tickets/create",
      ticket_close_confirm: "./tickets/confirm",
      ticket_delete_confirm: "./tickets/confirm",
      ticket_close: "./tickets/close",
      ticket_cancel: "./tickets/cancel",
      ticket_reopen: "./tickets/reopen",
      ticket_delete: "./tickets/delete",
    };

    // Cas spéciaux (prefix)
    if (id?.startsWith("history:")) {
      return require("./history_pages")(req, res);
    }

    if (handlers[id]) {
      return require(handlers[id])(req, res);
    }
  }
};
