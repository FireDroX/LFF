const { defaultURL } = require("./defaultURL");

const addPoints = async (score, selected) => {
  const result = await fetch(defaultURL + "/points/add/" + selected, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem(
        "token_type"
      )} ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({
      score,
    }),
  });

  const resultJson = await result.json();
  return resultJson;
};

export default addPoints;
