import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { assertNoIdentityFields } from "../src/data/privacy.js";
import { loadDemoDataset, loadOfflineCaseCatalog } from "../src/data/demo-adapter.js";
import { validateDataset } from "../src/domain/validators.js";

const dataRoot = new URL("../data/", import.meta.url);

test("offline demo publishes a provenance-complete No Man's Sky sample", async () => {
  const [gameDocument, reviewDocument, versionDocument, readme] = await Promise.all([
    readFile(new URL("demo-game.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("demo-reviews.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("demo-versions.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("README.md", dataRoot), "utf8"),
  ]);

  assert.equal(gameDocument.game.appId, 275850);
  assert.equal(gameDocument.game.name, "No Man's Sky");
  assert.equal(reviewDocument.language, "english");
  assert.ok(reviewDocument.reviews.length >= 3_000);
  assert.ok(reviewDocument.reviews.length <= 5_000);
  assert.ok(Number.isFinite(Date.parse(reviewDocument.source.retrievedAt)));
  assert.match(reviewDocument.source.url, /^https:\/\/store\.steampowered\.com\/appreviews\/275850/);
  assert.ok(versionDocument.versions.length >= 3);
  assert.match(readme, /Steam public reviews/i);
  assert.match(readme, /removed fields/i);
  assert.match(readme, /SteamID/i);

  assertNoIdentityFields(gameDocument);
  assertNoIdentityFields(reviewDocument);
  assertNoIdentityFields(versionDocument);
  const serialized = JSON.stringify(reviewDocument);
  assert.doesNotMatch(serialized, /7656119\d{10}/);
  assert.doesNotMatch(serialized, /steamcommunity\.com\/(?:id|profiles)\//i);
});

test("demo adapter returns the same validated dataset envelope used by live data", async () => {
  const fileFetch = async (url) => ({
    ok: true,
    json: async () => JSON.parse(await readFile(new URL(`../${String(url).replace(/^\.\//, "")}`, import.meta.url), "utf8")),
  });
  const dataset = await loadDemoDataset(fileFetch);
  const validation = validateDataset(dataset);

  assert.equal(validation.ok, true, JSON.stringify(validation.errors, null, 2));
  assert.equal(dataset.mode, "offline-demo");
  assert.equal(dataset.game.id, "steam:275850");
  assert.equal(dataset.reviews.length >= 3_000, true);
  assert.equal(dataset.source.provider, "steam-public-reviews");
  assert.ok(Object.isFrozen(dataset));
  assert.ok(Object.isFrozen(dataset.reviews));
});

test("offline case catalog publishes eight validated classic game cases", async () => {
  const fileFetch = async (url) => ({
    ok: true,
    json: async () => JSON.parse(await readFile(new URL(`../${String(url).replace(/^\.\//, "")}`, import.meta.url), "utf8")),
  });
  const cases = await loadOfflineCaseCatalog(fileFetch);
  assert.equal(cases.length, 8);
  assert.deepEqual(cases.map((item) => item.game.name), [
    "Portal 2",
    "The Witcher 3: Wild Hunt",
    "Hades",
    "Stardew Valley",
    "Slay the Spire",
    "Disco Elysium",
    "Hollow Knight",
    "Outer Wilds",
  ]);
  for (const dataset of cases) {
    assert.equal(dataset.mode, "offline-case");
    assert.ok(dataset.reviews.length >= 3);
    assert.ok(dataset.provenance.roles.length >= 2);
    assert.ok(Object.isFrozen(dataset));
    assert.equal(validateDataset(dataset).ok, true);
    assertNoIdentityFields(dataset);
  }
});
