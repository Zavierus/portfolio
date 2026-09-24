import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import {
  createLocalMediaAdapter,
} from "../src/pulse/local-media-adapter.js";

const project = "projects/pulse-room";

test("local import accepts the six published audio formats and rejects unrelated files", () => {
  const localMedia = createLocalMediaAdapter({
    urlApi: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    coverFactory: () => ({ toDataURL: () => "data:image/png;base64,fallback" }),
  });
  const files = [
    { name: "one.mp3", type: "audio/mpeg", size: 1, lastModified: 1 },
    { name: "two.wav", type: "audio/wav", size: 2, lastModified: 2 },
    { name: "three.m4a", type: "audio/mp4", size: 3, lastModified: 3 },
    { name: "four.aac", type: "audio/aac", size: 4, lastModified: 4 },
    { name: "five.ogg", type: "audio/ogg", size: 5, lastModified: 5 },
    { name: "six.flac", type: "audio/flac", size: 6, lastModified: 6 },
    { name: "cover.png", type: "image/png", size: 7, lastModified: 7 },
    { name: "notes.txt", type: "text/plain", size: 8, lastModified: 8 },
  ];
  const result = localMedia.classify(files);
  assert.deepEqual(result.accepted.map(({ name }) => name), [
    "five.ogg",
    "four.aac",
    "one.mp3",
    "six.flac",
    "three.m4a",
    "two.wav",
  ]);
  assert.deepEqual(result.rejected.map(({ name }) => name), ["cover.png", "notes.txt"]);
});

test("local tracks retain the File and route to realtime analysis without world metadata", () => {
  const localMedia = createLocalMediaAdapter({
    urlApi: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    coverFactory: () => ({ toDataURL: () => "data:image/png;base64,fallback" }),
  });
  const file = {
    name: "field recording.flac",
    type: "audio/flac",
    size: 42,
    lastModified: 7,
  };
  const track = localMedia.createTrack(file);
  assert.equal(track.file, file);
  assert.equal(track.type, "local");
  assert.equal(track.source, "local");
  assert.equal(track.local, true);
  assert.equal(Object.hasOwn(track, "worldId"), false);
  assert.equal(track.title, "field recording");
  assert.equal("localUrl" in track, false);
});

test("transport controls bind the published buttons and binary ranges", async () => {
  const controls = await readFile(
    `${project}/src/mineradio/05-playback/14-player-controls.js`,
    "utf8",
  );
  assert.match(controls, /getElementById\(['"]play-btn['"]\)/);
  assert.match(controls, /addEventListener\(['"]click['"],\s*togglePulseTransportPlayback/);
  assert.match(controls, /getElementById\(['"]prev-btn['"]\)/);
  assert.match(controls, /selectPulseRelativeTrack\(-1\)/);
  assert.match(controls, /getElementById\(['"]next-btn['"]\)/);
  assert.match(controls, /selectPulseRelativeTrack\(1\)/);
  assert.match(controls, /getElementById\(['"]play-mode-btn['"]\)/);
  assert.match(controls, /cyclePlayMode/);
  assert.match(controls, /getElementById\(['"]volume-slider['"]\)/);
  assert.match(controls, /setVolume\s*\(/);
  assert.match(controls, /pulse-room-volume-v3/);
  assert.match(controls, /pulseTransportToggleQueued/);
  assert.match(controls, /\.finally\(flushPulseTransportToggle/);
  assert.doesNotMatch(controls, /songProviderKey|normalizePlaybackProvider|qishui|kugou|netease/i);
  assert.equal(
    (controls.match(/typeof switchPlaybackVisualToEmily === ['"]function['"]/g) || []).length,
    2,
  );
});

test("keyboard control excludes interactive targets and seeks by five seconds", async () => {
  const [shortcuts, hotkeys, seek] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/01-viewport-resize-shortcuts.js`, "utf8"),
    readFile(`${project}/src/mineradio/07-fx/06-hotkeys.js`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/16-progress-seek.js`, "utf8"),
  ]);
  assert.match(shortcuts, /button\s*,\s*a\s*,\s*input/);
  assert.match(shortcuts, /event\.code === ['"]Space['"]/);
  assert.match(hotkeys, /isPulseInteractiveTarget\(event\.target\)/);
  assert.match(seek, /event\.key === ['"]ArrowLeft['"]/);
  assert.match(seek, /['"]ArrowRight['"]/);
  assert.match(seek, /getElementById\(['"]progress-bar['"]\)/);
  assert.match(seek, /PULSE_KEYBOARD_SEEK_SECONDS\s*=\s*5/);
  assert.match(seek, /progressSeekController\.commit/);
});

test("startup binds the retained Mineradio volume controls", async () => {
  const startup = await readFile(
    `${project}/src/mineradio/10-shell/05-startup-bindings.js`,
    "utf8",
  );
  assert.match(startup, /bindVolumeControls\(\)/);
});

test("local upload has one reduced path with no removed panels or provider state", async () => {
  const upload = await readFile(
    `${project}/src/mineradio/05-playback/17-local-upload.js`,
    "utf8",
  );
  assert.match(upload, /PulseRuntime\.localMedia/);
  assert.match(upload, /PulseRuntime\.localMedia\.createTrack/);
  assert.match(upload, /PulseRuntime\.status/);
  assert.match(upload, /folder-input/);
  assert.doesNotMatch(upload, /worldId|localImport/);
  assert.doesNotMatch(
    upload,
    /cover-input|lyric-font|upload-panel|search-area|hydrateCustomCover|provider|homeForcedOpen/i,
  );
});

test("runtime exposes no removed-feature shim surface", async () => {
  const bootstrap = await readFile(`${project}/src/pulse/runtime-bootstrap.js`, "utf8");
  assert.doesNotMatch(bootstrap, /removedFeature|removed-feature-shims/i);
  await assert.rejects(() => access(`${project}/src/pulse/removed-feature-shims.js`));
});

test("idle chrome remains visible while a control owns focus", async () => {
  const idle = await readFile(
    `${project}/src/mineradio/09-idle-toast-libraries.js`,
    "utf8",
  );
  assert.match(idle, /pulseChromeHasActiveFocus/);
  assert.match(idle, /document\.activeElement/);
  assert.match(idle, /PULSE_IDLE_DELAY\s*=\s*2500/);
});

test("local playback chrome restores without the removed home module", async () => {
  const controls = await readFile(
    `${project}/src/mineradio/01-scene/04-bottom-controls-cursor.js`,
    "utf8",
  );
  assert.doesNotMatch(controls, /setHomeControlsLocked/);
  assert.match(controls, /classList\.remove\(['"]home-controls-locked['"]\)/);
});

test("Playwright QA verifies one shared music space across the electronic catalog", async () => {
  const qa = await readFile("scripts/qa-pulse-room.py", "utf8");
  for (const trackId of [
    "kai-engel-anxiety",
    "epsilon-not-other-side-of-the-wave",
    "graham-bole-kirigami",
    "revolution-void-effects-of-elevation",
  ]) {
    assert.match(qa, new RegExp(trackId));
  }
  for (const field of [
    "musicSpace",
    "rootUuid",
    "cameraUuid",
    "analysisSerial",
    "handoffProgress",
  ]) {
    assert.match(qa, new RegExp(`\\b${field}\\b`));
  }
  assert.doesNotMatch(qa, /hasCover|coverKey/);
});

test("playback entry presents a mutable record and commits a cover without world calls", async () => {
  const entry = await readFile(
    `${project}/src/mineradio/05-playback/13-playback-start-audio.js`,
    "utf8",
  );
  assert.match(entry, /var song = cloneSong\(playQueue\[idx\]\)/);
  assert.match(entry, /loadCoverFromUrl/);
  assert.doesNotMatch(entry, /PulseRuntime\.worlds|particlePrograms|worldId|loadPulseWorldCover/);
});

test("mode switching keeps one renderer and publishes a transition state", async () => {
  const [startup, css] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(startup, /pulse-mode-transition|mode-transition/);
  assert.match(startup, /data-app-mode/);
  assert.match(css, /pulse-mode-transition|mode-transition/);
  assert.match(css, /prefers-reduced-motion/);
});
