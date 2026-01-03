module.exports = async function setupTicket(req, res) {
  // Message embed par default pour les tickets
  const ticketEmbedMessage = {
    type: 4,
    data: {
      embeds: [
        {
          title: "🎫 Recrutement",
          description:
            "Dépose ta candidature en ouvrant un ticket via le menu ci-dessous.\n\n" +
            "⚠️ **Prends le temps de bien lire les informations avant de faire ton choix.**",
          color: parseInt("9b59b6", 16), // Couleur embed
          fields: [
            {
              name: "💎 Rejoindre le Gang LFF",
              value:
                "Tu souhaites intégrer un gang actif et structuré ?\n" +
                "• Activités régulières\n" +
                "• Entraide entre membres\n" +
                "• Organisation et hiérarchie claire\n\n" +
                "👉 Des **récompenses exclusives** sont disponibles pour les membres du gang.\n" +
                "📢 Tous les détails sont disponibles dans le salon <#1439248006061887619>.",
              inline: false,
            },
            {
              name: "🏝️ Rejoindre l'île de FireDroX",
              value:
                "Postule pour rejoindre l'île de **FireDroX**.\n" +
                "• Communauté conviviale\n" +
                "• Projets et événements spécifiques à l'île\n" +
                "• Participation à son développement",
              inline: false,
            },
            {
              name: "🏝️ Rejoindre l'île de Nalyd_40",
              value:
                "Intègre l'île de **Nalyd_40** et participe à son aventure.\n" +
                "• Ambiance chill et organisée\n" +
                "• Activités régulières\n" +
                "• Opportunités d'évolution au sein de l'île",
              inline: false,
            },
            {
              name: "📩 Ouverture de ticket",
              value:
                "Clique sur le menu déroulant ci-dessous et sélectionne la raison correspondant à ta candidature.\n" +
                "Un membre du **staff** viendra rapidement t’accompagner.",
              inline: false,
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
};
