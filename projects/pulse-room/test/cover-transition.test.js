import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const depthPath = "projects/pulse-room/src/mineradio/02-visual/15-ripples-cover-depth.js";
const loaderPath = "projects/pulse-room/src/mineradio/03-beat/05-cover-loading-crop.js";

test("cover decode is metadata-only and preserves stale-load ownership", async () => {
  const loader = await readFile(loaderPath, "utf8");
  const imageCreate = loader.indexOf("var img = new Image()");
  const imageReady = loader.indexOf("img.onload = function", imageCreate);
  const apply = loader.indexOf("applyCoverCanvas", imageReady);
  assert.ok(imageCreate >= 0 && imageReady > imageCreate && apply > imageReady);
  assert.match(loader, /if \(!coverApplyStillCurrent\(opts\)\) return/);
  assert.match(loader, /function coverApplyStillCurrent\s*\(/);
  assert.match(loader, /opts\.trackToken === trackSwitchToken/);
  assert.match(loader, /thumb-cover/);
  assert.doesNotMatch(loader, /updateUnifiedMusicSpace|musicSpaceHandoff|geometry|material|camera/);
  assert.doesNotMatch(loader, /uHasCover|setCoverDepthState|uCoverTex|uPrevCoverTex/);
});

test("metadata loading helpers own only the retained DOM overlay", async () => {
  const loader = await readFile(loaderPath, "utf8");
  assert.match(loader, /function showLoading\s*\(/);
  assert.match(loader, /function hideLoading\s*\(/);
  assert.match(loader, /getElementById\(['"]loading-overlay['"]\)/);
  assert.match(loader, /classList\.add\(['"]show['"]\)/);
  assert.match(loader, /classList\.remove\(['"]show['"]\)/);
  assert.doesNotMatch(loader, /uLoading|loadingTween/);
});

test("failed cover fallback changes metadata without touching space state", async () => {
  const loader = await readFile(loaderPath, "utf8");
  const start = loader.indexOf("function applyPulseCoverFallback");
  const end = loader.indexOf("\n}\n", start) + 3;
  const fallback = loader.slice(start, end);
  assert.match(fallback, /createCoverFallback/);
  assert.match(fallback, /applyCoverCanvas/);
  assert.match(fallback, /fallback:/);
  assert.doesNotMatch(fallback, /musicSpace|handoff|geometry|material|camera/);
});

test("cover loading publishes a local palette without taking visual ownership", async () => {
  const loader = await readFile(loaderPath, "utf8");
  assert.match(loader, /updateMusicSpacePaletteFromCanvas\s*\(/);
  assert.match(loader, /coverSourceKind/);
  assert.doesNotMatch(loader, /musicSpace\s*=\s*new THREE\.Group/);
});

test("analysis handoff preserves music-space and camera object identity", async () => {
  const field = await readFile(depthPath, "utf8");
  assert.match(field, /musicSpaceHandoff/);
  assert.match(field, /duration:\s*0\.8/);
  assert.match(field, /analysisSerial/);
  assert.doesNotMatch(field, /musicSpace\s*=\s*new THREE\.Group\(\)/);
  assert.doesNotMatch(field, /camera\s*=\s*new/);
});
