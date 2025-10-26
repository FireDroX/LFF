const { defaultURL } = require("./defaultURL");

const currentTop = async () => {
  const result = await fetch(defaultURL + "/leaderboard/current", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();
  return resultJson;
};

export default currentTop;
