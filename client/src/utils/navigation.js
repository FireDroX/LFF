const ROUTES = new Set([
  "leaderboards",
  "profile",
  "rewards",
  "commands",
  "dashboard",
]);

function normalizeRoute(value) {
  const route = String(value || "").trim().toLowerCase();
  return route === "weekly" || !ROUTES.has(route)
    ? "leaderboards"
    : route;
}

export function getCurrentRoute() {
  const [segment] = window.location.pathname.split("/").filter(Boolean);
  return normalizeRoute(segment);
}

export function normalizeCurrentLocation() {
  const url = new URL(window.location.href);
  const legacyRoute = url.searchParams.get("p");
  const currentRoute = legacyRoute
    ? normalizeRoute(legacyRoute)
    : getCurrentRoute();
  const canonicalPath = `/${currentRoute}`;

  url.searchParams.delete("p");
  if (
    url.pathname !== canonicalPath ||
    legacyRoute !== null
  ) {
    url.pathname = canonicalPath;
    window.history.replaceState({}, "", url);
  }
}

export function navigateTo(route) {
  const url = new URL(window.location.href);
  url.pathname = `/${normalizeRoute(route)}`;
  url.searchParams.delete("p");
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
