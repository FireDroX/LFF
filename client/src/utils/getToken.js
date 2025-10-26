const { defaultURL } = require("./defaultURL");

const getToken = async (code) => {
  const result = await fetch(defaultURL + "/get/token", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  window.localStorage.setItem("access_token", resultJson.access_token);
  window.localStorage.setItem("token_type", resultJson.token_type);
  return resultJson;
};

export default getToken;
