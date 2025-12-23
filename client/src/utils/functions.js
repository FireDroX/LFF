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
      3
    )
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

export const formatDateShort = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date
    .toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", ""); // retir le ',' entre date et heure
};

export const formatTop = (users, start, end, type) => {
  if (!Array.isArray(users)) return { users: [], start, end, type };

  const sorted = users.sort((a, b) => b.score - a.score);

  const filled = [
    ...(sorted || []),
    ...Array(sorted?.length > 5 ? 0 : 5 - sorted?.length)
      .fill()
      .map(() => ({ score: 0, name: "Nobody" })),
  ];

  return { users: filled, start, end, type };
};

export const filterPointOptions = (pointOptions, flags) => {
  if (!Array.isArray(flags)) return {};

  return Object.fromEntries(
    Object.entries(pointOptions).filter(([key]) => {
      return (
        (key === "crystaux" && flags.includes("crystaux")) ||
        (key === "pvp" && flags.includes("pvp")) ||
        (key === "iscoin" && flags.includes("iscoin")) ||
        (key === "dragonegg" && flags.includes("dragonegg")) ||
        (key === "beacon" && flags.includes("beacon")) ||
        (key === "sponge" && flags.includes("sponge"))
      );
    })
  );
};
