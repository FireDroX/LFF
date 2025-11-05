const DISCORD_LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID;
const DISCORD_CLIENT_TOKEN = process.env.DISCORD_CLIENT_TOKEN;

async function sendDiscordLog(message) {
  try {
    await fetch(
      `https://discord.com/api/channels/${DISCORD_LOG_CHANNEL_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_CLIENT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      }
    );
  } catch (error) {
    console.error("Failed to send Discord log:", error);
  }
}

module.exports = sendDiscordLog;
