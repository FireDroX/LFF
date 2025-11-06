const { defaultURL } = require("./defaultURL");

const getMe = async (tokenType, accessToken) => {
  const result = await fetch(defaultURL + "/get/me", {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to fetch user data");
  }

  return resultJson;
};

export default getMe;
