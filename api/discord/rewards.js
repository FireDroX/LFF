const {
  CATEGORY_LABELS,
  errorResponse,
} = require("./userInsights");

const WEEKLY_REWARDS = {
  crystaux: {
    group: "GANG",
    rewards: ["500 / 300 / 150", "300 / 200 / 100", "200 / 100 / 50"],
  },
  pvp: {
    group: "GANG",
    rewards: ["500 / 300 / 150", "300 / 200 / 100", "200 / 100 / 50"],
  },
  iscoin: {
    group: "ISLAND",
    rewards: ["500 / 300 / 150", "300 / 200 / 100", "200 / 100 / 50"],
  },
};

const PERMANENT_TYPES = new Set(["dragonegg", "beacon", "sponge"]);

function buildRewardField(type) {
  const weekly = WEEKLY_REWARDS[type];
  if (weekly) {
    return {
      name: CATEGORY_LABELS[type],
      value: [
        `🥇 **${weekly.rewards[0]} Tokens**`,
        `🥈 **${weekly.rewards[1]} Tokens**`,
        `🥉 **${weekly.rewards[2]} Tokens**`,
        `*Selon la place ${weekly.group} : 1re / 2e / 3e.*`,
      ].join("\n"),
      inline: false,
    };
  }

  if (PERMANENT_TYPES.has(type)) {
    return {
      name: CATEGORY_LABELS[type],
      value:
        "Le top 3 reçoit une **part du dividende ISVALUE**, avec répartition des Tokens.",
      inline: false,
    };
  }

  return null;
}

module.exports = async function rewards(req, res) {
  try {
    const selectedType = req.body.data.options?.find(
      (option) => option.name === "type",
    )?.value;
    const types = selectedType
      ? [selectedType]
      : [...Object.keys(WEEKLY_REWARDS), ...PERMANENT_TYPES];
    const fields = types.map(buildRewardField).filter(Boolean);

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: "🎁 Récompenses LFF",
            description:
              "Récompenses attribuées aux trois premières places des classements.",
            color: parseInt("b29a80", 16),
            fields,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Discord rewards command failed:", error);
    return errorResponse(res, "Impossible d'afficher les récompenses.");
  }
};
