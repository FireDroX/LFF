const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * UTILITAIRES DST / PARIS (sans toLocaleString)
 * - isParisDST(dateUtc): retourne true si dateUtc (Date) est en DST pour Europe/Paris
 * - parisOffsetMinutesFor(dateUtc): 120 si DST sinon 60
 * - makeParisDate(y,m,d,h,min,sec,ms): crée l'instant UTC correspondant à la wall-clock Paris donnée
 * - formatDateShort(isoString): affiche "DD/MM HHhMM" en heure France sans toLocaleString
 */

// Retourne le dernier dimanche du mois (monthIndex 0-11) pour une année
function lastSundayOfMonth(year, monthIndex) {
  // commence par le dernier jour du mois
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const lastDate = new Date(Date.UTC(year, monthIndex, lastDay));
  // jour de la semaine 0=dimanche .. 6=samedi en UTC
  const dow = lastDate.getUTCDay();
  const delta = dow; // si dow==0 -> lastDay is sunday -> delta=0
  const lastSundayDate = lastDay - delta;
  return lastSundayDate;
}

// Détecte DST pour Europe/Paris selon règle UE (dernier dimanche de mars à 01:00 UTC -> début, dernier dimanche d'octobre à 01:00 UTC -> fin)
function isParisDST(dateUtc) {
  if (!(dateUtc instanceof Date)) dateUtc = new Date(dateUtc);
  const year = dateUtc.getUTCFullYear();

  // dernier dimanche de mars
  const lastSunMarch = lastSundayOfMonth(year, 2); // mars index 2
  // DST starts at 01:00 UTC on last sunday of March
  const dstStartUtc = Date.UTC(year, 2, lastSunMarch, 1, 0, 0, 0);

  // dernier dimanche d'octobre
  const lastSunOct = lastSundayOfMonth(year, 9); // october index 9
  // DST ends at 01:00 UTC on last sunday of October
  const dstEndUtc = Date.UTC(year, 9, lastSunOct, 1, 0, 0, 0);

  const t = dateUtc.getTime();

  // DST active if between start (inclusive) and end (exclusive)
  return t >= dstStartUtc && t < dstEndUtc;
}

function parisOffsetMinutesFor(dateUtc) {
  return isParisDST(dateUtc) ? 120 : 60;
}

/**
 * Construit l'instant UTC correspondant à la wall-clock (y,m,d,h,min,sec,ms) en Europe/Paris.
 * Ex: makeParisDate(2025,11,16,0,0,0) -> Date whose toISOString() is the UTC instant for "2025-11-16 00:00 Paris"
 */
function makeParisDate(year, month, day, hour = 0, min = 0, sec = 0, ms = 0) {
  // On commence par créer un instant UTC qui représente la même "wall-clock" (on utilisera getters UTC ensuite)
  // Créons une Date UTC correspondant à year-month-day hour:min:sec (mais ce Date UTC représente l'instant
  // year-month-day hour:min:sec *en UTC* — on doit ensuite soustraire l'offset Paris pour obtenir l'instant réel).
  const utcCandidate = new Date(
    Date.UTC(year, month - 1, day, hour, min, sec, ms)
  );

  // calculer si CET/CEST pour cette date Paris : on veut l'offset Paris pour CET/CEST.
  // Pour déterminer DST on peut tester l'UTC candidate shifted? On doit vérifier DST for the corresponding Paris instant.
  // The candidate's UTC time corresponds to a Paris wall-clock at (utcCandidate + offset). To know the correct offset,
  // we can iterate: assume offset=60 or 120 and pick the one that, when applied, yields the same DST decision.
  // Simpler and reliable: check DST for the instant that would be the Paris local time if offset=60 and if offset=120.
  const candidateIfOffset60 = new Date(utcCandidate.getTime() + 60 * 60 * 1000);
  const candidateIfOffset120 = new Date(
    utcCandidate.getTime() + 120 * 60 * 1000
  );

  // Determine which offset yields consistent DST decision:
  // If candidateIfOffset120 is in DST (true) then offset should be 120, else 60.
  // But more robust: check which offset makes isParisDST consistent for the resulting instant.
  const offset = isParisDST(candidateIfOffset120) ? 120 : 60;

  // Now subtract offset minutes to get the actual UTC instant that corresponds to the wall-clock Paris time.
  return new Date(utcCandidate.getTime() - offset * 60 * 1000);
}

/**
 * Formatage sans toLocaleString : convertit isoString (UTC) en heure Paris affichée "DD/MM HHhMM"
 */
function formatDateShort(isoString) {
  if (!isoString) return "";
  const dUtc = new Date(isoString);
  if (isNaN(dUtc)) return "";

  const offset = parisOffsetMinutesFor(dUtc);
  const parisMs = dUtc.getTime() + offset * 60 * 1000;
  const p = new Date(parisMs);

  const day = String(p.getUTCDate()).padStart(2, "0");
  const month = String(p.getUTCMonth() + 1).padStart(2, "0");
  const hours = String(p.getUTCHours()).padStart(2, "0");
  const minutes = String(p.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month} ${hours}h${minutes}`;
}

/**
 * Route : /leaderboard/current/:type
 */
router.get("/:type", async (req, res) => {
  const { type } = req.params;

  if (!["crystaux", "iscoin", "dragonegg", "beacon", "sponge", "pvp"].includes(type)) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const nowUtc = new Date(); // instant actuel UTC

  // Recherche du top courant (comparaison en UTC). IMPORTANT: dates entourées de quotes pour Supabase filter
  let { data: currentTop, error } = await supabase
    .from("tops")
    .select("*")
    .eq("type", type)
    .or(
      `and(start_date.lte.'${nowUtc.toISOString()}',end_date.gte.'${nowUtc.toISOString()}'),and(start_date.is.null,end_date.is.null)`
    )
    .single();

  if (error || !currentTop) {
    console.log(`Aucun top trouvé pour '${type}', création en cours...`);

    // dernier top terminé
    const { data: previousTop } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .lt("end_date", nowUtc.toISOString())
      .order("end_date", { ascending: false })
      .limit(1)
      .single();

    if (previousTop && previousTop.users?.length > 0) {
      const sorted = previousTop.users.sort((a, b) => b.score - a.score);
      const podium = [
        sorted[0] && `> - 🥇 **${sorted[0].name}** — ${sorted[0].score} pts`,
        sorted[1] && `> - 🥈 **${sorted[1].name}** — ${sorted[1].score} pts`,
        sorted[2] && `> - 🥉 **${sorted[2].name}** — ${sorted[2].score} pts`,
      ].filter(Boolean);

      await sendDiscordLog(
        getRandomMessage(MESSAGE_SETS.END_TOP, {
          type,
          start: formatDateShort(previousTop.start_date),
          end: formatDateShort(previousTop.end_date),
          podium,
        })
      );
    }

    // --- calcul des bornes de la semaine EN HEURE FRANCE (wall-clock) ---
    // 1) obtenir "now" exprimé en Paris wall-clock: on convertit l'instant UTC actuel en Paris local en ajoutant offset
    const offsetNow = parisOffsetMinutesFor(nowUtc); // 60 ou 120
    const nowParisMs = nowUtc.getTime() + offsetNow * 60 * 1000;
    const nowParis = new Date(nowParisMs);

    // 2) jour FR (0=dimanche)
    const day = nowParis.getUTCDay();

    // 3) dimanche FR 00:00 wall-clock
    const startParis = new Date(
      Date.UTC(
        nowParis.getUTCFullYear(),
        nowParis.getUTCMonth(),
        nowParis.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    startParis.setUTCDate(nowParis.getUTCDate() - day); // reculer au dimanche
    // assure 00:00
    startParis.setUTCHours(0, 0, 0, 0);

    // 4) samedi FR 23:59:59.999 wall-clock
    const endParis = new Date(
      Date.UTC(
        startParis.getUTCFullYear(),
        startParis.getUTCMonth(),
        startParis.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    endParis.setUTCDate(startParis.getUTCDate() + 6);
    endParis.setUTCHours(23, 59, 59, 999);

    // 5) convertir ces wall-clock Paris en instants UTC pour la DB
    const startUTC = makeParisDate(
      startParis.getUTCFullYear(),
      startParis.getUTCMonth() + 1,
      startParis.getUTCDate(),
      0,
      0,
      0,
      0
    );
    const endUTC = makeParisDate(
      endParis.getUTCFullYear(),
      endParis.getUTCMonth() + 1,
      endParis.getUTCDate(),
      23,
      59,
      59,
      999
    );

    // insertion dans Supabase (stockage UTC)
    const { data: newTop, error: insertError } = await supabase
      .from("tops")
      .insert([
        {
          start_date: startUTC.toISOString(),
          end_date: endUTC.toISOString(),
          users: [],
          type,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Erreur lors de la création du top :", insertError);
      return res
        .status(500)
        .json({ error: "Impossible de créer le classement" });
    }

    await sendDiscordLog(
      getRandomMessage(MESSAGE_SETS.NEW_TOP, {
        type,
        start: formatDateShort(newTop.start_date),
        end: formatDateShort(newTop.end_date),
      })
    );

    currentTop = newTop;
  }

  // tri et réponse
  const sorted = (currentTop.users || []).sort((a, b) => b.score - a.score);
  res.json({
    users: sorted,
    start: currentTop.start_date,
    end: currentTop.end_date,
    type: currentTop.type,
  });
});

module.exports = router;
