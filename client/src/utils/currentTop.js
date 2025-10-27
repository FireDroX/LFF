const { defaultURL } = require("./defaultURL");

const currentTop = async (type) => {
  const result = await fetch(defaultURL + "/leaderboard/current/" + type, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();
  return resultJson;
};

export default currentTop;
