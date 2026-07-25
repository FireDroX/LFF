const getPublicUrl = require("../../utils/publicUrl");
const { errorResponse } = require("./userInsights");

module.exports = async function website(_req, res) {
  try {
    const publicUrl = getPublicUrl();

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: "🌐 Site officiel LFF",
            description:
              "Consulte les classements, ta progression, les récompenses et les commandes du bot.",
            url: publicUrl,
            color: parseInt("9b59b6", 16),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: "Ouvrir le site LFF",
                url: publicUrl,
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error("Discord website command failed:", error);
    return errorResponse(res, "Impossible de générer le lien du site.");
  }
};
