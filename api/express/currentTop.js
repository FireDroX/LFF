const express = require("express");

const {
  VALID_TYPES,
  createTop,
  findActiveTop,
  findLastTop,
  getLeaderboard,
} = require("../../database/leaderboards");
const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();
const PARIS_TIME_ZONE = "Europe/Paris";

function getParisParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );
}

function parisWallClockToUtc({ year, month, day, hour, minute, second, ms }) {
  const wallClockUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    ms,
  );
  let candidate = new Date(wallClockUtc);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const local = getParisParts(candidate);
    const representedLocalTime = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
      candidate.getUTCMilliseconds(),
    );
    candidate = new Date(
      wallClockUtc - (representedLocalTime - candidate.getTime()),
    );
  }

  return candidate;
}

function getCurrentParisWeek(now = new Date()) {
  const current = getParisParts(now);
  const calendarDate = new Date(
    Date.UTC(current.year, current.month - 1, current.day),
  );
  calendarDate.setUTCDate(calendarDate.getUTCDate() - calendarDate.getUTCDay());

  const startCalendar = {
    year: calendarDate.getUTCFullYear(),
    month: calendarDate.getUTCMonth() + 1,
    day: calendarDate.getUTCDate(),
  };

  calendarDate.setUTCDate(calendarDate.getUTCDate() + 6);
  const endCalendar = {
    year: calendarDate.getUTCFullYear(),
    month: calendarDate.getUTCMonth() + 1,
    day: calendarDate.getUTCDate(),
  };

  return {
    startDate: parisWallClockToUtc({
      ...startCalendar,
      hour: 0,
      minute: 0,
      second: 0,
      ms: 0,
    }),
    endDate: parisWallClockToUtc({
      ...endCalendar,
      hour: 23,
      minute: 59,
      second: 59,
      ms: 999,
    }),
  };
}

function formatDateShort(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(date))
    .replace(":", "h");
}

router.get("/:type", async (req, res) => {
  const type = req.params.type?.toLowerCase();
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  try {
    let top = await findActiveTop(type);

    if (!top) {
      const previousTop = await findLastTop(type);
      if (previousTop) {
        const previousLeaderboard = await getLeaderboard(previousTop);
        const podium = previousLeaderboard.slice(0, 3).map(
          (row, index) =>
            `> - ${["🥇", "🥈", "🥉"][index]} **${row.name}** — ${row.score} pts`,
        );

        await sendDiscordLog(
          getRandomMessage(MESSAGE_SETS.END_TOP, {
            type,
            start: formatDateShort(previousTop.start_date),
            end: formatDateShort(previousTop.end_date),
            podium,
          }),
        );
      }

      top = await createTop({ type, ...getCurrentParisWeek() });

      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.NEW_TOP, {
          type,
          start: formatDateShort(top.start_date),
          end: formatDateShort(top.end_date),
        }),
      );
    }

    const leaderboard = await getLeaderboard(top);
    return res.json({
      users: leaderboard.map((row) => ({
        userId: row.user_id,
        name: row.name,
        score: row.score,
        rank: row.rank,
      })),
      start: top.start_date,
      end: top.end_date,
      type,
    });
  } catch (error) {
    console.error("Leaderboard retrieval failed:", error);
    return res.status(500).json({ error: "Unable to retrieve leaderboard" });
  }
});

module.exports = router;
