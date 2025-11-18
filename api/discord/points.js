import { modifyPoints } from "../../utils/pointsManager.js";
import messages, { MESSAGE_SETS } from "../../utils/messages.js";

export default async function points(req, res) {
  const sendDiscordLog = require("../../utils/sendDiscordLog");

  const { member, data } = req.body;

  const option = data.options.find((o) => o.name === "option")?.value; // add/remove
  const type = data.options.find((o) => o.name === "type")?.value;
  const amount = data.options.find((o) => o.name === "amount")?.value;

  const userId = member?.user?.id;
  const username = member?.user?.username;

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

  // Récupérer le score total depuis Supabase
  const total = result.total ?? null; // modifyPoints devra renvoyer total plus tard si tu veux

  const message =
    option === "add"
      ? messages.POINTS_ADD(username, amount, type)
      : messages.POINTS_REMOVE(username, amount, total, type);

  await sendDiscordLog(
    option === "add" ? MESSAGE_SETS.ADD : MESSAGE_SETS.REMOVE_SINGLE,
    {
      username,
      amount,
      type,
      total,
    }
  );

  return res.send({
    type: 4,
    data: { flags: 64, content: message },
  });
}
