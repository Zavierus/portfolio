import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const project = "projects/pulse-room";
const retiredWorldPatterns = [
  /\.glb\b/i,
  /\bworldId\b/,
  /\bPulseRuntime\.worlds\b/,
  /\bruntime\.worlds\b/,
  /\bworldCover\b/,
  /\bpresentationMode\b/,
  /\bsignal-chrysalis\b/,
  /\btriune-gate\b/,
  /\bnull-cathedral\b/,
  /\bpacket-bloom\b/,
  /\bsignal-field\b/,
];
const expectedTargets = [
  "00-state/00-core-stores.js",
  "00-state/01-perf-render-state.js",
  "00-state/02-preferences-ui-modes.js",
  "00-state/03-beat-dj-state.js",
  "00-state/04-fx-defaults.js",
  "00-state/05-packaged-fx-archive.js",
  "00-state/06-fx-runtime-layout.js",
  "00-state/07-ui-playback-runtime.js",
  "00-state/09-performance-probe.js",
  "00-state/10-frame-scheduler.js",
  "01-scene/00-renderer-quality.js",
  "01-scene/01-orbit-free-camera.js",
  "01-scene/02-beat-camera-runtime.js",
  "01-scene/03-focus-cinema-camera.js",
  "01-scene/04-bottom-controls-cursor.js",
  "02-visual/00-pointer-cover-particles.js",
  "02-visual/01-float-skull-backcover.js",
  "02-visual/03-background-star-river.js",
  "02-visual/04-visual-settings-persistence.js",
  "02-visual/06-custom-background-colorlab.js",
  "02-visual/15-ripples-cover-depth.js",
  "03-beat/00-tempo-worker-cache-prefetch.js",
  "03-beat/01-audio-beat-analysis.js",
  "03-beat/04-beat-map-runtime.js",
  "03-beat/05-cover-loading-crop.js",
  "03-beat/06-sonic-audio-monitor.js",
  "04-shelf/00-layout-hover.js",
  "04-shelf/01-manager-core.js",
  "04-shelf/02-rebuild-panel-sync.js",
  "04-shelf/03-content-list-manager.js",
  "04-shelf/04-cover-api-helpers.js",
  "04-shelf/05-card-interactions.js",
  "04-shelf/06-keyboard-camera-events.js",
  "05-playback/01-cover-custom-map.js",
  "05-playback/08-audio-graph-controls.js",
  "05-playback/09-queue-snapshot-autoplay.js",
  "05-playback/10-queue-actions.js",
  "05-playback/12-playback-switch-core.js",
  "05-playback/13-playback-start-audio.js",
  "05-playback/14-player-controls.js",
  "05-playback/15-control-glass-animations.js",
  "05-playback/16-progress-seek.js",
  "05-playback/17-local-upload.js",
  "05-playback/18-playlist-panel-shell.js",
  "07-fx/00-preset-archive-data.js",
  "07-fx/02-accent-background-controls.js",
  "07-fx/03-cover-picker.js",
  "07-fx/04-preset-grid-uniforms.js",
  "07-fx/05-fx-panel-performance.js",
  "07-fx/06-hotkeys.js",
  "07-fx/07-bindings-shelf-immersive.js",
  "09-idle-toast-libraries.js",
  "10-shell/00-gesture-control.js",
  "10-shell/01-viewport-resize-shortcuts.js",
  "10-shell/02-peek-panels-upload.js",
  "10-shell/03-splash.js",
  "10-shell/05-startup-bindings.js",
  "11-main-loop.js",
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return files.flat();
}

test("the faithful local replica has a pinned service-free module contract", async () => {
  const [targets, snapshot] = await Promise.all([
    readFile(`${project}/LOCAL_REPLICA_MODULES.json`, "utf8").then(JSON.parse),
    readFile(
      `${project}/upstream/mineradio-2.0.2/SNAPSHOT.json`,
      "utf8",
    ).then(JSON.parse),
  ]);
  assert.deepEqual(targets.map(({ target }) => target), expectedTargets);
  assert.equal(new Set(expectedTargets).size, expectedTargets.length);

  const snapshotByPath = new Map(
    snapshot.files.map((entry) => [entry.path, entry]),
  );
  const prohibited = [
    /08-account\//i,
    /provider|login|recommend|podcast|wallpaper-engine|desktop/i,
    /(?:^|\/)lyrics(?:\/|$)/i,
  ];
  for (const entry of targets) {
    assert.equal(typeof entry.adapted, "boolean", entry.target);
    assert.match(entry.upstreamSha256, /^[a-f0-9]{64}$/, entry.target);
    assert.match(entry.upstreamPath, /^public\/js\/modules\/.+\.js$/);
    assert.equal(
      snapshotByPath.get(entry.upstreamPath)?.sha256,
      entry.upstreamSha256,
      entry.target,
    );
    for (const pattern of prohibited) {
      assert.doesNotMatch(entry.target, pattern, entry.target);
    }
  }
});

test("the local replica publishes no retired PULSE world protocol", async () => {
  const sourceFiles = await listFiles(`${project}/src`);
  const publishedFiles = [
    `${project}/index.html`,
    `${project}/styles/index.css`,
    `${project}/styles/local.css`,
    `${project}/build-manifest.json`,
    `${project}/runtime-bootstrap.bundle.js`,
    `${project}/app.bundle.js`,
    `${project}/analysis-worker.bundle.js`,
  ];
  const inspectedFiles = [
    ...sourceFiles.filter((file) => /\.(?:js|json|css|html)$/i.test(file)),
    ...publishedFiles,
  ];

  for (const file of inspectedFiles) {
    const source = await readFile(file, "utf8");
    for (const pattern of retiredWorldPatterns) {
      assert.doesNotMatch(source, pattern, `${file} contains ${pattern}`);
    }
  }
});
