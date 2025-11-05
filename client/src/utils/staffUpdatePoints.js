const { defaultURL } = require("./defaultURL");

const staffUpdatePoints = async (type, payload) => {
  const response = await fetch(
    `${defaultURL}/staff/leaderboards/${type.toLowerCase()}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const resultJson = await response.json();

  if (!response.ok) {
    throw new Error(resultJson?.error || "Staff update failed");
  }

  return resultJson;
};

export default staffUpdatePoints;
