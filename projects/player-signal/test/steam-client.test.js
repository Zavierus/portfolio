import assert from "node:assert/strict";
import test from "node:test";

import { parseReviewCsv } from "../src/data/csv-import.js";
import { createSteamClient, loadPreferredDataset, SteamSourceError } from "../src/data/steam-client.js";

function response(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => structuredClone(body),
  };
}

test("game search normalizes the query and returns narrowed records", async () => {
  const requests = [];
  const client = createSteamClient({
    fetchImpl: async (url) => {
      requests.push(String(url));
      return response({ games: [{ id: "steam:275850", appId: 275850, name: "No Man's Sky" }], cachedAt: "2026-08-11T00:00:00.000Z" });
    },
  });
  const result = await client.searchGames("  No   Man's   Sky  ");

  assert.match(requests[0], /\/api\/games\?q=No\+Man%27s\+Sky/);
  assert.equal(result.games[0].appId, 275850);
  assert.equal(result.query, "No Man's Sky");
});

test("review paging preserves cursors and rejects identity-bearing responses", async () => {
  const calls = [];
  const client = createSteamClient({
    fetchImpl: async (url) => {
      calls.push(String(url));
      return response({
        reviews: [{ reviewIdHash: "a".repeat(64), text: "Frame pacing is unstable." }],
        nextCursor: "next cursor",
        source: { provider: "steam-public-reviews", retrievedAt: "2026-08-11T00:00:00.000Z" },
      });
    },
  });
  const result = await client.fetchReviews({ appId: 275850, language: "english", cursor: "*", count: 250 });
  assert.match(calls[0], /count=100/);
  assert.equal(result.nextCursor, "next cursor");

  const unsafeClient = createSteamClient({
    fetchImpl: async () => response({ reviews: [{ steamid: "76561198000000000" }] }),
  });
  await assert.rejects(() => unsafeClient.fetchReviews({ appId: 275850 }), /identity field/i);
});

test("source errors retain retry metadata and remain recoverable", async () => {
  const client = createSteamClient({
    fetchImpl: async () => response({ error: "rate limited" }, { status: 429, headers: { "retry-after": "12" } }),
  });
  await assert.rejects(
    () => client.searchGames("Portal"),
    (error) => error instanceof SteamSourceError && error.status === 429 && error.retryAfterSeconds === 12 && error.recoverable,
  );
});

test("preferred loading falls back to the offline dataset without hiding the reason", async () => {
  const result = await loadPreferredDataset({
    liveLoader: async () => { throw new SteamSourceError("upstream unavailable", { status: 503 }); },
    demoLoader: async () => ({ mode: "offline-demo", game: { id: "steam:275850" } }),
  });
  assert.equal(result.dataset.mode, "offline-demo");
  assert.equal(result.fallback.used, true);
  assert.match(result.fallback.reason, /upstream unavailable/);
});

test("connector capability turns static HTML responses into an unavailable state", async () => {
  const client = createSteamClient({
    baseUrl: "https://portfolio.test",
    fetchImpl: async () => new Response("<!doctype html><title>portfolio</title>", { status: 200, headers: { "content-type": "text/html" } }),
  });

  const capability = await client.checkAvailability();
  assert.equal(capability.available, false);
  assert.equal(capability.reason, "not-deployed");
});

test("connector capability reports a valid same-origin adapter", async () => {
  const client = createSteamClient({
    baseUrl: "https://portfolio.test",
    fetchImpl: async () => Response.json({ query: "No Man's Sky", games: [{ appId: 275850, name: "No Man's Sky" }], cachedAt: "2026-08-12T00:00:00.000Z" }),
  });

  const capability = await client.checkAvailability();
  assert.equal(capability.available, true);
  assert.equal(capability.sampleGame.appId, 275850);
});

test("CSV import validates rows and reports field paths without identity columns", () => {
  const source = {
    provider: "csv-import",
    url: "https://local.invalid/import",
    retrievedAt: "2026-08-11T00:00:00.000Z",
  };
  const csv = [
    "reviewIdHash,text,createdAt,recommended,playtimeMinutes,helpfulVotes,language",
    `${"a".repeat(64)},\"Frame pacing, especially in settlements, is unstable.\",2026-08-10T12:00:00.000Z,false,7200,3,english`,
    `${"b".repeat(64)},Too short,not-a-date,true,-1,0,english`,
  ].join("\n");
  const result = parseReviewCsv(csv, source);

  assert.equal(result.records.length, 1);
  assert.ok(result.errors.some((error) => error.path === "rows[3].createdAt"));
  assert.ok(result.errors.some((error) => error.path === "rows[3].playtimeMinutes"));
  assert.throws(() => parseReviewCsv("steamid,text\n123,test", source), /identity field/i);
});
