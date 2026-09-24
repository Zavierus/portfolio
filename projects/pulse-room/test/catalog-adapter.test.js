import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { adaptCatalogTrack, createCatalogAdapter } from "../src/pulse/catalog-adapter.js";
import { createCoverFallback } from "../src/pulse/cover-fallback.js";

const manifestTrack = Object.freeze({
  id: "test-track",
  title: "Test Track",
  artist: "Test Artist",
  composer: "Test Composer",
  duration: 180,
  bpm: 120,
  catalogRole: "atmospheric-trip-hop",
  runtime: Object.freeze({ url: "./assets/music/runtime/test-track.mp3" }),
  analysis: Object.freeze({ url: "./assets/music/analysis/test-track.json" }),
  cover: Object.freeze({ url: "./assets/covers/test-track.png" }),
  license: Object.freeze({ id: "CC-BY-3.0", url: "https://creativecommons.org/licenses/by/3.0/" }),
  attribution: "Test attribution",
  source: Object.freeze({ page: "https://commons.wikimedia.org/wiki/File:Test.ogg" }),
});

test("catalog adapter returns an immutable local Mineradio record", () => {
  const track = adaptCatalogTrack(manifestTrack);
  assert.deepEqual(
    Object.keys(track),
    [
      "id", "title", "name", "artist", "composer", "album", "duration",
      "bpm", "url", "cover", "analysisUrl", "source", "local", "license",
      "attribution", "sourcePage", "revoke",
    ],
  );
  assert.equal(track.source, "local");
  assert.equal(track.local, false);
  assert.equal(track.cover, "./assets/covers/test-track.png");
  assert.equal(Object.isFrozen(track), true);
  for (const forbidden of ["worldId", "style", "theme", "catalogRole", "particleProgram", "presentationMode"]) {
    assert.equal(Object.hasOwn(track, forbidden), false);
  }
});

test("catalog adapter exposes one immutable collection and stable ID lookup", () => {
  const record = adaptCatalogTrack(manifestTrack);
  const catalog = createCatalogAdapter({ tracks: [record] });
  assert.equal(catalog.all.length, 1);
  assert.equal(catalog.byId("test-track"), record);
  assert.equal(catalog.byId("missing"), null);
  assert.deepEqual(catalog.adapt(manifestTrack), record);
  assert.equal(Object.isFrozen(catalog.all), true);
});

test("cover fallback is deterministic and does not use random state", async () => {
  const source = await readFile("projects/pulse-room/src/pulse/cover-fallback.js", "utf8");
  assert.doesNotMatch(source, /Math\.random/);

  function fakeDocument() {
    const operations = [];
    const gradient = { addColorStop: (...args) => operations.push(["stop", ...args]) };
    const context = new Proxy({
      operations,
      createLinearGradient: (...args) => (operations.push(["gradient", ...args]), gradient),
    }, {
      get(target, key) {
        if (key in target) return target[key];
        return (...args) => operations.push([key, ...args]);
      },
      set(target, key, value) {
        operations.push(["set", key, value]);
        target[key] = value;
        return true;
      },
    });
    return {
      operations,
      createElement(tag) {
        assert.equal(tag, "canvas");
        return { width: 0, height: 0, getContext: () => context };
      },
    };
  }

  const first = fakeDocument();
  const second = fakeDocument();
  const bands = { low: 0.72, mid: 0.38, high: 0.61 };
  const firstCanvas = createCoverFallback("test-track", bands, first);
  const secondCanvas = createCoverFallback("test-track", bands, second);
  assert.equal(firstCanvas.width, 512);
  assert.equal(firstCanvas.height, 512);
  assert.deepEqual(first.operations, second.operations);
  assert.ok(first.operations.length >= 24);
});
