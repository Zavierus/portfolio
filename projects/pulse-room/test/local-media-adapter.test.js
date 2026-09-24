import assert from "node:assert/strict";
import test from "node:test";

import { createLocalMediaAdapter } from "../src/pulse/local-media-adapter.js";

function file(name, type, size = 8, lastModified = 1) {
  return { name, type, size, lastModified };
}

test("local media classifies supported files and creates a world-free queue record", () => {
  const adapter = createLocalMediaAdapter({
    coverFactory: () => ({ toDataURL: () => "data:image/png;base64,fallback" }),
  });
  const source = file("field recording.flac", "audio/flac", 42, 7);
  const result = adapter.classify([
    file("clip.mp3", "audio/mpeg"),
    source,
    file("notes.txt", "text/plain"),
  ]);
  assert.deepEqual(result.accepted.map(({ name }) => name), ["clip.mp3", "field recording.flac"]);
  assert.deepEqual(result.rejected.map(({ name }) => name), ["notes.txt"]);

  const track = adapter.createTrack(source);
  assert.equal(track.file, source);
  assert.equal(track.title, "field recording");
  assert.equal(track.source, "local");
  assert.equal(track.local, true);
  assert.equal(track.cover, "data:image/png;base64,fallback");
  assert.equal(track.analysisUrl, null);
  for (const fieldName of ["worldId", "style", "theme", "particleProgram"]) {
    assert.equal(Object.hasOwn(track, fieldName), false);
  }
});

test("local media shares one object URL and revokes it after the final owner releases", () => {
  const created = [];
  const revoked = [];
  const adapter = createLocalMediaAdapter({
    urlApi: {
      createObjectURL(blob) {
        created.push(blob);
        return "blob:local-shared";
      },
      revokeObjectURL(url) {
        revoked.push(url);
      },
    },
    coverFactory: () => ({ toDataURL: () => "data:image/png;base64,fallback" }),
  });
  const track = adapter.createTrack(file("local.wav", "audio/wav", 24, 4));
  const first = adapter.acquire(track);
  const second = adapter.acquire(track);

  assert.equal(first.url, "blob:local-shared");
  assert.equal(second.url, first.url);
  assert.equal(created.length, 1);
  assert.equal(adapter.release(first), true);
  assert.deepEqual(revoked, []);
  assert.equal(adapter.release(track), true);
  assert.deepEqual(revoked, ["blob:local-shared"]);
  assert.equal(adapter.release(track), false);
});
