import nacl from "tweetnacl";
// import leaderboard from "./leaderboard.js";
// import points from "./points.js";
import uptime from "./uptime.js";

export default async function interactionsHandler(req, res) {
  console.log("logged");
  const signature = req.header("X-Signature-Ed25519");
  const timestamp = req.header("X-Signature-Timestamp");

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + req.rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(process.env.DISCORD_CLIENT_PUBLIC_KEY, "hex")
  );

  if (!isValid) return res.status(401).send("Invalid signature");

  const { type, data, member } = req.body;

  // Ping Discord
  if (type === 1) return res.send({ type: 1 });

  // Slash command
  if (type === 2) {
    const command = data.name;

    switch (command) {
      // case "leaderboard":
      //   return leaderboard(req, res);

      // case "points":
      //   return points(req, res);

      case "uptime":
        return uptime(req, res);

      default:
        return res.send({
          type: 4,
          data: { content: "Commande inconnue." },
        });
    }
  }
}
