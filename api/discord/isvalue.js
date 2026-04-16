const { compactNumber } = require("../../utils/functions");

module.exports = async function isvalue(req, res) {
  try {
    // Récupérer les 3 leaderboards
    const [dragoneggResp, beaconResp, spongeResp] = await Promise.all([
      fetch("https://lff.onrender.com/leaderboard/current/dragonegg"),
      fetch("https://lff.onrender.com/leaderboard/current/beacon"),
      fetch("https://lff.onrender.com/leaderboard/current/sponge"),
    ]);

    if (!dragoneggResp.ok || !beaconResp.ok || !spongeResp.ok) {
      return res.send({
        type: 4,
        data: {
          flags: 64,
          content: "❌ Impossible de récupérer les classements actuels.",
        },
      });
    }

    const [dragoneggData, beaconData, spongeData] = await Promise.all([
      dragoneggResp.json(),
      beaconResp.json(),
      spongeResp.json(),
    ]);

    // Pondération des scores
    const weights = {
      dragonegg: 100000,
      beacon: 10000,
      sponge: 1000,
    };

    // Fusionner tous les utilisateurs dans un objet global
    const globalScores = {};

    const addScores = (users, type) => {
      users.forEach((user) => {
        const userId = user.userId;
        const score = user.score * weights[type];
        if (!globalScores[userId]) {
          globalScores[userId] = {
            name: user.name,
            userId: user.userId,
            totalScore: 0,
          };
        }
        globalScores[userId].totalScore += score;
      });
    };

    addScores(dragoneggData.users, "dragonegg");
    addScores(beaconData.users, "beacon");
    addScores(spongeData.users, "sponge");

    // Convertir en tableau et trier par score décroissant
    const leaderboard = Object.values(globalScores).sort(
      (a, b) => b.totalScore - a.totalScore,
    );

    // Calcul du score total global
    const totalPoints = leaderboard.reduce(
      (acc, user) => acc + user.totalScore,
      0,
    );

    const medals = ["🥇", "🥈", "🥉"];

    const embedDescription = leaderboard
      .map((user, index) => {
        const percent = ((user.totalScore / totalPoints) * 100).toFixed(1);
        const medal = medals[index] ?? `\`${index + 1}.\``;

        return `${medal} **${user.name}** — ${percent}% (${compactNumber(user.totalScore)} pts)`;
      })
      .join("\n");

    // Ensuite dans ton send
    return res.send({
      type: 4,
      data: {
        embeds: [
          {
            title: "Part des joueurs dans l'ile",
            description: embedDescription,
            footer: {
              text: `Total des points : ${compactNumber(totalPoints)}`,
            },
            color: parseInt("9b59b6", 16), // Couleur embed
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Une erreur est survenue lors du calcul du classement.",
      },
    });
  }
};
