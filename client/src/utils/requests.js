const { defaultURL } = require("./defaultURL");

export const currentTop = async (type) => {
  const result = await fetch(defaultURL + "/leaderboard/current/" + type, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(
      resultJson?.error || "Failed to fetch current top leaderboard"
    );
  }

  return resultJson;
};

export const addPoints = async (score, selected) => {
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

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to add points");
  }

  return resultJson;
};

export const updatePoints = async (type, payload) => {
  const response = await fetch(
    `${defaultURL}/leaderboards/update/${type.toLowerCase()}`,
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

export const removePoints = async (path) => {
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

export const getMe = async (tokenType, accessToken) => {
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

export const getToken = async (code) => {
  const result = await fetch(defaultURL + "/get/token", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to fetch token");
  }

  window.localStorage.setItem("access_token", resultJson.access_token);
  window.localStorage.setItem("token_type", resultJson.token_type);
  return resultJson;
};

export const historyTops = async () => {
  const result = await fetch(defaultURL + "/leaderboard/history", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resultJson = await result.json();

  if (!result.ok) {
    throw new Error(resultJson?.error || "Failed to fetch history tops");
  }
  return resultJson;
};

export const profile = async () => {
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
