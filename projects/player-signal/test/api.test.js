import assert from "node:assert/strict";
import test from "node:test";

import { handleGamesRequest } from "../api/games.js";
import { handleReviewsRequest } from "../api/reviews.js";
import { createMemoryCache } from "../api/shared/cache.js";

function upstreamResponse(body, status = 200, headers = {}) {
  return { ok: status >= 200 && status < 300, status, headers: { get: (name) => headers[name.toLowerCase()] ?? null }, json: async () => structuredClone(body) };
}

test("game search returns narrowed cached catalog records", async () => {
  const catalog = [
    { appid: 275850, name: "No Man's Sky", last_modified: 1710000000 },
    { appid: 400, name: "Portal", last_modified: 1700000000 },
    { appid: 620, name: "Portal 2", last_modified: 1700000001 },
  ];
  const response = await handleGamesRequest(new Request("https://example.com/api/games?q=portal"), {
    loadIndex: async () => ({ games: catalog, cachedAt: "2026-08-11T00:00:00.000Z" }),
    allowedOrigins: ["https://portfolio.example"],
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.games.map((game) => game.appId), [400, 620]);
  assert.equal(body.games[0].id, "steam:400");
  assert.equal(body.cachedAt, "2026-08-11T00:00:00.000Z");
});

test("review proxy clamps pages, preserves cursor and removes author before response", async () => {
  let requestedUrl = "";
  const response = await handleReviewsRequest(new Request("https://example.com/api/reviews?appid=275850&language=english&cursor=next&count=500", { headers: { origin: "https://portfolio.example" } }), {
      fetchImpl: async (url) => {
      requestedUrl = String(url);
      return upstreamResponse({ success: 1, cursor: "after", reviews: [
        { recommendationid: "123", review: "Frame pacing is unstable.", timestamp_created: 1786406400, voted_up: false, votes_up: 4, language: "english", author: { steamid: "76561198000000000", persona_name: "player", playtime_forever: 7200 } },
        { recommendationid: "short", review: "e", timestamp_created: 1786406400, voted_up: true, votes_up: 0, language: "english", author: { steamid: "76561198000000001", playtime_forever: 1 } },
      ] });
    },
    cache: createMemoryCache(),
    salt: "server-side-test-salt",
    allowedOrigins: ["https://portfolio.example"],
  });
  const body = await response.json();
  assert.match(requestedUrl, /num_per_page=100/);
  assert.equal(body.nextCursor, "after");
  assert.equal(body.reviews.length, 1);
  assert.equal(body.reviews[0].playtimeMinutes, 7200);
  assert.match(body.reviews[0].reviewIdHash, /^[a-f0-9]{64}$/);
  assert.equal("author" in body.reviews[0], false);
  assert.doesNotMatch(JSON.stringify(body), /76561198000000000|persona_name|steamid/);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://portfolio.example");
});

test("review cache prevents duplicate upstream requests", async () => {
  let calls = 0;
  const cache = createMemoryCache();
  const dependencies = {
    fetchImpl: async () => { calls += 1; return upstreamResponse({ success: 1, cursor: "done", reviews: [] }); },
    cache,
    salt: "server-side-test-salt",
  };
  const request = new Request("https://example.com/api/reviews?appid=275850&count=20");
  await handleReviewsRequest(request, dependencies);
  await handleReviewsRequest(request, dependencies);
  assert.equal(calls, 1);
});

test("upstream failures expose bounded error codes and retry metadata", async () => {
  const response = await handleReviewsRequest(new Request("https://example.com/api/reviews?appid=275850"), {
    fetchImpl: async () => upstreamResponse({ error: "limited" }, 429, { "retry-after": "17" }),
    cache: createMemoryCache(),
    salt: "server-side-test-salt",
  });
  const body = await response.json();
  assert.equal(response.status, 429);
  assert.equal(body.error.code, "upstream-rate-limited");
  assert.equal(body.error.retryAfterSeconds, 17);
  assert.equal("upstreamBody" in body.error, false);
});

test("malformed requests and disallowed origins fail without calling upstream", async () => {
  let calls = 0;
  const response = await handleReviewsRequest(new Request("https://example.com/api/reviews?appid=not-a-number", { headers: { origin: "https://evil.example" } }), {
    fetchImpl: async () => { calls += 1; return upstreamResponse({}); },
    cache: createMemoryCache(),
    salt: "server-side-test-salt",
    allowedOrigins: ["https://portfolio.example"],
  });
  assert.equal(response.status, 403);
  assert.equal(calls, 0);
});
