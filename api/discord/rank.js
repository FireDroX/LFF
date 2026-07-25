const {
  CATEGORY_LABELS,
  errorResponse,
  formatNumber,
  getCurrentCategory,
  resolveTarget,
} = require("./userInsights");

module.exports = async function rank(req, res) {
  const type = req.body.data.options?.find(
    (option) => option.name === "type",
  )?.value;

  try {
    const target = await resolveTarget(req.body);
    if (!target.id) {
      return errorResponse(res, "Impossible d'identifier ce membre.");
    }

    const stat = await getCurrentCategory(type, target.id);
    if (!stat.top) {
      return errorResponse(
        res,
        `Aucun classement ${type} n'est actif pour le moment.`,
      );
    }

    if (!stat.rank) {
      return res.send({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              title: `${CATEGORY_LABELS[type]} — Rang`,
              description: `<@${target.id}> n'est pas encore classé dans cette catégorie.`,
              color: parseInt("b29a80", 16),
            },
          ],
        },
      });
    }

    const currentIndex = stat.leaderboard.findIndex(
      (entry) => String(entry.user_id) === target.id,
    );
    const previousPlayer =
      stat.rank > 1 && currentIndex > 0
        ? stat.leaderboard[currentIndex - 1]
        : null;
    const pointsToNext = previousPlayer
      ? Math.max(previousPlayer.score - stat.score + 1, 0)
      : 0;

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: `${CATEGORY_LABELS[type]} — Rang de ${target.name}`,
            description: [
              `Position : **#${stat.rank}** sur ${stat.totalPlayers}`,
              `Score : **${formatNumber(stat.score)} points**`,
              previousPlayer
                ? `Prochain rang : **${formatNumber(pointsToNext)} points** à gagner`
                : "🏆 Première place actuelle",
            ].join("\n"),
            color: parseInt("b29a80", 16),
            ...(target.avatarUrl
              ? { thumbnail: { url: target.avatarUrl } }
              : {}),
          },
        ],
      },
    });
  } catch (error) {
    console.error("Discord rank command failed:", error);
    return errorResponse(res, "Impossible de charger ce classement.");
  }
};
