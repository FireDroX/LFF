const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const checkAuth = require("../../utils/checkAuth");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 DELETE /points/remove
router.delete("/", checkAuth, async (req, res) => {
  const now = new Date();
  try {
    const userId = req.user.id;

    // Récupère tous les tops (crystaux et iscoin)
    let { data: currentTop, error } = await supabase
      .from("tops")
      .select("*")
      .lte("start_date", now.toISOString())
      .gte("end_date", now.toISOString());

    if (error) {
      console.log("Aucun top trouvé.");
      return res.status(500).json({ error: "Aucun top trouvé." });
    }

    // Liste des tops à mettre à jour
    const updatedTops = currentTop
      .map((top) => {
        const filteredUsers = (top.users || []).filter(
          (u) => u.userId !== userId
        );

        // Si aucun changement, on skip
        if (filteredUsers.length === top.users.length) return null;

        return {
          id: top.id,
          users: filteredUsers,
        };
      })
      .filter(Boolean); // enlève les null

    // Si rien à modifier
    if (updatedTops.length === 0) {
      return res.json({
        message: "Utilisateur non trouvé dans les classements.",
      });
    }

    // Met à jour les tops un par un
    const updates = await Promise.all(
      updatedTops.map(async (top) => {
        const { error: updateError } = await supabase
          .from("tops")
          .update({ users: top.users })
          .eq("id", top.id);

        if (updateError) {
          console.error(
            `Erreur lors de la mise à jour du top ${top.id}:`,
            updateError
          );
        }
      })
    );

    res.json({
      message: `Utilisateur supprimé des classements (${updatedTops.length} modifiés).`,
    });
  } catch (err) {
    console.error("Erreur dans /points/delete", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
