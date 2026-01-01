const DISCORD_API = "https://discord.com/api";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

const LOG_CHANNEL_ID = "1237544228276404408";

module.exports = async function deleteTicket(req, res) {
  const interaction = req.body;
  const channelId = interaction.channel_id;

  if (!channelId) return res.sendStatus(200);

  /* =========================
     1️⃣ Récupérer le salon
  ========================== */
  const channelRes = await fetch(`${DISCORD_API}/channels/${channelId}`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });
  const channel = await channelRes.json();

  /* =========================
     2️⃣ Récupérer messages
  ========================== */
  const messagesRes = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages?limit=100`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    }
  );
  const messages = await messagesRes.json();

  /* =========================
     3️⃣ Extraire owner & reason
  ========================== */
  const ownerMatch = channel.topic?.match(/<@(\d{17,19})>/);
  const ownerId = ownerMatch?.[1] ?? "Inconnu";

  const reasonMatch = channel.topic?.match(/reason:(\w+)/);
  const reason = reasonMatch?.[1] ?? "inconnue";

  /* =========================
     4️⃣ Génération HTML
  ========================== */
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Ticket ${channel.name}</title>
<style>
body { font-family: Arial, sans-serif; background:#2c2f33; color:#fff; }
.message { margin-bottom:15px; }
.author { font-weight:bold; color:#7289da; }
.time { font-size:12px; color:#aaa; }
.content { margin-left:10px; }
</style>
</head>
<body>
<h1>Ticket ${channel.name}</h1>
<p><strong>Propriétaire :</strong> ${ownerId}</p>
<p><strong>Raison :</strong> ${reason}</p>
<hr>
${messages
  .reverse()
  .map(
    (m) => `
  <div class="message">
    <div class="author">${m.author.username} (${m.author.id})</div>
    <div class="time">${new Date(m.timestamp).toLocaleString()}</div>
    <div class="content">${escapeHtml(m.content)}</div>
  </div>
`
  )
  .join("")}
</body>
</html>`;

  /* =========================
     5️⃣ Envoi HTML au log
  ========================== */
  const form = new FormData();

  form.append(
    "payload_json",
    JSON.stringify({
      content: `📄 Archivage du ticket **${channel.name}** (raison: ${reason})`,
    })
  );

  form.append(
    "files[0]",
    new Blob([html], { type: "text/html" }),
    `${channel.name}.html`
  );

  await fetch(`${DISCORD_API}/channels/${LOG_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      // ❌ PAS de Content-Type ici
    },
    body: form,
  });

  /* =========================
     6️⃣ Suppression du salon
  ========================== */
  await fetch(`${DISCORD_API}/channels/${channelId}`, {
    method: "DELETE",
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });

  /* =========================
     7️⃣ Réponse interaction
  ========================== */
  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: "🗑️ Ticket supprimé et archivé avec succès.",
    },
  });
};

/* =========================
   Utils
========================= */
function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
