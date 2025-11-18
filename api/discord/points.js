const modifyPoints = require("../../utils/pointsManager");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");
const sendDiscordLog = require("../../utils/sendDiscordLog");

module.exports = async function points(req, res) {
  const { member, data } = req.body;

  const option = data.options.find((o) => o.name === "option")?.value; // add/remove
  const type = data.options.find((o) => o.name === "type")?.value;
  const amount = data.options.find((o) => o.name === "amount")?.value;

  const userId = member?.user?.id;
  const username = member?.user?.global_name || member?.user?.username;

  if (!userId || !username) {
    return res.send({
      type: 4,
      data: {
        flags: 64,
        content: "❌ Une erreur est survenue (utilisateur inconnu).",
      },
    });
  }

  const finalAmount = option === "remove" ? -Math.abs(amount) : amount;

  const result = await modifyPoints({
    username,
    userId,
    type,
    amount: finalAmount,
  });

  if (result.error) {
    return res.send({
      type: 4,
      data: { flags: 64, content: `❌ ${result.error}` },
    });
  }

  if (result.deleted) {
    const msg = getRandomMessage(MESSAGE_SETS.REMOVE_MESSAGES, {
      user: username,
      type,
    });

    await sendDiscordLog(msg);

    return res.send({
      type: 4,
      data: { flags: 64, content: msg },
    });
  }

  // Récupérer le score total depuis Supabase
  const total = result.total ?? null;

  const message = getRandomMessage(
    option === "add" ? MESSAGE_SETS.ADD : MESSAGE_SETS.REMOVE_SINGLE,
    {
      user: username,
      score: amount,
      type,
      total,
    }
  );

  await sendDiscordLog(message);

  return res.send({
    type: 4,
    data: { flags: 64, content: message },
  });
};
