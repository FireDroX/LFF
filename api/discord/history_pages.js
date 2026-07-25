const {
  buildHistoryEmbed,
  paginationButtons,
} = require("../../utils/functions");
const getPublicUrl = require("../../utils/publicUrl");

module.exports = function handleHistoryButtons(req, res) {
  const interaction = req.body;

  if (interaction.type !== 3) return; // pas un bouton

  const [action, pageStr, type] = interaction.data.custom_id.split(":");
  if (action !== "history") return;

  const page = parseInt(pageStr, 10);

  fetch(`${getPublicUrl()}/api/leaderboard/history`)
    .then((r) => r.json())
    .then((data) => {
      const history = data.filter((x) => x.type === type);

      const embed = buildHistoryEmbed(history, page, type);

      return res.send({
        type: 7, // update message
        data: {
          embeds: [embed],
          components: [paginationButtons(page, history.length, type)],
        },
      });
    })
    .catch((err) => {
      console.error(err);
      return res.send({
        type: 4,
        data: { flags: 64, content: "❌ Erreur de pagination." },
      });
    });
};
