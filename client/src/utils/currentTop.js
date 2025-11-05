const { defaultURL } = require("./defaultURL");

const currentTop = async (type) => {
  const result = await fetch(defaultURL + "/leaderboard/current/" + type, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(
      resultJson?.error || "Failed to fetch current top leaderboard"
    );
  }

  return resultJson;
};

export default currentTop;
