import { anonymizeSteamReview } from "./shared/anonymize.js";
import { createMemoryCache } from "./shared/cache.js";
import { errorResponse, isAllowedOrigin, jsonResponse } from "./shared/response.js";

const defaultCache = createMemoryCache();

export async function handleReviewsRequest(request, dependencies = {}) {
  const allowedOrigins = dependencies.allowedOrigins ?? [];
  if (!isAllowedOrigin(request, allowedOrigins)) return errorResponse(request, "origin-not-allowed", "Origin is not allowed", { status: 403, allowedOrigins });
  const parameters = new URL(request.url).searchParams; const appId = Number(parameters.get("appid"));
  if (!Number.isInteger(appId) || appId <= 0) return errorResponse(request, "invalid-appid", "A positive Steam AppID is required", { status: 400, allowedOrigins });
  const salt = dependencies.salt ?? process.env.PLAYER_SIGNAL_REVIEW_SALT;
  if (!salt) return errorResponse(request, "server-misconfigured", "Review anonymization is unavailable", { status: 503, allowedOrigins });
  const language = String(parameters.get("language") ?? "english"); const cursor = String(parameters.get("cursor") ?? "*"); const count = Math.min(100, Math.max(1, Number(parameters.get("count")) || 100));
  const cache = dependencies.cache ?? defaultCache; const cacheKey = `${appId}:${language}:${cursor}:${count}`; const cached = cache.get(cacheKey);
  if (cached) return jsonResponse(request, cached, { allowedOrigins, cacheControl: "private, max-age=60" });
  const upstreamUrl = new URL(`https://store.steampowered.com/appreviews/${appId}`); upstreamUrl.searchParams.set("json", "1"); upstreamUrl.searchParams.set("filter", "recent"); upstreamUrl.searchParams.set("language", language); upstreamUrl.searchParams.set("review_type", "all"); upstreamUrl.searchParams.set("purchase_type", "all"); upstreamUrl.searchParams.set("num_per_page", String(count)); upstreamUrl.searchParams.set("cursor", cursor);
  let response;
  try { response = await (dependencies.fetchImpl ?? fetch)(upstreamUrl, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15_000) }); }
  catch { return errorResponse(request, "upstream-timeout", "Steam reviews did not respond in time", { status: 504, allowedOrigins }); }
  if (!response.ok) { const retryAfterSeconds = Number.parseInt(response.headers?.get?.("retry-after") ?? "", 10); const rateLimited = response.status === 429; return errorResponse(request, rateLimited ? "upstream-rate-limited" : "upstream-unavailable", rateLimited ? "Steam review requests are temporarily limited" : "Steam reviews are temporarily unavailable", { status: rateLimited ? 429 : 502, allowedOrigins, retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null }); }
  let upstream; try { upstream = await response.json(); } catch { return errorResponse(request, "invalid-upstream-json", "Steam returned invalid review data", { status: 502, allowedOrigins }); }
  if (!upstream?.success || !Array.isArray(upstream.reviews)) return errorResponse(request, "invalid-upstream-contract", "Steam returned an unexpected review response", { status: 502, allowedOrigins });
  const reviews = (await Promise.all(upstream.reviews.map((review) => anonymizeSteamReview(review, salt))))
    .filter((review) => review.text.trim().length >= 4);
  const retrievedAt = new Date().toISOString();
  const body = { reviews, nextCursor: String(upstream.cursor ?? ""), source: { provider: "steam-public-reviews", url: upstreamUrl.href, retrievedAt }, page: { count: reviews.length, requested: count } };
  cache.set(cacheKey, body, 300_000); return jsonResponse(request, body, { allowedOrigins, cacheControl: "private, max-age=60" });
}
