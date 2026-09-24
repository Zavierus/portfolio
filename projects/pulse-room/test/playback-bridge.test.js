import assert from "node:assert/strict";
import test from "node:test";

import { createLocalMediaAdapter } from "../src/pulse/local-media-adapter.js";
import { createPlaybackBridge } from "../src/pulse/playback-bridge.js";

function abortError(message = "superseded") {
  return new DOMException(message, "AbortError");
}

class FakeAudio extends EventTarget {
  constructor() {
    super();
    this._src = "";
    this.paused = true;
    this.ended = false;
    this.readyState = 0;
    this.volume = 1;
    this.loop = false;
    this.playCalls = 0;
    this.pauseCalls = 0;
    this.loadCalls = 0;
    this.nextOutcome = "ready";
  }

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;
    this.readyState = 0;
  }

  load() {
    this.loadCalls += 1;
    const outcome = this.nextOutcome;
    this.nextOutcome = "ready";
    queueMicrotask(() => {
      if (outcome === "error") {
        this.error = { code: 3, message: "decode failed" };
        this.dispatchEvent(new Event("error"));
        return;
      }
      this.readyState = 2;
      this.dispatchEvent(new Event("loadeddata"));
    });
  }

  async play() {
    this.playCalls += 1;
    this.paused = false;
    this.dispatchEvent(new Event("play"));
  }

  pause() {
    this.pauseCalls += 1;
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }

  removeAttribute(name) {
    if (name === "src") this.src = "";
  }
}

function lease(track) {
  let released = false;
  return {
    url: `blob:${track.id}`,
    bytes: 4,
    get released() {
      return released;
    },
    release() {
      released = true;
    },
  };
}

function localMedia(urlApi) {
  return createLocalMediaAdapter({
    urlApi,
    coverFactory: () => ({ toDataURL: () => "data:image/png;base64,fallback" }),
  });
}

test("a newer load aborts and ignores the stale acquisition", async () => {
  const audio = new FakeAudio();
  const pending = new Map();
  const cache = {
    acquire(track, { signal }) {
      return new Promise((resolve, reject) => {
        pending.set(track.id, { resolve, reject, signal });
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({ audio, cache });

  const stale = bridge.load({ id: "a", url: "./a.mp3" }, { autoplay: true });
  const winner = bridge.load({ id: "b", url: "./b.mp3" }, { autoplay: true });
  assert.equal(pending.get("a").signal.aborted, true);
  pending.get("b").resolve(lease({ id: "b" }));

  assert.equal(await stale, false);
  assert.equal(await winner, true);
  assert.equal(audio.src, "blob:b");
  assert.equal(audio.playCalls, 1);
  assert.equal(bridge.currentLease().url, "blob:b");
});

test("only the winning serial restores prior playing state", async () => {
  const audio = new FakeAudio();
  audio.paused = false;
  const deferred = [];
  const cache = {
    acquire(track, { signal }) {
      return new Promise((resolve, reject) => {
        const item = { track, signal, resolve, reject };
        deferred.push(item);
        signal.addEventListener("abort", () => reject(abortError()), { once: true });
      });
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({ audio, cache });

  const first = bridge.load({ id: "a", url: "./a.mp3" }, { autoplay: false, serial: 10 });
  const second = bridge.load({ id: "b", url: "./b.mp3" }, { autoplay: false, serial: 11 });
  deferred[1].resolve(lease(deferred[1].track));

  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.src, "blob:b");
});

test("decode failure releases the candidate and a later load can recover", async () => {
  const audio = new FakeAudio();
  const leases = [];
  const cache = {
    async acquire(track) {
      const next = lease(track);
      leases.push(next);
      return next;
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({ audio, cache });
  const track = { id: "a", url: "./a.mp3" };

  audio.nextOutcome = "error";
  await assert.rejects(bridge.load(track, { autoplay: true }), /decode/i);
  assert.equal(leases[0].released, true);

  assert.equal(await bridge.load(track, { autoplay: true }), true);
  assert.equal(audio.playCalls, 1);
  bridge.dispose();
  assert.equal(leases[1].released, true);
});

test("local object URLs remain outside the built-in cache and are revoked exactly once", async () => {
  const audio = new FakeAudio();
  let cacheAcquires = 0;
  const revoked = [];
  const cache = {
    async acquire() {
      cacheAcquires += 1;
      throw new Error("built-in cache should not acquire local files");
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({
    audio,
    cache,
    localMedia: localMedia({
      createObjectURL: () => "blob:created-local",
      revokeObjectURL: (url) => revoked.push(url),
    }),
  });

  await bridge.load({ id: "local", localUrl: "blob:imported-local", type: "local" });
  await bridge.load({ id: "file", file: new Blob(["audio"]), type: "local" });
  bridge.dispose();
  bridge.dispose();

  assert.equal(cacheAcquires, 0);
  assert.deepEqual(revoked, ["blob:imported-local", "blob:created-local"]);
});

test("repeated and superseded loads share one imported local URL until final disposal", async () => {
  const audio = new FakeAudio();
  const revoked = [];
  const cache = {
    async acquire() {
      throw new Error("local URLs must not enter the built-in cache");
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({
    audio,
    cache,
    localMedia: localMedia({
      createObjectURL: () => {
        throw new Error("an imported localUrl must be reused");
      },
      revokeObjectURL: (url) => revoked.push(url),
    }),
  });
  const localTrack = {
    id: "shared-local",
    type: "local",
    localUrl: "blob:shared-local",
  };

  assert.equal(await bridge.load(localTrack), true);
  const superseded = bridge.load(localTrack);
  const winner = bridge.load(localTrack);
  assert.equal(await superseded, false);
  assert.equal(await winner, true);
  assert.equal(await bridge.load(localTrack), true);
  assert.deepEqual(revoked, []);

  bridge.dispose();
  bridge.dispose();
  assert.deepEqual(revoked, ["blob:shared-local"]);
});

test("File-backed local loads share one adapter-owned URL across candidates", async () => {
  const audio = new FakeAudio();
  const created = [];
  const revoked = [];
  const cache = {
    async acquire() {
      throw new Error("File objects must not enter the built-in cache");
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({
    audio,
    cache,
    localMedia: localMedia({
      createObjectURL() {
        const url = `blob:file-${created.length + 1}`;
        created.push(url);
        return url;
      },
      revokeObjectURL: (url) => revoked.push(url),
    }),
  });
  const track = { id: "file-local", type: "local", file: new Blob(["audio"]) };

  await bridge.load(track);
  await bridge.load(track);
  assert.deepEqual(created, ["blob:file-1"]);
  assert.deepEqual(revoked, []);
  bridge.dispose();
  assert.deepEqual(revoked, ["blob:file-1"]);
});

test("adopting a replacement media element preserves ownership and redirects every control", async () => {
  const original = new FakeAudio();
  const replacement = new FakeAudio();
  const leases = [];
  const cache = {
    async acquire(track) {
      const next = lease(track);
      leases.push(next);
      return next;
    },
    warm() {},
    dispose() {},
  };
  const bridge = createPlaybackBridge({ audio: original, cache });

  await bridge.load({ id: "a", url: "./a.mp3" });
  const firstLease = bridge.currentLease();
  bridge.setVolume(0.4);
  bridge.setLoop(true);
  const originalPauseCalls = original.pauseCalls;
  const originalLoadCalls = original.loadCalls;

  assert.equal(bridge.adoptMedia(replacement), true);
  assert.equal(bridge.currentLease(), firstLease);
  assert.equal(replacement.volume, 0.4);
  assert.equal(replacement.loop, true);
  await bridge.play();
  bridge.pause();
  assert.equal(replacement.playCalls, 1);
  assert.equal(replacement.pauseCalls, 1);
  assert.equal(original.pauseCalls, originalPauseCalls);

  await bridge.load({ id: "b", url: "./b.mp3" });
  assert.equal(replacement.src, "blob:b");
  assert.equal(original.src, "blob:a");
  assert.equal(original.loadCalls, originalLoadCalls);
  assert.equal(firstLease.released, true);
  assert.equal(bridge.currentLease(), leases[1]);
});

test("playback controls delegate to the retained media element", async () => {
  const audio = new FakeAudio();
  const bridge = createPlaybackBridge({
    audio,
    cache: { acquire: async (track) => lease(track), warm() {}, dispose() {} },
  });

  bridge.setVolume(1.5);
  bridge.setLoop(true);
  assert.equal(audio.volume, 1);
  assert.equal(audio.loop, true);
  await bridge.play();
  bridge.pause();
  assert.equal(audio.paused, true);
});

test("local playback acquires through the local media adapter", async () => {
  const audio = new FakeAudio();
  const acquired = [];
  const bridge = createPlaybackBridge({
    audio,
    media: { acquire: async () => { throw new Error("static media must not own local files"); }, warm() {} },
    localMedia: {
      acquire(track) {
        acquired.push(track.id);
        return lease(track);
      },
    },
  });

  assert.equal(await bridge.load({ id: "local-file", type: "local", local: true }), true);
  assert.deepEqual(acquired, ["local-file"]);
  bridge.dispose();
});

test("a supplied lease can load without autoplay and start only after explicit play", async () => {
  const audio = new FakeAudio();
  const supplied = lease({ id: "prepared" });
  const bridge = createPlaybackBridge({
    audio,
    media: { acquire: async () => { throw new Error("prepared media must not refetch"); }, warm() {} },
  });

  assert.equal(await bridge.load(
    { id: "prepared", url: "./prepared.mp3" },
    { lease: supplied, autoplay: true, deferPlay: true },
  ), true);
  assert.equal(audio.playCalls, 0);
  await bridge.play();
  assert.equal(audio.playCalls, 1);
  bridge.dispose();
  assert.equal(supplied.released, true);
});
