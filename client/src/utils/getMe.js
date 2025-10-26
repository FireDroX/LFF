const { defaultURL } = require("./defaultURL");

const getMe = async (tokenType, accessToken) => {
  const result = await fetch(defaultURL + "/get/me", {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  const resultJson = await result.json();
  return resultJson;
};

export default getMe;
