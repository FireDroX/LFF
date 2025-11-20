const fetch = require("node-fetch");
const {
  buildHistoryEmbed,
  paginationButtons,
} = require("../../utils/functions");

module.exports = async function history(req, res) {
  const interaction = req.body;

  // Le type choisi dans la commande /history
  const type = interaction.data.options?.[0]?.value;

  try {
    const response = await fetch(
      `https://lff.onrender.com/leaderboard/history`
    );

    if (!response.ok) {
      return res.send({
        type: 4,
        data: {
          flags: 64,
          content: "❌ Impossible de récupérer l'historique.",
        },
      });
    }

    let history = await response.json();

    // Filtre sur le type demandé
    history = history.filter((h) => h.type === type);

    if (history.length === 0) {
      return res.send({
        type: 4,
        data: {
          flags: 64,
          content: "❌ Aucun classement précédent trouvé pour ce type.",
        },
      });
    }

    // Ordre du plus récent au plus ancien
    history.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    const page = 0; // Page de départ
    const embed = buildHistoryEmbed(history, page, type);

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [embed],
        components: [paginationButtons(page, history.length)],
      },
    });
  } catch (err) {
    console.error(err);
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Erreur interne lors de l'affichage de l'historique.",
      },
    });
  }
};
