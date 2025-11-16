const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const sendDiscordLog = require("../../utils/sendDiscordLog");
const { MESSAGE_SETS, getRandomMessage } = require("../../utils/messages");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const formatDateShort = (isoString) => {
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

/**
 * Route : /leaderboard/current/:type
 * Exemple : /leaderboard/current/crystaux, /iscoin, /dragonegg, /beacon ou /sponge
 */
router.get("/:type", async (req, res) => {
  const { type } = req.params;

  // Vérification du type demandé
  if (!["crystaux", "iscoin", "dragonegg", "beacon", "sponge"].includes(type)) {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const now = new Date();

  // Étape 1 : Cherche un classement existant pour cette semaine
  let { data: currentTop, error } = await supabase
    .from("tops")
    .select("*")
    .eq("type", type)
    .or(
      `and(start_date.lte.'${now.toISOString()}',end_date.gte.'${now.toISOString()}'),and(start_date.is.null,end_date.is.null)`
    )
    .single();

  // Étape 2 : Si aucun top trouvé → on le crée
  if (error || !currentTop) {
    console.log(`Aucun top trouvé pour '${type}', création en cours...`);

    // 🔍 Recherche du dernier classement terminé
    const { data: previousTop } = await supabase
      .from("tops")
      .select("*")
      .eq("type", type)
      .lt("end_date", now.toISOString())
      .order("end_date", { ascending: false })
      .limit(1)
      .single();

    // ✅ Si un top précédent existe, on envoie un message avec le podium
    if (previousTop && previousTop.users && previousTop.users.length > 0) {
      const sorted = previousTop.users.sort((a, b) => b.score - a.score);

      const podium = [
        sorted[0]
          ? `> - 🥇 **${sorted[0].name}** — ${sorted[0].score} pts`
          : null,
        sorted[1]
          ? `> - 🥈 **${sorted[1].name}** — ${sorted[1].score} pts`
          : null,
        sorted[2]
          ? `> - 🥉 **${sorted[2].name}** — ${sorted[2].score} pts`
          : null,
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

    // 1 — date actuelle en France
    const nowParis = new Date(
      new Date().toLocaleString("en-CA", {
        timeZone: "Europe/Paris",
        hour12: false,
      })
    );

    // 2 — quel jour FR
    const day = nowParis.getDay(); // 0 dimanche, 6 samedi

    // 3 — trouver dimanche FR
    const startParis = new Date(nowParis);
    startParis.setDate(nowParis.getDate() - day);
    startParis.setHours(0, 0, 0, 0);

    // 4 — samedi FR
    const endParis = new Date(startParis);
    endParis.setDate(startParis.getDate() + 6);
    endParis.setHours(23, 59, 59, 999);

    // Insertion dans Supabase
    const { data: newTop, error: insertError } = await supabase
      .from("tops")
      .insert([
        {
          start_date: startParis.toISOString(),
          end_date: endParis.toISOString(),
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

  // Étape 3 : Trie et renvoie les résultats (ou vide)
  const sorted = (currentTop.users || []).sort((a, b) => b.score - a.score);
  res.json({
    users: sorted,
    start: currentTop.start_date,
    end: currentTop.end_date,
    type: currentTop.type,
  });
});

module.exports = router;
