const { defaultURL } = require("./defaultURL");

const removePoints = async () => {
  const result = await fetch(defaultURL + "/points/remove", {
    method: "DELETE",
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

export default removePoints;
