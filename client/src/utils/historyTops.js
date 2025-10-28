const { defaultURL } = require("./defaultURL");

const historyTops = async () => {
  const result = await fetch(defaultURL + "/leaderboard/history", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem(
        "token_type"
      )} ${localStorage.getItem("access_token")}`,
    },
  });

  const resultJson = await result.json();
  return resultJson;
};

export default historyTops;
