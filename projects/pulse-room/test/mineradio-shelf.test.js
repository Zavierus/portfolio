import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const project = "projects/pulse-room";
const catalog = [
  { id: "beethoven-symphony-5-i", title: "Symphony No. 5", cover: "./assets/covers/beethoven.png" },
  { id: "bach-toccata-fugue-d-minor", title: "Toccata and Fugue", cover: "./assets/covers/bach.png" },
  { id: "debussy-clair-de-lune", title: "Clair de Lune", cover: "./assets/covers/debussy.png" },
  { id: "mozart-turkish-march", title: "Turkish March", cover: "./assets/covers/mozart.png" },
];

async function queueHelpers(playQueue) {
  const source = await readFile(
    `${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`,
    "utf8",
  );
  const helperSource = source.slice(0, source.indexOf("function syncPulseTrackSelection"));
  const runtime = { catalog: { all: catalog } };
  const context = {
    PulseRuntime: runtime,
    window: { PulseRuntime: runtime },
    playQueue,
    cloneSong: (track) => ({ ...track }),
  };
  vm.runInNewContext(helperSource, context);
  return context;
}

test("catalog seeding creates exactly four initial shelf and queue records", async () => {
  const context = await queueHelpers([]);
  const queue = context.ensurePulseCatalogQueue();
  assert.deepEqual(
    Array.from(queue, ({ id, cover }) => ({ id, cover })),
    catalog.map(({ id, cover }) => ({ id, cover })),
  );
});

test("selecting a bundled track preserves imported queue records", async () => {
  const local = { id: "local-field-recording", type: "local", cover: "data:image/png;base64,cover" };
  const existing = [...catalog.map((track) => ({ ...track })), local];
  const context = await queueHelpers(existing);

  const queue = context.ensurePulseCatalogQueue("bach-toccata-fugue-d-minor");

  assert.strictEqual(queue, existing);
  assert.equal(queue.at(-1), local);
  assert.equal(queue.length, 5);
});

test("the 3D shelf consumes queue covers without world-era metadata", async () => {
  const [manager, visualSettings] = await Promise.all([
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
    readFile(`${project}/src/mineradio/02-visual/04-visual-settings-persistence.js`, "utf8"),
  ]);
  const currentItems = manager.match(
    /function currentItems\s*\(\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*function makeRoundRect/,
  )?.[1] ?? "";

  assert.match(currentItems, /playQueue/);
  assert.match(currentItems, /pulseCatalogTracks/);
  assert.match(currentItems, /songCoverSrc/);
  assert.match(manager, /existingByIndex/);
  assert.doesNotMatch(currentItems, /worldId|pulseWorldFallbackCover|WORLD/);
  assert.match(visualSettings, /function hexToRgb/);
  assert.match(visualSettings, /function readableInkForHex/);
});

test("shelf cover loading accepts local assets and rejects remote origins", async () => {
  const source = await readFile(
    `${project}/src/mineradio/04-shelf/04-cover-api-helpers.js`,
    "utf8",
  );
  const images = [];
  class FakeImage {
    constructor() {
      images.push(this);
    }
  }
  const location = {
    href: "http://127.0.0.1:4173/projects/pulse-room/",
    origin: "http://127.0.0.1:4173",
  };
  const context = {
    Image: FakeImage,
    URL,
    location,
    window: { location },
  };
  vm.runInNewContext(source, context);

  let loaded = null;
  context.requestPulseShelfCover("./assets/covers/beethoven.png", (image) => {
    loaded = image;
  });
  assert.equal(images.length, 1);
  assert.equal(images[0].src, "./assets/covers/beethoven.png");
  images[0].onload();
  assert.equal(loaded, images[0]);

  let rejected = "pending";
  context.requestPulseShelfCover("https://example.com/remote.png", (image) => {
    rejected = image;
  });
  assert.equal(rejected, null);
  assert.equal(images.length, 1);
});

test("hidden queue rendering is deferred and flushed through the real panel renderer", async () => {
  const sync = await readFile(
    `${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`,
    "utf8",
  );
  assert.match(sync, /function isPlaylistPanelVisibleForRender/);
  assert.match(sync, /queuePanelDirty\s*=\s*true/);
  assert.match(sync, /renderQueuePanel\(opts\)/);
  assert.match(sync, /function flushDeferredQueuePanel/);
  assert.doesNotMatch(sync, /function safeRenderQueuePanel\(\)\s*\{\s*return true;\s*\}/);
});

test("the restored shell forwards pointer movement into the 3D shelf hover lifecycle", async () => {
  const [layout, shell, manager, sync, startup] = await Promise.all([
    readFile(`${project}/src/mineradio/04-shelf/00-layout-hover.js`, "utf8"),
    readFile(`${project}/src/mineradio/10-shell/02-peek-panels-upload.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`, "utf8"),
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
  ]);
  assert.match(shell, /addEventListener\(['"]pointermove['"]/);
  assert.match(shell, /updateShelfHoverCueFromPointer\(event\)/);
  assert.match(shell, /updateShelfCardHoverSelection\(event\)/);
  assert.match(manager, /__PULSE_ROOM_QA__\.shelf/);
  assert.match(manager, /groupVisible/);
  assert.match(manager, /coverReady/);
  assert.match(sync, /function initializePulseShelf/);
  assert.match(sync, /shelfManager\.setMode\(fx\.shelf\s*\|\|\s*['"]side['"]\)/);
  assert.match(sync, /shelfManager\.rebuild\(false\)/);
  assert.match(startup, /initializePulseShelf\(\)/);
  const cueGate = layout.match(
    /function canShowShelfHoverCueAt\s*\(e\)\s*\{([\s\S]*?)\n\}/,
  )?.[1] ?? "";
  assert.match(cueGate, /isShelfClickZone\(e\)/);
  assert.doesNotMatch(cueGate, /!shelfHoverCue\.guide/);
  assert.match(cueGate, /typeof visualGuideActive/);
});
