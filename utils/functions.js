export function formatReadableDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";

  const utc = d.getTime();
  const offsetMinutes = d.getTimezoneOffset() === -120 ? 120 : 60;
  const paris = new Date(utc + offsetMinutes * 60 * 1000);

  const day = String(paris.getUTCDate()).padStart(2, "0");
  const month = String(paris.getUTCMonth() + 1).padStart(2, "0");
  const hour = String(paris.getUTCHours()).padStart(2, "0");
  const minute = String(paris.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month} ${hour}:${minute}`;
}

export function buildHistoryEmbed(history, page, type) {
  const top = history[page];

  const medals = ["🥇", "🥈", "🥉"];

  const formattedUsers = (top.users || [])
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(
      (u, i) =>
        `> - ${i <= 2 ? medals[i] : `**#${i + 1}**`} — **${
          u.score
        }** — ${u.name.slice(0, 18)}`,
    )
    .join("\n");

  const start = formatReadableDate(top.start_date);
  const end = formatReadableDate(top.end_date);

  return {
    title: `📜 Historique — ${type}`,
    description:
      formattedUsers.length > 0
        ? formattedUsers
        : "Aucun joueur dans ce classement.",
    footer: {
      text: `Période : ${start} → ${end} | Page ${page + 1}/${history.length}`,
    },
    color: parseInt("9b59b6", 16), // Couleur embed
  };
}

export function paginationButtons(page, total, type) {
  const prevDisabled = page <= 0;
  const nextDisabled = page >= total - 1;

  return {
    type: 1,
    components: [
      {
        type: 2,
        style: 2,
        label: "⬅️",
        custom_id: `history:${page - 1}:${type}`,
        disabled: prevDisabled,
      },
      {
        type: 2,
        style: 2,
        label: "➡️",
        custom_id: `history:${page + 1}:${type}`,
        disabled: nextDisabled,
      },
    ],
  };
}

export const formatNumberWithSpaces = (number = 0) => {
  const numberString = number.toString();
  const groups = [];
  for (let i = numberString.length; i > 0; i -= 3) {
    groups.unshift(numberString.substring(Math.max(0, i - 3), i));
  }

  return groups.join(" ");
};

export const compactNumber = (number = Number) => {
  const suffixes = ["", "K", "M", "B", "T", "Q", "Qu"];
  let suffixNum = Math.floor(("" + number).length / 3);

  let shortValue = parseFloat(
    (suffixNum !== 0 ? number / Math.pow(1000, suffixNum) : number).toPrecision(
      3,
    ),
  );

  if (shortValue % 1 !== 0 && !(shortValue < 1 && suffixNum > 0))
    shortValue = shortValue.toFixed(1);

  if (shortValue < 1 && suffixNum > 0) {
    shortValue = shortValue.toFixed(3);
    shortValue *= 1000;
    suffixNum--;
  }

  return shortValue + suffixes[suffixNum];
};
