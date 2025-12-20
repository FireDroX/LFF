module.exports = async function uptime(req, res) {
  const seconds = Math.floor(process.uptime());

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const niceUptime = `${days}j ${hours}h ${minutes}m ${secs}s`;

  return res.send({
    type: 4, // Response
    data: {
      flags: 64, // 👈 Rend le message ÉPHÉMÈRE
      embeds: [
        {
          title: "⏱ Uptime du serveur",
          description: `Le serveur est en ligne depuis :\n**${niceUptime}**`,
          color: parseInt("9b59b6", 16), // Couleur embed
        },
      ],
    },
  });
};
