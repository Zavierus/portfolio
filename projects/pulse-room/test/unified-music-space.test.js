import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const visualRoot = "projects/pulse-room/src/mineradio/02-visual";

async function readVisualRuntime() {
  const sources = await Promise.all([
    "00-pointer-cover-particles.js",
    "01-float-skull-backcover.js",
    "03-background-star-river.js",
    "15-ripples-cover-depth.js",
  ].map((file) => readFile(`${visualRoot}/${file}`, "utf8")));
  return sources.join("\n");
}

test("the stage is one four-layer music space", async () => {
  const source = await readVisualRuntime();
  for (const name of [
    "musicSpace",
    "spatialHaze",
    "spectralRibbons",
    "driftingFlow",
    "transientGlints",
    "fluidSoundstage",
    "triggerFluidRipple",
    "updateFluidSoundstage",
  ]) {
    assert.match(source, new RegExp(`\\b${name}\\b`));
  }
  assert.equal((source.match(/new THREE\.Group\(\)[\s\S]{0,100}pulse-unified-music-space/g) || []).length, 1);
  assert.doesNotMatch(
    source,
    /BoxGeometry|cube|blockFragment|uCoverTex|uPrevCoverTex|uHasCover|buildCoverParticleGeometry|floatGroup|backCoverGroup/i,
  );
});

test("all permanent geometry is deterministic, budgeted, and labeled", async () => {
  const source = await readVisualRuntime();
  for (const layer of ["spatialHaze", "spectralRibbons", "driftingFlow", "transientGlints"]) {
    assert.match(source, new RegExp(`userData\\.layer = ['"]${layer}['"]`));
    assert.match(source, new RegExp(`PulseRuntime\\.quality\\.space\\.${layer === "spectralRibbons" ? "ribbons" : layer === "spatialHaze" ? "haze" : layer === "driftingFlow" ? "flow" : "glints"}`));
  }
  assert.match(source, /function seededMusicSpaceRandom/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.match(source, /registerMusicSpaceResource\(new THREE\.BufferGeometry\(\)\)/);
  assert.match(source, /new THREE\.PlaneGeometry\(2,\s*2/);
  assert.match(source, /fluidSoundstage/);
  assert.match(source, /uRippleData/);
  assert.match(source, /screenSpace:\s*true/);
  assert.match(source, /projection:\s*['"]clip-space['"]/);
  assert.match(source, /fogSteps:\s*pulseFogStepCount\(\)/);
  assert.match(source, /disposeUnifiedMusicSpace/);
});

test("the visual mapper consumes only the common normalized analysis frame", async () => {
  const [loop, field] = await Promise.all([
    readFile("projects/pulse-room/src/mineradio/11-main-loop.js", "utf8"),
    readFile(`${visualRoot}/15-ripples-cover-depth.js`, "utf8"),
  ]);
  assert.match(loop, /updateUnifiedMusicSpace\(dt,\s*pulseAnalysisFrame/);
  const start = field.indexOf("function updateUnifiedMusicSpace");
  assert.ok(start >= 0, "shared music-space mapper must exist");
  const body = field.slice(start, field.indexOf("\n}", start) + 2);
  assert.doesNotMatch(body, /trackId|currentTrack|title|artist|genre|cover|worldId|style|theme/);
});

test("fluid soundstage exposes a smoothed cover palette and directional surface motion", async () => {
  const source = await readFile(`${visualRoot}/15-ripples-cover-depth.js`, "utf8");
  for (const uniform of ["uFluidPrimary", "uFluidSecondary", "uFluidContrast"]) {
    assert.match(source, new RegExp(uniform));
  }
  assert.match(source, /function updateMusicSpacePaletteFromCanvas\s*\(/);
  assert.match(source, /palette.*transition|transition.*palette/i);
  assert.match(source, /directional|anisotropic|ridge|surfaceLine/i);
  assert.match(source, /uRippleData\[5\]/);
});
