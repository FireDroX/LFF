const { defaultURL } = require("./defaultURL");

const removePoints = async (path) => {
  const result = await fetch(defaultURL + "/points/remove/" + path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem(
        "token_type"
      )} ${localStorage.getItem("access_token")}`,
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Points removal failed");
  }

  return resultJson;
};

export default removePoints;
