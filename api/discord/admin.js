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

  console.log("test 1");

  // Vérifie la subcommand ticket
  const subcommand = interaction.data.options?.[0];

  if (subcommand && subcommand.name === "ticket") setupTicket(req, res);
};

async function setupTicket(req, res) {
  console.log("test 2");

  // Message embed par default pour les tickets
  const ticketEmbedMessage = {
    type: 4,
    data: {
      embeds: [
        {
          title: "🎫 Recrutement – Gang LFF 💎",
          description: "Dépose ta candidature en ouvrant un ticket !",
          color: parseInt("9b59b6", 16), // Couleur embed
          fields: [
            {
              name: "🎫 Clique sur le bouton ci-dessous pour ouvrir ton ticket !",
              value:
                "Un membre du staff viendra rapidement t’accompagner dans ta candidature.",
            },
          ],
        },
      ],
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 3, // Select Menu
              custom_id: "ticket_reason_select",
              placeholder: "Choisissez une raison pour ouvrir un ticket...",
              min_values: 1,
              max_values: 1,
              options: [
                {
                  label: "Rejoindre le Gang LFF",
                  value: "gang_lff",
                  description: "Candidature pour rejoindre le Gang LFF",
                  emoji: {
                    name: "💎",
                  },
                },
                {
                  label: "Rejoindre l'île de FireDroX",
                  value: "ile_firedrox",
                  description: "Candidature île FireDroX",
                  emoji: {
                    name: "🏝️",
                  },
                },
                {
                  label: "Rejoindre l'île de Nalyd_40",
                  value: "ile_nalyd",
                  description: "Candidature île Nalyd_40",
                  emoji: {
                    name: "🏝️",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  return res.send(ticketEmbedMessage);
}
