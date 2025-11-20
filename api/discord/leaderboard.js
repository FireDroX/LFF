const { formatReadableDate } = require("../../utils/functions");

module.exports = async function leaderboard(req, res) {
  const interaction = req.body;
  const type = interaction.data.options[0].value;

  try {
    const response = await fetch(
      `https://lff.onrender.com/leaderboard/current/${type}`
    );

    if (!response.ok) {
      return res.send({
        type: 4,
        data: {
          flags: 64,
          content: "❌ Impossible de récupérer le leaderboard.",
        },
      });
    }

    const data = await response.json();

    const users = data.users || [];
    const top5 = [];

    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    for (let i = 0; i < 5; i++) {
      const user = users[i];

      if (user) {
        top5.push(
          `> - ${medals[i]} **${user.score}** — ${user.name.slice(0, 18)}`
        );
      } else {
        top5.push(`> - ${medals[i]} **0** — Nobody`);
      }
    }

    // Dates formatées
    let period = "Aucune date disponible";

    if (data.start && data.end) {
      const start = formatReadableDate(data.start);
      const end = formatReadableDate(data.end);
      period = `${start} — ${end}`;
    }

    return res.send({
      type: 4,
      data: {
        flags: 64,
        embeds: [
          {
            title: `📊 Leaderboard — ${type}`,
            description: top5.join("\n"),
            color: parseInt("9b59b6", 16),
            footer: {
              text: period,
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error(err);
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Erreur interne lors de l'affichage du leaderboard.",
      },
    });
  }
};
