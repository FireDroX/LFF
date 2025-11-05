const { defaultURL } = require("./defaultURL");

const historyTops = async () => {
  const result = await fetch(defaultURL + "/leaderboard/history", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to fetch history tops");
  }
  return resultJson;
};

export default historyTops;
