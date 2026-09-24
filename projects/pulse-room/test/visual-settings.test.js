import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const project = "projects/pulse-room";
const settingsModules = [
  "00-state/04-fx-defaults.js",
  "00-state/05-packaged-fx-archive.js",
  "00-state/06-fx-runtime-layout.js",
  "02-visual/04-visual-settings-persistence.js",
  "07-fx/00-preset-archive-data.js",
  "07-fx/02-accent-background-controls.js",
  "07-fx/03-cover-picker.js",
  "07-fx/04-preset-grid-uniforms.js",
  "07-fx/05-fx-panel-performance.js",
  "07-fx/06-hotkeys.js",
  "07-fx/07-bindings-shelf-immersive.js",
];

async function readSettingsSources() {
  return Promise.all(
    settingsModules.map((path) =>
      readFile(`${project}/src/mineradio/${path}`, "utf8"),
    ),
  );
}

test("the browser settings surface exposes only the retained visual groups", async () => {
  const html = await readFile(`${project}/index.html`, "utf8");
  const groups = [
    "presets",
    "accent-background",
    "particles",
    "cover-depth",
    "bloom-edge",
    "shelf",
    "render-quality",
    "immersive",
  ];
  const controls = [
    "preset-grid",
    "ui-accent-picker",
    "visual-tint-picker",
    "bg-color-picker",
    "background-media-input",
    "fx-intensity",
    "fx-point",
    "fx-speed",
    "fx-twist",
    "fx-scatter",
    "fx-coverres",
    "fx-depth",
    "t-bloom",
    "fx-bloom",
    "t-edge",
    "shelf-seg",
    "fx-shelfsize",
    "fx-shelfsummonopen",
    "fx-shelfsummonclose",
    "performance-quality-seg",
    "foreground-fps-seg",
    "immersive-settings-btn",
  ];

  for (const group of groups) {
    assert.match(html, new RegExp(`data-settings-group=["']${group}["']`));
  }
  for (const id of controls) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("one explicit retained-ID registry gates the live settings bindings", async () => {
  const bindings = await readFile(
    `${project}/src/mineradio/07-fx/07-bindings-shelf-immersive.js`,
    "utf8",
  );
  assert.match(bindings, /var RETAINED_PULSE_SETTING_IDS\s*=\s*Object\.freeze/);
  assert.match(bindings, /function retainedPulseSettingElement/);
  assert.match(bindings, /RETAINED_PULSE_SETTING_ID_SET/);

  for (const id of [
    "fx-point",
    "fx-coverres",
    "ui-accent-picker",
    "background-media-input",
    "fx-shelfsize",
    "foreground-fps-seg",
  ]) {
    assert.match(bindings, new RegExp(`["']${id}["']`));
  }
});

test("visual settings persist under the v3 key and normalize each field independently", async () => {
  const [defaults, persistence] = await Promise.all([
    readFile(`${project}/src/mineradio/00-state/04-fx-defaults.js`, "utf8"),
    readFile(
      `${project}/src/mineradio/02-visual/04-visual-settings-persistence.js`,
      "utf8",
    ),
  ]);
  const storage = new Map();
  const context = {
    console,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    document: {
      addEventListener() {},
      documentElement: { style: { setProperty() {} } },
      hidden: false,
    },
    window: { addEventListener() {} },
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(
    `${defaults}\n${persistence}\nthis.normalize = normalizePulseRoomSettings; this.defaults = fxDefaults; this.storeKey = PULSE_ROOM_SETTINGS_STORE_KEY;`,
    context,
  );

  assert.equal(context.storeKey, "pulse-room-settings-v3");
  const normalized = context.normalize({
    preset: 99,
    point: 1.42,
    speed: "not-a-number",
    uiAccentColor: "lime",
    backgroundColor: "#123456",
    shelf: "provider",
    shelfSize: 1.12,
    performanceQuality: "maximum",
    foregroundFpsMode: "90",
    immersive: "yes",
  });

  assert.equal(normalized.preset, context.defaults.preset);
  assert.equal(normalized.point, 1.42);
  assert.equal(normalized.speed, context.defaults.speed);
  assert.equal(normalized.uiAccentColor, context.defaults.uiAccentColor);
  assert.equal(normalized.backgroundColor, "#123456");
  assert.equal(normalized.shelf, context.defaults.shelf);
  assert.equal(normalized.shelfSize, 1.12);
  assert.equal(normalized.performanceQuality, context.defaults.performanceQuality);
  assert.equal(normalized.foregroundFpsMode, "90");
  assert.equal(normalized.immersive, false);
});

test("the real classic-module order restores v3 settings before visual modules mount", async () => {
  const [defaults, packaged, layout, persistence] = await Promise.all([
    readFile(`${project}/src/mineradio/00-state/04-fx-defaults.js`, "utf8"),
    readFile(`${project}/src/mineradio/00-state/05-packaged-fx-archive.js`, "utf8"),
    readFile(`${project}/src/mineradio/00-state/06-fx-runtime-layout.js`, "utf8"),
    readFile(
      `${project}/src/mineradio/02-visual/04-visual-settings-persistence.js`,
      "utf8",
    ),
  ]);
  const saved = JSON.stringify({
    preset: 2,
    uiAccentColor: "#ff5c35",
    performanceQuality: "ultra",
    foregroundFpsMode: "90",
  });
  const context = {
    console,
    localStorage: { getItem: (key) => key === "pulse-room-settings-v3" ? saved : null },
    document: {
      getElementById: () => null,
      documentElement: { style: { setProperty() {} } },
    },
    clampRange: (value, min, max) => Math.min(max, Math.max(min, Number(value))),
    normalizeSavedVisualPresetIndex: (value) => Math.min(3, Math.max(0, Number(value) || 0)),
  };
  vm.runInNewContext(
    `${defaults}\n${packaged}\n${layout}\n${persistence}\nthis.restored = fx;`,
    context,
  );

  assert.equal(context.restored.preset, 2);
  assert.equal(context.restored.uiAccentColor, "#ff5c35");
  assert.equal(context.restored.performanceQuality, "ultra");
  assert.equal(context.restored.foregroundFpsMode, "90");
});

test("removed desktop and service settings have no live DOM or settings-source reference", async () => {
  const [html, ...sources] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    ...settingsModules.slice(3).map((path) =>
      readFile(`${project}/src/mineradio/${path}`, "utf8"),
    ),
  ]);
  const liveSettingsSource = [html, ...sources].join("\n");
  for (const removed of [
    "desktopLyrics",
    "wallpaperMode",
    "memoryAutoTrim",
    "sonicGround",
    "sonicWorkshop",
    "lyricColor",
    "audio-output",
    "provider-account",
  ]) {
    assert.doesNotMatch(liveSettingsSource, new RegExp(removed, "i"));
  }
});

test("the mobile visual console clears fixed chrome without horizontal overflow", async () => {
  const css = await readFile(`${project}/styles/local.css`, "utf8");
  const mobile = css.match(/@media \(max-width: 600px\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(css, /#fx-panel\s*\{[\s\S]*?z-index:\s*620/);
  assert.match(mobile, /bottom:\s*calc\(244px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(mobile, /left:\s*10px/);
  assert.match(mobile, /right:\s*-100vw/);
});

test("every visual preset retains the same four mounted layer objects", async () => {
  const source = await readFile(
    `${project}/src/mineradio/07-fx/04-preset-grid-uniforms.js`,
    "utf8",
  );
  for (const layer of ["spatialHaze", "spectralRibbons", "driftingFlow", "transientGlints"]) {
    assert.match(source, new RegExp(`${layer}\\.visible = true`));
  }
  assert.doesNotMatch(source, /new THREE\.|scene\.add|scene\.remove/);
});
