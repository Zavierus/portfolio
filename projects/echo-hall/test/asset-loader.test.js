import assert from "node:assert/strict";
import test from "node:test";

import { AssetLoadError, loadEchoAssets } from "../src/assets/asset-loader.js";

const asset = (overrides = {}) => ({
  id: "runner",
  file: "models/runner.glb",
  type: "model",
  critical: true,
  bytes: 100,
  ...overrides,
});

const adapters = (overrides = {}) => ({
  gltf: async (url) => ({ kind: "gltf", url }),
  texture: async (url) => ({ kind: "texture", url }),
  audio: async (url) => ({ kind: "audio", url }),
  ...overrides,
});

test("loads critical and non-critical assets through injected adapters", async () => {
  const manifest = [
    asset(),
    asset({ id: "lighting", file: "textures/studio.hdr", type: "environment-light", critical: false, bytes: 50 }),
    asset({ id: "score", file: "audio/score.wav", type: "audio", critical: false, bytes: 25 }),
  ];

  const result = await loadEchoAssets(manifest, { adapters: adapters() });

  assert.deepEqual(result.assets, {
    runner: { kind: "gltf", url: "./assets/models/runner.glb" },
    lighting: { kind: "texture", url: "./assets/textures/studio.hdr" },
    score: { kind: "audio", url: "./assets/audio/score.wav" },
  });
  assert.deepEqual(result.warnings, []);
});

test("reports byte-weighted progress monotonically from zero to one", async () => {
  const progress = [];
  const manifest = [
    asset({ bytes: 60 }),
    asset({ id: "lighting", file: "textures/studio.hdr", type: "environment-light", critical: false, bytes: 30 }),
    asset({ id: "score", file: "audio/score.wav", type: "audio", critical: false, bytes: 10 }),
  ];
  const injected = adapters({
    gltf: async (_url, { onProgress }) => {
      onProgress(0.25);
      onProgress(0.1);
      onProgress(1);
      return "runner";
    },
    texture: async (_url, { onProgress }) => {
      onProgress(0.5);
      return "lighting";
    },
    audio: async () => "score",
  });

  await loadEchoAssets(manifest, { adapters: injected, onProgress: (value) => progress.push(value) });

  assert.equal(progress[0], 0);
  assert.equal(progress.at(-1), 1);
  assert.ok(progress.some((value) => Math.abs(value - 0.15) < 1e-9), "runner progress should contribute 60% of its ratio");
  assert.ok(progress.every((value, index) => index === 0 || value >= progress[index - 1]), "progress must not regress");
  assert.ok(progress.every((value) => value >= 0 && value <= 1));
});

test("continues after a non-critical failure and returns a warning", async () => {
  const failure = new Error("HDR decode failed");
  let attempts = 0;
  const result = await loadEchoAssets([
    asset(),
    asset({ id: "lighting", file: "textures/studio.hdr", type: "environment-light", critical: false, bytes: 50 }),
  ], {
    adapters: adapters({
      texture: async () => {
        attempts += 1;
        throw failure;
      },
    }),
  });

  assert.equal(attempts, 2);
  assert.deepEqual(result.assets.runner, { kind: "gltf", url: "./assets/models/runner.glb" });
  assert.equal(Object.hasOwn(result.assets, "lighting"), false);
  assert.deepEqual(result.warnings, [{ id: "lighting", error: failure }]);
});

test("rejects with only failed critical IDs after all loads settle", async () => {
  const manifest = [
    asset({ id: "runner-a" }),
    asset({ id: "runner-b", file: "models/runner-b.glb" }),
    asset({ id: "lighting", file: "textures/studio.hdr", type: "environment-light", critical: false }),
  ];

  await assert.rejects(
    loadEchoAssets(manifest, {
      adapters: adapters({
        gltf: async () => { throw new Error("model unavailable"); },
        texture: async () => { throw new Error("optional unavailable"); },
      }),
    }),
    (error) => {
      assert.ok(error instanceof AssetLoadError);
      assert.deepEqual(error.failedIds, ["runner-a", "runner-b"]);
      return true;
    },
  );
});

test("retries a failed load once and preserves the successful value", async () => {
  let attempts = 0;
  const result = await loadEchoAssets([asset()], {
    adapters: adapters({
      gltf: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("transient");
        return { scene: "loaded" };
      },
    }),
  });

  assert.equal(attempts, 2);
  assert.deepEqual(result, { assets: { runner: { scene: "loaded" } }, warnings: [] });
});

test("aborts promptly without retrying", async () => {
  const controller = new AbortController();
  let attempts = 0;
  let receivedSignal;
  const loading = loadEchoAssets([asset()], {
    signal: controller.signal,
    adapters: adapters({
      gltf: (_url, { signal }) => {
        attempts += 1;
        receivedSignal = signal;
        return new Promise(() => {});
      },
    }),
  });

  controller.abort("navigation");

  await assert.rejects(loading, (error) => error?.name === "AbortError");
  assert.equal(attempts, 1);
  assert.equal(receivedSignal, controller.signal);
});

test("enforces local manifest paths before invoking an adapter", async () => {
  let attempts = 0;
  const injected = adapters({
    gltf: async () => {
      attempts += 1;
      return "unexpected";
    },
  });

  await assert.rejects(
    loadEchoAssets([
      asset({ id: "remote", file: "https://cdn.example.test/runner.glb" }),
      asset({ id: "traversal", file: "../runner.glb" }),
      asset({ id: "encoded-traversal", file: "%2e%2e/runner.glb" }),
    ], { adapters: injected }),
    (error) => {
      assert.ok(error instanceof AssetLoadError);
      assert.deepEqual(error.failedIds, ["remote", "traversal", "encoded-traversal"]);
      return true;
    },
  );
  assert.equal(attempts, 0);
});
