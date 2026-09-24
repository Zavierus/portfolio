import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const project = "projects/pulse-room";

test("selection uses local adapters, commits cover, loads media, then starts audio", async () => {
  const source = await readFile(
    `${project}/src/mineradio/05-playback/13-playback-start-audio.js`,
    "utf8",
  );
  const acquire = source.indexOf("mediaOwner.acquire");
  const cover = source.indexOf("commitPulseTrackCover(song, token)", acquire);
  const load = source.indexOf("playback.load");
  const play = source.indexOf("playback.play");
  assert.ok(acquire >= 0, "track selection must acquire through a media adapter");
  assert.ok(cover > acquire, "cover commit must follow the winning media acquisition");
  assert.ok(load > cover, "playback load must follow cover commit");
  assert.ok(play > load, "audio play must follow committed media load");
  assert.match(source, /PulseRuntime\.localMedia/);
  assert.match(source, /PulseRuntime\.media/);
  assert.doesNotMatch(source, /provider|worlds|particlePrograms|loadPulseWorldCover/i);
});

test("local file and folder upload append records and select through the shared queue path", async () => {
  const source = await readFile(
    `${project}/src/mineradio/05-playback/17-local-upload.js`,
    "utf8",
  );
  assert.match(source, /PulseRuntime\.localMedia\.createTrack/);
  assert.match(source, /queueSong\(track/);
  assert.match(source, /playQueueAt\(targetIndex/);
  assert.match(source, /bindPulseLocalInput\(['"]file-input['"]\)/);
  assert.match(source, /bindPulseLocalInput\(['"]folder-input['"]\)/);
  assert.doesNotMatch(source, /worldId|provider|localImport/i);
});

test("the visible queue button owns the mini queue open state", async () => {
  const source = await readFile(
    `${project}/src/mineradio/05-playback/18-playlist-panel-shell.js`,
    "utf8",
  );
  assert.match(source, /getElementById\(['"]mini-queue-btn['"]\)/);
  assert.match(source, /addEventListener\(['"]click['"],\s*toggleMiniQueue/);
  assert.match(source, /setAttribute\(['"]aria-expanded['"]/);
});
