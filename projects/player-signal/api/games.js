import { errorResponse, isAllowedOrigin, jsonResponse } from "./shared/response.js";

function normalize(value) { return String(value ?? "").trim().replace(/\s+/g, " "); }

export async function handleGamesRequest(request, dependencies = {}) {
  const allowedOrigins = dependencies.allowedOrigins ?? [];
  if (!isAllowedOrigin(request, allowedOrigins)) return errorResponse(request, "origin-not-allowed", "Origin is not allowed", { status: 403, allowedOrigins });
  const query = normalize(new URL(request.url).searchParams.get("q"));
  if (query.length < 2) return errorResponse(request, "invalid-query", "Search requires at least two characters", { status: 400, allowedOrigins });
  try {
    const index = await dependencies.loadIndex(); const lowered = query.toLocaleLowerCase("en-US");
    const games = index.games.filter((game) => String(game.name).toLocaleLowerCase("en-US").includes(lowered)).sort((left, right) => { const leftName = left.name.toLocaleLowerCase("en-US"); const rightName = right.name.toLocaleLowerCase("en-US"); return Number(rightName.startsWith(lowered)) - Number(leftName.startsWith(lowered)) || leftName.localeCompare(rightName); }).slice(0, 12).map((game) => ({ id: `steam:${game.appid}`, appId: Number(game.appid), name: game.name, lastModified: game.last_modified ?? null }));
    return jsonResponse(request, { query, games, cachedAt: index.cachedAt }, { allowedOrigins, cacheControl: "public, max-age=300" });
  } catch { return errorResponse(request, "catalog-unavailable", "The cached Steam catalog is unavailable", { status: 503, allowedOrigins }); }
}

export async function fetchSteamGameIndexPage({ fetchImpl = fetch, key, lastAppId = 0 }) {
  if (!key) throw new Error("STEAM_WEB_API_KEY is required on the server");
  const url = new URL("https://api.steampowered.com/IStoreService/GetAppList/v1/"); url.searchParams.set("key", key); url.searchParams.set("include_games", "true"); url.searchParams.set("max_results", "50000"); if (lastAppId) url.searchParams.set("last_appid", String(lastAppId));
  const response = await fetchImpl(url); if (!response.ok) throw new Error(`Steam catalog returned HTTP ${response.status}`); const body = await response.json(); return body.response;
}
