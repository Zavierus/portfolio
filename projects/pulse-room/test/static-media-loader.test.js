import assert from "node:assert/strict";
import test from "node:test";

import { createStaticMediaLoader } from "../src/pulse/static-media-loader.js";

function response(bytes, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    blob: async () => new Blob([new Uint8Array(bytes)], { type: "audio/mpeg" }),
  };
}

test("static media shares a Range request and exposes explicit release", async () => {
  const calls = [];
  const revoked = [];
  const loader = createStaticMediaLoader({
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response(12, 200);
    },
    urlApi: {
      createObjectURL: () => "blob:static-shared",
      revokeObjectURL: (url) => revoked.push(url),
    },
    maxBytes: 64,
  });
  const track = { id: "static", url: "./static.mp3" };
  const first = await loader.acquire(track);
  const second = await loader.acquire(track);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers.Range, "bytes=0-");
  assert.equal(first.url, second.url);
  assert.equal(loader.release(first), true);
  assert.equal(loader.release(track), true);
  loader.dispose();
  assert.deepEqual(revoked, ["blob:static-shared"]);
});

test("file protocol leases the adjacent media URL without unsupported fetch", async () => {
  const fetched = [];
  const revoked = [];
  const loader = createStaticMediaLoader({
    fetchImpl: async (url) => {
      fetched.push(url);
      throw new TypeError("file fetch is unsupported");
    },
    urlApi: {
      createObjectURL: () => "blob:must-not-be-created",
      revokeObjectURL: (url) => revoked.push(url),
    },
    directFileUrls: true,
    baseUrl: "file:///C:/pulse-room/index.html",
    maxBytes: 64,
  });

  const lease = await loader.acquire({ id: "file-static", url: "./assets/music/song.mp3" });

  assert.equal(lease.url, "file:///C:/pulse-room/assets/music/song.mp3");
  assert.equal(lease.bytes, 0);
  assert.deepEqual(fetched, []);
  lease.release();
  loader.dispose();
  assert.deepEqual(revoked, []);
});
