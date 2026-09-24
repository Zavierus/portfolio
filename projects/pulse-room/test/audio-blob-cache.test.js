import assert from "node:assert/strict";
import test from "node:test";

import { createAudioBlobCache } from "../src/pulse/audio-blob-cache.js";

function audioResponse(bytes, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    blob: async () => new Blob([new Uint8Array(bytes)], { type: "audio/mpeg" }),
  };
}

function createUrlApi() {
  let serial = 0;
  const created = [];
  const revoked = [];
  return {
    created,
    revoked,
    createObjectURL(blob) {
      const url = `blob:test-${++serial}-${blob.size}`;
      created.push(url);
      return url;
    },
    revokeObjectURL(url) {
      revoked.push(url);
    },
  };
}

const tracks = {
  a: { id: "a", url: "./a.mp3" },
  b: { id: "b", url: "./b.mp3" },
  c: { id: "c", url: "./c.mp3" },
};

test("one fetch is shared by concurrent leases and HTTP 200 is accepted with Range", async () => {
  const calls = [];
  const urlApi = createUrlApi();
  const cache = createAudioBlobCache({
    urlApi,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return audioResponse(4, { status: 200 });
    },
    maxBytes: 32,
  });

  const [first, second] = await Promise.all([
    cache.acquire(tracks.a),
    cache.acquire(tracks.a),
  ]);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers.Range, "bytes=0-");
  assert.equal(first.url, second.url);
  assert.equal(first.bytes, 4);
  first.release();
  second.release();
  cache.dispose();
  assert.deepEqual(urlApi.revoked, [first.url]);
});

test("the selected lease survives while warm keeps at most one next track", async () => {
  const urlApi = createUrlApi();
  const cache = createAudioBlobCache({
    urlApi,
    fetchImpl: async () => audioResponse(3),
    maxBytes: 64,
  });

  const selected = await cache.acquire(tracks.a);
  await cache.warm(tracks.b);
  const firstWarmUrl = urlApi.created[1];
  await cache.warm(tracks.c);

  assert.deepEqual(urlApi.revoked, [firstWarmUrl]);
  assert.equal(urlApi.revoked.includes(selected.url), false);
  selected.release();
  cache.dispose();
  assert.equal(new Set(urlApi.revoked).size, 3);
});

test("released entries are evicted least-recently-used under the byte budget", async () => {
  const urlApi = createUrlApi();
  const cache = createAudioBlobCache({
    urlApi,
    fetchImpl: async () => audioResponse(3),
    maxBytes: 5,
  });

  const first = await cache.acquire(tracks.a);
  first.release();
  const second = await cache.acquire(tracks.b);

  assert.deepEqual(urlApi.revoked, [first.url]);
  assert.notEqual(second.url, first.url);
  second.release();
  cache.dispose();
});

test("a stale acquire can abort without poisoning a later retry", async () => {
  let calls = 0;
  const cache = createAudioBlobCache({
    urlApi: createUrlApi(),
    maxBytes: 32,
    fetchImpl: (_url, { signal }) => {
      calls += 1;
      if (calls > 1) return Promise.resolve(audioResponse(2));
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    },
  });
  const controller = new AbortController();
  const stale = cache.acquire(tracks.a, { signal: controller.signal });
  controller.abort(new DOMException("superseded", "AbortError"));

  await assert.rejects(stale, { name: "AbortError" });
  const recovered = await cache.acquire(tracks.a);
  assert.equal(recovered.bytes, 2);
  assert.equal(calls, 2);
  recovered.release();
  cache.dispose();
});

test("failed fetches and zero-byte bodies are removed so the track can recover", async () => {
  let calls = 0;
  const cache = createAudioBlobCache({
    urlApi: createUrlApi(),
    maxBytes: 32,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return audioResponse(2, { ok: false, status: 503 });
      if (calls === 2) return audioResponse(0);
      return audioResponse(2);
    },
  });

  await assert.rejects(cache.acquire(tracks.a), /HTTP 503/);
  await assert.rejects(cache.acquire(tracks.a), /empty/i);
  const lease = await cache.acquire(tracks.a);
  assert.equal(lease.bytes, 2);
  assert.equal(calls, 3);
  lease.release();
  cache.dispose();
});
