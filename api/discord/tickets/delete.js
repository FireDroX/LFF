const path = require("path");
const fs = require("fs");

const DISCORD_API = "https://discord.com/api";
const BOT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

const LOG_CHANNEL_ID = "1237544228276404408";

const cssPath = path.join(__dirname, "style.css");
const css = fs.readFileSync(cssPath, "utf8");

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
<style>${css}</style>
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
    <div class="header">
      <span class="author">${escapeHtml(m.author.username)}</span>
      <span class="time">${new Date(m.timestamp).toLocaleString()}</span>
    </div>

    ${m.content ? `<div class="text">${escapeHtml(m.content)}</div>` : ""}

    ${m.embeds
      .map(
        (e) => `
      <div class="embed" style="--embed-color:#${(e.color ?? 0x5865f2).toString(
        16
      )}">
        ${
          e.author
            ? `
          <div class="embed-author">
            ${e.author.icon_url ? `<img src="${e.author.icon_url}">` : ""}
            ${escapeHtml(e.author.name)}
          </div>`
            : ""
        }

        ${
          e.title ? `<div class="embed-title">${escapeHtml(e.title)}</div>` : ""
        }
        ${
          e.description
            ? `<div class="embed-description">${escapeHtml(
                e.description
              )}</div>`
            : ""
        }

        ${
          e.fields?.length
            ? `
          <div class="embed-fields">
            ${e.fields
              .map(
                (f) => `
              <div class="embed-field">
                <div class="embed-field-name">${escapeHtml(f.name)}</div>
                <div>${escapeHtml(f.value)}</div>
              </div>
            `
              )
              .join("")}
          </div>`
            : ""
        }

        ${
          e.thumbnail?.url
            ? `
          <div class="embed-thumb">
            <img src="${e.thumbnail.url}">
          </div>`
            : ""
        }

        ${
          e.image?.url
            ? `
          <div class="embed-image">
            <img src="${e.image.url}">
          </div>`
            : ""
        }

        ${
          e.footer
            ? `
          <div class="embed-footer">
            ${e.footer.icon_url ? `<img src="${e.footer.icon_url}">` : ""}
            ${escapeHtml(e.footer.text)}
            ${e.timestamp ? `• ${new Date(e.timestamp).toLocaleString()}` : ""}
          </div>`
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
            : `<a href="${a.url}" target="_blank">${escapeHtml(a.filename)}</a>`
        }
      </div>
    `
      )
      .join("")}
  </div>
</div>`;
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
  const authorName =
    interaction.member?.nick ?? interaction.member?.user?.username ?? "Inconnu";

  return res.send({
    type: 4,
    data: {
      flags: 64,
      content: `🗑️ Ticket supprimé par <@${interaction.member.user.id}> (\`${authorName}\`) et archivé avec succès.`,
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
