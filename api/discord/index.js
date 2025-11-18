const leaderboard = require("./leaderboard");
const points = require("./points");
const uptime = require("./uptime");

module.exports = async function interactionsHandler(req, res) {
  const { type, data, member } = req.body;

  // Approuve
  if (type === 1) return res.send({ type: 1 });

  // Slash command
  if (type === 2) {
    const command = data.name;

    switch (command) {
      case "leaderboard":
        return leaderboard(req, res);

      case "points":
        return points(req, res);

      case "uptime":
        return uptime(req, res);

      default:
        return res.send({
          type: 4,
          data: { content: "Commande inconnue." },
        });
    }
  }
};
