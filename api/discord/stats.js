const {
  CATEGORY_LABELS,
  errorResponse,
  formatNumber,
  getHistoricalStats,
  resolveTarget,
} = require("./userInsights");

module.exports = async function stats(req, res) {
  try {
    const target = await resolveTarget(req.body);
    if (!target.id) {
      return errorResponse(res, "Impossible d'identifier ce membre.");
    }

    const history = await getHistoricalStats(target.id);
    const participations = history.reduce(
      (total, stat) => total + stat.participations,
      0,
    );
    const fields = history.map((stat) => ({
      name: CATEGORY_LABELS[stat.type],
      value: [
        `Total : **${formatNumber(stat.totalScore)}**`,
        `Record : **${formatNumber(stat.bestScore)}**`,
        `Participations : **${stat.participations}**`,
      ].join("\n"),
      inline: true,
    }));

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: `📈 Statistiques de ${target.name}`,
            description:
              participations > 0
                ? `Historique cumulé sur **${participations} participations**.`
                : "Ce membre ne possède pas encore de statistiques.",
            color: parseInt("b29a80", 16),
            fields,
            ...(target.avatarUrl
              ? { thumbnail: { url: target.avatarUrl } }
              : {}),
          },
        ],
      },
    });
  } catch (error) {
    console.error("Discord stats command failed:", error);
    return errorResponse(res, "Impossible de charger ces statistiques.");
  }
};
