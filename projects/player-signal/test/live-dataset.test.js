import assert from "node:assert/strict";
import test from "node:test";

import { loadLiveSteamDataset } from "../src/data/live-dataset.js";

function anonymousReview(index) {
  return {
    reviewIdHash: index.toString(16).padStart(64, "0"),
    text: `Review ${index} contains enough useful words for analysis.`,
    createdAt: "2026-08-12T00:00:00.000Z",
    recommended: index % 2 === 0,
    playtimeMinutes: 1200,
    helpfulVotes: 0,
    language: "english",
  };
}

test("live loader follows cursors and creates the offline-compatible dataset envelope", async () => {
  const pages = [
    { reviews: [anonymousReview(1), anonymousReview(2)], nextCursor: "page-2", source: { provider: "steam-public-reviews", url: "https://store.steampowered.com/appreviews/70", retrievedAt: "2026-08-12T00:00:00.000Z" } },
    { reviews: [anonymousReview(3)], nextCursor: "", source: { provider: "steam-public-reviews", url: "https://store.steampowered.com/appreviews/70", retrievedAt: "2026-08-12T00:01:00.000Z" } },
  ];
  const cursors = [];
  const client = {
    async fetchReviews(parameters) {
      cursors.push(parameters.cursor);
      return pages.shift();
    },
  };

  const dataset = await loadLiveSteamDataset(client, { appId: 70, name: "Half-Life" }, { limit: 500, pageSize: 100 });

  assert.deepEqual(cursors, ["*", "page-2"]);
  assert.equal(dataset.mode, "live");
  assert.equal(dataset.game.id, "steam:70");
  assert.equal(dataset.reviews.length, 3);
  assert.equal(dataset.versions.length, 0);
  assert.equal(dataset.partial, false);
  assert.equal(dataset.reviews[0].source.provider, "steam-public-reviews");
  assert.equal(Object.isFrozen(dataset), true);
});

test("live loader stops at its hard review budget", async () => {
  let calls = 0;
  const client = {
    async fetchReviews() {
      calls += 1;
      return {
        reviews: Array.from({ length: 100 }, (_, index) => anonymousReview((calls - 1) * 100 + index + 1)),
        nextCursor: `page-${calls + 1}`,
        source: { provider: "steam-public-reviews", url: "https://store.steampowered.com/appreviews/70", retrievedAt: "2026-08-12T00:00:00.000Z" },
      };
    },
  };

  const dataset = await loadLiveSteamDataset(client, { appId: 70, name: "Half-Life" }, { limit: 250, pageSize: 100 });
  assert.equal(calls, 3);
  assert.equal(dataset.reviews.length, 250);
});

test("later page failure returns a clearly marked partial dataset", async () => {
  let calls = 0;
  const client = {
    async fetchReviews() {
      calls += 1;
      if (calls === 2) throw new Error("rate limited");
      return {
        reviews: [anonymousReview(1)],
        nextCursor: "page-2",
        source: { provider: "steam-public-reviews", url: "https://store.steampowered.com/appreviews/70", retrievedAt: "2026-08-12T00:00:00.000Z" },
      };
    },
  };

  const dataset = await loadLiveSteamDataset(client, { appId: 70, name: "Half-Life" });
  assert.equal(dataset.partial, true);
  assert.match(dataset.partialReason, /rate limited/);
  assert.equal(dataset.reviews.length, 1);
});

test("first page failure remains a hard error", async () => {
  const client = { async fetchReviews() { throw new Error("unavailable"); } };
  await assert.rejects(() => loadLiveSteamDataset(client, { appId: 70, name: "Half-Life" }), /unavailable/);
});
