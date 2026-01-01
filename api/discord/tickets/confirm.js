module.exports = async function ticketConfirm(req, res) {
  const interaction = req.body;
  const action = interaction.data.custom_id;
  // ticket_close_confirm | ticket_delete_confirm

  const isClose = action === "ticket_close_confirm";
  const isDelete = action === "ticket_delete_confirm";

  return res.send({
    type: 4, // Réponse éphemère
    data: {
      flags: 64,
      content: isClose
        ? "⚠️ Es-tu sûr de vouloir **fermer** ce ticket ?"
        : "⚠️ Es-tu sûr de vouloir **supprimer définitivement** ce ticket ?",
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: "✅ Confirmer",
              custom_id: isClose ? "ticket_close" : "ticket_delete",
            },
            {
              type: 2,
              style: 2,
              label: "❌ Annuler",
              custom_id: "ticket_cancel",
            },
          ],
        },
      ],
    },
  });
};
