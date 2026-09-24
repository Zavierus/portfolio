import assert from "node:assert/strict";
import test from "node:test";

import { assertNoIdentityFields, hashReviewIdentity } from "../src/data/privacy.js";

test("identity scanning rejects Steam and profile fields at any depth", () => {
  for (const unsafe of [
    { steamid: "76561198000000000" },
    { author: { name: "player" } },
    { evidence: [{ personaName: "player" }] },
    { profile_url: "https://steamcommunity.com/id/player" },
    { nested: { avatarFull: "https://cdn.example/avatar.jpg" } },
  ]) {
    assert.throws(() => assertNoIdentityFields(unsafe), /identity field/i);
  }
});

test("identity scanning accepts the narrowed anonymous contract", () => {
  assert.doesNotThrow(() =>
    assertNoIdentityFields({
      reviewIdHash: "a".repeat(64),
      text: "The frame pacing became unstable after the update.",
      source: { provider: "steam", url: "https://store.steampowered.com/app/275850" },
    }),
  );
});

test("review identity hashing is deterministic, salted and irreversible-shaped", async () => {
  const first = await hashReviewIdentity("recommendation-123", "player-signal-demo-v1");
  const repeated = await hashReviewIdentity("recommendation-123", "player-signal-demo-v1");
  const differentSalt = await hashReviewIdentity("recommendation-123", "another-salt");

  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, repeated);
  assert.notEqual(first, differentSalt);
  assert.doesNotMatch(first, /recommendation-123/);
});

test("review identity hashing requires a value and salt", async () => {
  await assert.rejects(() => hashReviewIdentity("", "salt"), /value/i);
  await assert.rejects(() => hashReviewIdentity("value", ""), /salt/i);
});
