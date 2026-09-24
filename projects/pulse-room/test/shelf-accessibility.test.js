import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createCatalogSelectionController } from "../src/pulse/catalog-selector.js";

const project = "projects/pulse-room";
const catalog = [
  { id: "kai-engel-anxiety" },
  { id: "epsilon-not-other-side-of-the-wave" },
  { id: "graham-bole-kirigami" },
  { id: "revolution-void-effects-of-elevation" },
];

test("the shared selector commits only the latest completed track selection", async () => {
  const pending = new Map();
  const changes = [];
  const focused = [];
  const selection = createCatalogSelectionController({
    catalog,
    onSelect(track) {
      return new Promise((resolve) => pending.set(track.id, resolve));
    },
    onFocus(track) {
      focused.push(track.id);
    },
  });
  selection.subscribe((track) => changes.push(track.id));

  const first = selection.select(catalog[1].id, {
    origin: "list",
    userInitiated: true,
  });
  const second = selection.select(catalog[3].id, {
    origin: "list",
    userInitiated: true,
  });
  pending.get(catalog[3].id)(true);
  assert.equal(await second, true);
  pending.get(catalog[1].id)(true);
  assert.equal(await first, false);

  assert.equal(selection.selectedId, catalog[3].id);
  assert.deepEqual(changes, [catalog[0].id, catalog[3].id]);
  assert.deepEqual(focused, [catalog[3].id]);
});

test("shelf and list can share one handler without mutating catalog order", async () => {
  const selected = [];
  const focused = [];
  const selection = createCatalogSelectionController({
    catalog,
    onSelect(track, detail) {
      selected.push([track.id, detail.origin]);
      return true;
    },
    onFocus(track) {
      focused.push(track.id);
    },
  });

  await selection.select(catalog[2].id, { origin: "shelf" });
  await selection.select(catalog[0].id, { origin: "programmatic" });
  await selection.select(catalog[1].id, { origin: "list", userInitiated: true });
  assert.deepEqual(selected, [
    [catalog[2].id, "shelf"],
    [catalog[0].id, "programmatic"],
    [catalog[1].id, "list"],
  ]);
  assert.deepEqual(focused, [catalog[1].id]);
  assert.deepEqual(selection.catalog.map(({ id }) => id), catalog.map(({ id }) => id));
});

test("the faithful shell exposes inert local queue surfaces before runtime", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  assert.match(
    html,
    /<aside\b[^>]*id=["']playlist-panel["'][^>]*aria-hidden=["']true["'][^>]*\binert\b/is,
  );
  assert.match(html, /id=["']queue-list["'][^>]*class=["']queue-list["']/i);
  assert.match(html, /id=["']mini-queue-list["'][^>]*class=["']mini-queue-list["']/i);
  assert.match(html, /id=["']mini-queue-btn["'][^>]*aria-expanded=["']false["']/i);
});

test("desktop shelf and mobile queue share one catalog selection controller", async () => {
  const [html, css, manager, sync, renderer] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/styles/index.css`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`, "utf8"),
    readFile(`${project}/src/mineradio/01-scene/00-renderer-quality.js`, "utf8"),
  ]);

  assert.match(html, /id=["']playlist-panel["']/i);
  assert.match(html, /id=["']queue-list["']/i);
  assert.match(html, /id=["']mini-queue-btn["'][^>]*aria-label=["']打开当前队列["']/i);
  assert.match(html, /id=["']splash-wordmark["'][^>]*aria-label=["']PULSE ROOM["']/is);
  assert.match(css, /#playlist-panel\s*\{/);
  assert.match(css, /#mini-queue-popover\s*\{/);

  assert.match(manager, /playQueue/);
  assert.match(sync, /PulseRuntime\.catalog/);
  assert.match(manager, /kind:\s*['"]selectPulseTrack['"]/);
  assert.match(manager, /__PULSE_ROOM_QA__\.selectShelfTrack/);
  assert.match(manager, /shelfManager\.triggerAction/);
  assert.match(sync, /function selectPulseTrack\s*\(/);
  assert.match(sync, /playQueueAt\s*\(/);
  assert.match(sync, /syncPulseTrackSelection\s*\(/);
  assert.match(sync, /focus\(\s*\)/);
  assert.doesNotMatch(renderer, /domElement\.tabIndex\s*=\s*0/);
});

test("queue panels stay hidden and inert until opened", async () => {
  const [html, css, queueShell] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/styles/index.css`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/18-playlist-panel-shell.js`, "utf8"),
  ]);
  assert.match(
    html,
    /id=["']playlist-panel["'][^>]*aria-hidden=["']true["'][^>]*\binert\b/is,
  );
  assert.match(
    html,
    /id=["']mini-queue-popover["'][^>]*aria-hidden=["']true["'][^>]*\binert\b/is,
  );
  assert.match(css, /#playlist-panel\s*\{[^}]*opacity:\s*0/is);
  assert.match(css, /#playlist-panel\.show[\s\S]*opacity:\s*1/i);
  assert.match(queueShell, /pop\.setAttribute\(['"]aria-hidden['"],\s*miniQueueOpen\s*\?\s*['"]false['"]\s*:\s*['"]true['"]\)/);
  assert.match(queueShell, /pop\.inert\s*=\s*!miniQueueOpen/);
});

test("reachable queue uses catalog actions and exposes no service pane", async () => {
  const [html, manager] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
  ]);

  assert.match(html, /\bid=["']playlist-panel["']/i);
  assert.doesNotMatch(html, /\bid=["'](?:pl-pane|podcast-pane)["']/i);
  const currentItems = manager.match(
    /function currentItems\s*\(\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*function makeRoundRect/,
  )?.[1] ?? "";
  assert.match(currentItems, /playQueue/);
  assert.match(currentItems, /pulseCatalogTracks/);
  assert.match(currentItems, /type:\s*['"]pulseTrack['"]/);
  assert.doesNotMatch(currentItems, /playlist|provider|podcast/i);
});

test("shelf and list selection state use the same current catalog ID", async () => {
  const [manager, sync] = await Promise.all([
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`, "utf8"),
  ]);

  assert.match(manager, /selectedTrackId/);
  assert.match(manager, /getSelectedTrackId/);
  assert.match(manager, /setSelectedTrackId/);
  assert.match(sync, /data-track-id/);
  assert.match(sync, /aria-pressed/);
  assert.match(sync, /shelfManager\.setSelectedTrackId/);
});

test("catalog selection does not require the removed audio-output device UI", async () => {
  const audioGraph = await readFile(
    `${project}/src/mineradio/05-playback/08-audio-graph-controls.js`,
    "utf8",
  );
  assert.match(audioGraph, /function applyOptionalAudioOutputDevice\s*\(/);
  assert.doesNotMatch(audioGraph, /^\s*applyAudioOutputDevice\(audio\);/m);
});

test("the shared field owns disposal without cover texture storage", async () => {
  const sharedField = await readFile(
    `${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`,
    "utf8",
  );

  assert.match(sharedField, /function disposeUnifiedMusicSpace\s*\(/);
  assert.match(sharedField, /resource\.dispose\(\)/);
  assert.doesNotMatch(
    sharedField,
    /replaceCoverTextureImage|coverTex|prevCoverTex|coverEdgeTex|neutralCoverEdgeCanvas|updateLyricPaletteFromCover/i,
  );
});
