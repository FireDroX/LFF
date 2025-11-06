const { defaultURL } = require("./defaultURL");

const profile = async () => {
  const result = await fetch(defaultURL + "/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem(
        "token_type"
      )} ${localStorage.getItem("access_token")}`,
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to add points");
  }

  return resultJson;
};

export default profile;
