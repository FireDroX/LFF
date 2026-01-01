module.exports = async function ticketCancel(req, res) {
  return res.send({
    type: 7, // UPDATE_MESSAGE
    data: {
      content: "❌ Action annulée.",
      components: [],
    },
  });
};
