import { assertNoIdentityFields } from "./privacy.js";

export class SteamSourceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "SteamSourceError";
    this.status = options.status ?? 0;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.recoverable = options.recoverable ?? true;
    this.code = options.code ?? "steam-source-error";
  }
}

function normalizedQuery(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

async function readResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    throw new SteamSourceError("The Steam adapter returned invalid JSON", { status: response.status, code: "invalid-json" });
  }
  if (!response.ok) {
    const retryAfter = Number.parseInt(response.headers?.get?.("retry-after") ?? "", 10);
    throw new SteamSourceError(body?.error ?? `The Steam adapter returned HTTP ${response.status}`, {
      status: response.status,
      retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : null,
      code: response.status === 429 ? "rate-limited" : "upstream-error",
    });
  }
  assertNoIdentityFields(body);
  return body;
}

export function createSteamClient(options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const baseUrl = options.baseUrl ?? "http://player-signal.local";
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required");

  return Object.freeze({
    async checkAvailability(requestOptions = {}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2_500);
      try {
        const result = await this.searchGames("No Man's Sky", { ...requestOptions, signal: controller.signal });
        return Object.freeze({ available: true, reason: null, sampleGame: result.games[0] ?? null, checkedAt: new Date().toISOString() });
      } catch (error) {
        const notDeployed = error instanceof SteamSourceError && ["invalid-json", "invalid-contract"].includes(error.code);
        return Object.freeze({
          available: false,
          reason: notDeployed || error?.status === 404 || error?.name === "AbortError" ? "not-deployed" : error?.code ?? "connector-unavailable",
          sampleGame: null,
          checkedAt: new Date().toISOString(),
        });
      } finally {
        clearTimeout(timeout);
      }
    },
    async searchGames(query, requestOptions = {}) {
      const normalized = normalizedQuery(query);
      if (normalized.length < 2) throw new TypeError("Game search requires at least two characters");
      const url = new URL("/api/games", baseUrl);
      url.searchParams.set("q", normalized);
      const response = await fetchImpl(url, { signal: requestOptions.signal, headers: { accept: "application/json" } });
      const body = await readResponse(response);
      if (!Array.isArray(body.games)) throw new SteamSourceError("The game search response is missing games", { code: "invalid-contract" });
      return Object.freeze({ query: normalized, games: Object.freeze(structuredClone(body.games)), cachedAt: body.cachedAt ?? null });
    },

    async fetchReviews(parameters, requestOptions = {}) {
      const appId = Number(parameters?.appId);
      if (!Number.isInteger(appId) || appId <= 0) throw new TypeError("A positive Steam AppID is required");
      const url = new URL("/api/reviews", baseUrl);
      url.searchParams.set("appid", String(appId));
      url.searchParams.set("language", normalizedQuery(parameters.language ?? "english"));
      url.searchParams.set("cursor", String(parameters.cursor ?? "*"));
      url.searchParams.set("count", String(Math.min(100, Math.max(1, Number(parameters.count) || 100))));
      const response = await fetchImpl(url, { signal: requestOptions.signal, headers: { accept: "application/json" } });
      const body = await readResponse(response);
      if (!Array.isArray(body.reviews)) throw new SteamSourceError("The review response is missing reviews", { code: "invalid-contract" });
      return Object.freeze(structuredClone(body));
    },
  });
}

export async function loadPreferredDataset({ liveLoader, demoLoader }) {
  try {
    return Object.freeze({ dataset: await liveLoader(), fallback: Object.freeze({ used: false, reason: null }) });
  } catch (error) {
    const dataset = await demoLoader();
    return Object.freeze({
      dataset,
      fallback: Object.freeze({ used: true, reason: error instanceof Error ? error.message : String(error) }),
    });
  }
}
