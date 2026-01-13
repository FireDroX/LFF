const setupTicket = require("./tickets/setupTicket");
const updateTicketReason = require("./tickets/updateTicketReason");

module.exports = async function admin(req, res) {
  const interaction = req.body;

  // Verifie les perms admin
  const permissions = BigInt(interaction.member.permissions);
  const ADMIN = 1n << 3n; // ADMINISTRATOR bit

  if ((permissions & ADMIN) !== ADMIN) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
      },
    });
  }

  const group = interaction.data.options?.[0]; // ticket
  const subcommand = group?.options?.[0]; // setup | updatereason

  // /admin ticket setup
  if (group?.name === "ticket" && subcommand?.name === "setup") {
    return setupTicket(req, res);
  }

  // /admin ticket updatereason
  if (group?.name === "ticket" && subcommand?.name === "updatereason") {
    const reasonOption = subcommand.options?.find(
      (opt) => opt.name === "reason"
    );

    return updateTicketReason(req, res, reasonOption?.value);
  }
};
