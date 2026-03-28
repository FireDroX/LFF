const { defaultURL } = require("./defaultURL");

const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(defaultURL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error("Invalid JSON response");
    }

    if (!response.ok) {
      throw new Error(data?.error || "API error");
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid server response");
    }

    if (error instanceof TypeError) {
      // fetch failed → serveur down / CORS / DNS
      throw new Error("Server unreachable");
    }

    throw error;
  }
};

export const currentTop = (type) => apiFetch(`/leaderboard/current/${type}`);

export const addPoints = (score, selected) =>
  apiFetch(`/points/add/${selected}`, {
    method: "POST",
    headers: {
      Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({ score }),
  });

export const updatePoints = (type, payload) =>
  apiFetch(`/leaderboards/update/${type.toLowerCase()}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify(payload),
  });

export const getMe = (tokenType, accessToken) =>
  apiFetch("/get/me", {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

export const getToken = async (code) => {
  const result = await apiFetch("/get/token", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  window.localStorage.setItem("access_token", result.access_token);
  window.localStorage.setItem("token_type", result.token_type);

  return result;
};

export const historyTops = () => apiFetch("/leaderboard/history");

export const profile = () =>
  apiFetch("/profile", {
    headers: {
      Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("access_token")}`,
    },
  });
