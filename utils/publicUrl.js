function normalizeUrl(value) {
  return value.replace(/\/+$/, "");
}

function getPublicUrl() {
  return normalizeUrl(
    process.env.PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      "https://lff.addrien.fr",
  );
}

module.exports = getPublicUrl;
