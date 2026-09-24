import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room";

test("a visible shelf card click activates its track instead of only scrolling", async () => {
  const [source, manager] = await Promise.all([
    readFile(`${project}/src/mineradio/04-shelf/05-card-interactions.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8"),
  ]);
  assert.match(source, /function activatePulseShelfCard\s*\(/);
  assert.match(source, /activatePulseShelfCard\(hit\.card\)/);
  assert.match(source, /shelfManager\.openContent\(card\.index\)/);
  assert.match(source, /pickCardAtScreen\(event\.clientX, event\.clientY, 0\)/);
  assert.match(manager, /item\.type === 'pulseTrack' \|\| item\.trackId/);
  assert.match(manager, /action\.kind !== 'selectPulseTrack'/);
});

test("desktop shelf has one source of truth and Classic navigation is intentionally small", async () => {
  const [html, interactions, startup, sync] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/05-card-interactions.js`, "utf8"),
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/src/mineradio/04-shelf/02-rebuild-panel-sync.js`, "utf8"),
  ]);
  assert.doesNotMatch(html, /pulse-shelf-rail/);
  assert.doesNotMatch(startup, /pulse-shelf-rail/);
  assert.doesNotMatch(sync, /pulse-shelf-rail/);
  assert.doesNotMatch(html, /data-classic-nav=["'](?:recent|library)["']/i);
  assert.match(interactions, /activatePulseShelfCard\(hit\.card\)/);
});

test("desktop shelf is visible by default so the Mineradio 3D cards are directly usable", async () => {
  const defaults = await readFile(`${project}/src/mineradio/00-state/04-fx-defaults.js`, "utf8");
  const layout = await readFile(`${project}/src/mineradio/04-shelf/00-layout-hover.js`, "utf8");
  assert.match(defaults, /shelfPresence:\s*['"]always['"]/);
  assert.match(layout, /function canUseSideShelfWithoutPinnedOpen\(\)\s*\{\s*return !!shelfAlwaysVisible\(\);/);
});

test("shelf covers keep their texture but add a deterministic album-color treatment", async () => {
  const manager = await readFile(`${project}/src/mineradio/04-shelf/01-manager-core.js`, "utf8");
  assert.match(manager, /function shelfCoverPalette\s*\(/);
  assert.match(manager, /musicSpacePaletteFallback/);
  assert.match(manager, /shelfHexRgba/);
  assert.match(manager, /location\.protocol\s*===\s*['"]file:/);
  assert.match(manager, /!isFileProtocol/);
  assert.match(manager, /globalCompositeOperation\s*=\s*['"]screen['"]/);
  assert.match(manager, /coverPalette\.primary/);
});

test("fx bindings wait for the panel before becoming one-shot bound", async () => {
  const source = await readFile(`${project}/src/mineradio/07-fx/07-bindings-shelf-immersive.js`, "utf8");
  assert.match(source, /var panel = document\.getElementById\(['"]fx-panel['"]\);/);
  assert.match(source, /if \(!panel\) return;/);
  assert.match(source, /pulseFxPanelBound = true;/);
});

test("the current cover is shared by the compact preview and Classic turntable", async () => {
  const [startup, coverLoading, html, css] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/src/mineradio/03-beat/05-cover-loading-crop.js`, "utf8"),
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(coverLoading, /getElementById\(['"]thumb-cover['"]\)/);
  assert.match(startup, /getElementById\(['"]classic-turntable-disc['"]\)/);
  assert.match(html, /id=["']classic-turntable-disc["']/);
  assert.doesNotMatch(html, /control-cover-orbit/);
  assert.doesNotMatch(html, /id=["']pulse-turntable-disc["']/);
  assert.match(css, /@keyframes classic-record-spin/);
  assert.match(css, /#classic-turntable-disc[\s\S]*animation/);
  assert.match(css, /#portfolio-back\s*\{[\s\S]*z-index:\s*950/);
});

test("Classic track previews render their actual cover assets", async () => {
  const [startup, css] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(startup, /document\.createElement\(['"]img['"]\)/);
  assert.match(startup, /cover\.src\s*=\s*coverSrc/);
  assert.match(startup, /classic-track-cover-wrap/);
  assert.match(startup, /track-cover-tint/);
  assert.match(css, /\.classic-track-cover\s*\{[\s\S]*object-fit:\s*cover/);
  assert.match(css, /\.classic-track-cover-wrap\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.classic-track-cover\s*\{[\s\S]*mix-blend-mode:\s*screen/);
});

test("Classic is an independent secondary player surface", async () => {
  const [html, startup, css] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/10-shell/05-startup-bindings.js`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(html, /id=["']classic-back["']/);
  assert.match(startup, /getElementById\(['"]classic-back['"]\)/);
  assert.match(startup, /classic-route-open/);
  assert.match(css, /body\.classic-route-open\s+#canvas-container/);
  assert.match(css, /body\.classic-route-open\s+#bottom-bar/);
  assert.match(css, /\.classic-hero\s*\{[\s\S]*grid-template-columns/);
  assert.match(css, /\.classic-turntable-stage\s*\{[\s\S]*position:\s*relative/);
});

test("Studio and Classic progress surfaces share one anti-rollback seek controller", async () => {
  const [html, seek] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/05-playback/16-progress-seek.js`, "utf8"),
  ]);
  assert.match(html, /id=["']classic-progress-bar["'][^>]*role=["']slider["']/);
  assert.match(seek, /function bindPulseProgressSurface\s*\(/);
  assert.match(seek, /\['progress-bar',\s*'classic-progress-bar'\]/);
  assert.equal((seek.match(/createSeekController\s*\(/g) || []).length, 1);
});

test("visual settings explain their controls in Chinese and omit the unused cinema camera", async () => {
  const [html, presets, bindings] = await Promise.all([
    readFile(`${project}/index.html`, "utf8"),
    readFile(`${project}/src/mineradio/07-fx/00-preset-archive-data.js`, "utf8"),
    readFile(`${project}/src/mineradio/07-fx/07-bindings-shelf-immersive.js`, "utf8"),
  ]);
  assert.match(html, /视觉程序/);
  assert.match(html, /渲染预算/);
  assert.match(html, /沉浸画面/);
  assert.doesNotMatch(html, /CINEMA CAMERA|fx-cineshake|t-cinema/);
  assert.doesNotMatch(bindings, /fx-cineshake|t-cinema/);
  assert.match(presets, /封面流场/);
  assert.match(presets, /鼓点冲击/);
  assert.match(presets, /轨道环绕/);
  assert.match(presets, /静默留白/);
});

test("Studio atmosphere is screen-space volumetric fog instead of a rotating jelly plane", async () => {
  const [fluid, haze] = await Promise.all([
    readFile(`${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`, "utf8"),
    readFile(`${project}/src/mineradio/02-visual/03-background-star-river.js`, "utf8"),
  ]);
  assert.match(fluid, /new THREE\.PlaneGeometry\(2,\s*2/);
  assert.match(fluid, /gl_Position\s*=\s*vec4\(position\.xy,\s*0\.0,\s*1\.0\)/);
  assert.match(fluid, /PULSE_FOG_STEPS/);
  assert.match(fluid, /fogDensity|densityErosion/);
  assert.match(fluid, /transmittance/);
  assert.match(fluid, /uRippleFlowData\[5\]/);
  assert.doesNotMatch(fluid, /vec2 blotCenter|vec2 mirrorCenter/);
  assert.doesNotMatch(haze, /vInk|uRippleData/);
});

test("fluid soundfield uses a weak damped desktop pointer response", async () => {
  const source = await readFile(`${project}/src/mineradio/02-visual/15-ripples-cover-depth.js`, "utf8");
  assert.match(source, /fluidPointerState/);
  assert.match(source, /Math\.exp\(-Math\.max\(0, dt\) \* [0-9.]+\)/);
  assert.match(source, /matchMedia\(['"]\(pointer:\s*coarse\)['"]\)/);
  assert.match(source, /uFluidPointer\.value\.set\(fluidPointerState/);
  assert.match(source, /pointerDirection/);
  assert.match(source, /pointerWake/);
  assert.match(source, /pointerBloom/);
  assert.match(source, /fluid-pointer-halo/);
  assert.match(source, /addEventListener\(['"]pointermove['"]/);
  assert.match(source, /width:160px;height:160px/);
  assert.match(source, /pointerWake[\s\S]*\* 7\.4/);
  assert.match(source, /pointer:\s*\{[\s\S]*strength:/);
});

test("Studio entry has a perceptible one-shot bloom and Classic removes the tonearm", async () => {
  const [entry, css] = await Promise.all([
    readFile(`${project}/src/mineradio/10-shell/00-gesture-control.js`, "utf8"),
    readFile(`${project}/styles/local.css`, "utf8"),
  ]);
  assert.match(entry, /studio-entry-active/);
  assert.match(css, /@keyframes studio-entry-flare/);
  assert.match(css, /body\.custom-background-override #album-bg\.visible/);
  assert.match(css, /\.classic-turntable-arm\s*\{[\s\S]*display:\s*none/);
});

test("Studio metadata and the renderer stay inside an explicit desktop safe area", async () => {
  const css = await readFile(`${project}/styles/local.css`, "utf8");
  assert.match(css, /--studio-safe-left/);
  assert.match(css, /--studio-safe-right/);
  assert.match(css, /calc\(100dvw\s*-\s*var\(--studio-safe-left\)\s*-\s*var\(--studio-safe-right\)\)/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
  assert.match(css, /#canvas-container\s*\{[\s\S]*?overflow:\s*hidden/);
});
