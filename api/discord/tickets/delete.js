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
  const ownerMatch = channel.name?.match(/(\d{17,19})/);
  const ownerId = ownerMatch ? ownerMatch[1] : "Inconnu";

  const reasonMatch = channel.topic?.match(/reason:(\w+)/);
  const reason = reasonMatch ? reasonMatch[1] : "Non spécifiée";

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
body {
  background: #313338;
  color: #dbdee1;
  font-family: "gg sans", "Segoe UI", Arial, sans-serif;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.content {
  max-width: 800px;
}

.author {
  font-weight: 600;
  color: #f2f3f5;
}

.time {
  font-size: 12px;
  color: #949ba4;
  margin-left: 6px;
}

.text {
  margin-top: 4px;
  white-space: pre-wrap;
}

.embed {
  background: #2b2d31;
  border-left: 4px solid #5865f2;
  padding: 8px;
  margin-top: 8px;
  border-radius: 4px;
}

.embed-title {
  font-weight: 600;
}

.embed-description {
  margin-top: 4px;
}

.attachment img {
  max-width: 400px;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
</head>
<body>
<h1>Ticket ${channel.name}</h1>
<p><strong>Propriétaire :</strong> ${ownerId}</p>
<p><strong>Raison :</strong> ${reason}</p>
<hr>
${messages
  .reverse()
  .map((m) => {
    const avatar = m.author.avatar
      ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    return `
  <div class="message">
    <img class="avatar" src="${avatar}">
    <div class="content">
      <div>
        <span class="author">${m.author.username}</span>
        <span class="time">${new Date(m.timestamp).toLocaleString()}</span>
      </div>

      ${m.content ? `<div class="text">${escapeHtml(m.content)}</div>` : ""}

      ${m.embeds
        .map(
          (e) => `
        <div class="embed">
          ${
            e.title
              ? `<div class="embed-title">${escapeHtml(e.title)}</div>`
              : ""
          }
          ${
            e.description
              ? `<div class="embed-description">${escapeHtml(
                  e.description
                )}</div>`
              : ""
          }
          ${
            e.image?.url
              ? `<img src="${e.image.url}" style="max-width:400px;">`
              : ""
          }
        </div>
      `
        )
        .join("")}

      ${m.attachments
        .map(
          (a) => `
        <div class="attachment">
          ${
            a.content_type?.startsWith("image/")
              ? `<img src="${a.url}">`
              : `<a href="${a.url}" target="_blank">${a.filename}</a>`
          }
        </div>
      `
        )
        .join("")}
    </div>
  </div>
  `;
  })
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
