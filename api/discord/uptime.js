export default async function uptime(req, res) {
  return res.send({
    type: 4,
    data: {
      content: `✅ ${process.uptime().toString()}`,
    },
  });
}
