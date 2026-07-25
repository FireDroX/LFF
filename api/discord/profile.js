const getPublicUrl = require("../../utils/publicUrl");
const {
  CATEGORY_LABELS,
  errorResponse,
  formatNumber,
  getCurrentStats,
  resolveTarget,
} = require("./userInsights");

module.exports = async function profile(req, res) {
  try {
    const target = await resolveTarget(req.body);
    if (!target.id) {
      return errorResponse(res, "Impossible d'identifier ce membre.");
    }

    const stats = await getCurrentStats(target.id);
    const rankedCategories = stats.filter((stat) => stat.rank !== null).length;
    const fields = stats.map((stat) => ({
      name: CATEGORY_LABELS[stat.type],
      value: stat.rank
        ? `**${formatNumber(stat.score)} pts**\nRang **#${stat.rank}** sur ${stat.totalPlayers}`
        : "**0 pt**\nNon classé",
      inline: true,
    }));

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: `👤 Profil de ${target.name}`,
            description: `<@${target.id}> est classé dans **${rankedCategories}/${stats.length}** catégories actives.`,
            color: parseInt("b29a80", 16),
            fields,
            ...(target.avatarUrl
              ? { thumbnail: { url: target.avatarUrl } }
              : {}),
            footer: {
              text: getPublicUrl().replace(/^https?:\/\//, ""),
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Discord profile command failed:", error);
    return errorResponse(res, "Impossible de charger ce profil.");
  }
};
