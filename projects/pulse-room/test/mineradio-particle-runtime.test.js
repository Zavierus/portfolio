import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room/src/mineradio";

test("analysis ownership drives one persistent music-space lifecycle", async () => {
  const [playback, loader, depth, loop] = await Promise.all([
    readFile(`${project}/05-playback/13-playback-start-audio.js`, "utf8"),
    readFile(`${project}/03-beat/05-cover-loading-crop.js`, "utf8"),
    readFile(`${project}/02-visual/15-ripples-cover-depth.js`, "utf8"),
    readFile(`${project}/11-main-loop.js`, "utf8"),
  ]);

  assert.match(playback, /coverKey:\s*['"]cover:['"]\s*\+/);
  assert.match(loader, /coverKey:\s*opts\.coverKey\s*\|\|/);
  assert.match(depth, /musicSpaceHandoff/);
  assert.match(depth, /updateUnifiedMusicSpace/);
  assert.match(depth, /updateFluidSoundstage/);
  assert.match(depth, /triggerFluidRipple/);
  assert.match(loop, /__PULSE_ROOM_QA__\.musicSpace/);
  assert.match(loop, /rootUuid:/);
  assert.match(loop, /cameraUuid:/);
  assert.match(loop, /cameraMode:/);
  assert.match(loop, /fluidSoundstage/);
  assert.doesNotMatch(depth, /currentCoverKey|coverTex|coverEdgeTex/);
  assert.doesNotMatch(loop, /worldId|presentationMode/);
});

test("camera and render loop retain Mineradio authority without world dispatch", async () => {
  const [beatCamera, focusCamera, loop] = await Promise.all([
    readFile(`${project}/01-scene/02-beat-camera-runtime.js`, "utf8"),
    readFile(`${project}/01-scene/03-focus-cinema-camera.js`, "utf8"),
    readFile(`${project}/11-main-loop.js`, "utf8"),
  ]);
  assert.match(beatCamera, /function scheduleBeatCamera/);
  assert.match(focusCamera, /function updateCamera/);
  assert.match(focusCamera, /function updateCinema/);
  assert.match(loop, /updateCamera\(\)/);
  assert.match(loop, /updateCinema\(dt\)/);
  for (const source of [beatCamera, focusCamera, loop]) {
    assert.doesNotMatch(source, /PulseRuntime\.worlds|worldCamera|presentationMode/);
  }
});
