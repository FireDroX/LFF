const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const checkAuth = require("../../utils/checkAuth");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/", async (_, res) => {
  const now = new Date();

  // Étape 1 : Cherche un classement existant pour cette semaine
  let { data: currentTop, error } = await supabase
    .from("tops")
    .select("*")
    .lte("start_date", now.toISOString())
    .gte("end_date", now.toISOString())
    .single();

  // Étape 2 : Si aucun top trouvé → on le crée
  if (error || !currentTop) {
    console.log("Aucun top trouvé, création d’un nouveau classement...");

    // Calcul du dimanche (début de semaine)
    const day = now.getDay(); // 0 = dimanche, 6 = samedi
    const diffToSunday = day; // nombre de jours à reculer
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - diffToSunday);
    startDate.setHours(0, 0, 0, 0); // dimanche à 00:00:00

    // Calcul du samedi (fin de semaine)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999); // samedi à 23:59:59

    // Insertion dans Supabase
    const { data: newTop, error: insertError } = await supabase
      .from("tops")
      .insert([
        {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          users: [],
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

    currentTop = newTop;
  }

  // Étape 3 : Trie et renvoie les résultats (ou vide)
  const sorted = (currentTop.users || []).sort((a, b) => b.score - a.score);
  res.json({
    users: sorted,
    start: currentTop.start_date,
    end: currentTop.end_date,
  });
});

module.exports = router;
