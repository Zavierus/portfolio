import { createGameRecord, createReviewRecord } from "../domain/schemas.js";

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function steamStoreUrl(appId) {
  return `https://store.steampowered.com/app/${appId}/`;
}

export async function loadLiveSteamDataset(client, game, options = {}) {
  if (!client || typeof client.fetchReviews !== "function") throw new TypeError("A Steam review client is required");
  const appId = Number(game?.appId);
  if (!Number.isInteger(appId) || appId <= 0 || !String(game?.name ?? "").trim()) throw new TypeError("A Steam game result is required");
  const limit = Math.min(500, Math.max(1, Number(options.limit) || 500));
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 100));
  const reviews = [];
  const visitedCursors = new Set();
  let cursor = "*";
  let firstSource = null;
  let partial = false;
  let partialReason = null;

  while (reviews.length < limit && cursor && !visitedCursors.has(cursor)) {
    visitedCursors.add(cursor);
    let page;
    try {
      page = await client.fetchReviews({
        appId,
        language: options.language ?? "english",
        cursor,
        count: Math.min(pageSize, limit - reviews.length),
      }, { signal: options.signal });
    } catch (error) {
      if (reviews.length === 0) throw error;
      partial = true;
      partialReason = error instanceof Error ? error.message : String(error);
      break;
    }
    firstSource ??= page.source;
    for (const review of page.reviews ?? []) {
      if (reviews.length >= limit) break;
      reviews.push(createReviewRecord({ ...review, source: page.source }));
    }
    const nextCursor = String(page.nextCursor ?? "");
    if (!nextCursor || nextCursor === cursor || (page.reviews ?? []).length === 0) break;
    cursor = nextCursor;
  }

  if (!firstSource) throw new Error("Steam returned no review source metadata");
  const storeUrl = steamStoreUrl(appId);
  const gameRecord = createGameRecord({
    id: `steam:${appId}`,
    appId,
    name: String(game.name).trim(),
    storeUrl,
    capsuleUrl: game.capsuleUrl ?? null,
    source: {
      provider: "steam-catalog",
      url: storeUrl,
      retrievedAt: firstSource.retrievedAt,
    },
  });

  return deepFreeze({
    schemaVersion: 1,
    mode: "live",
    game: gameRecord,
    reviews,
    versions: [],
    source: firstSource,
    partial,
    partialReason,
    pageCount: visitedCursors.size,
  });
}
