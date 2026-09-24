import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createResourceDisposer, disposeObjectTree } from "../src/performance/resource-disposal.js";

test("object-tree disposal releases shared resources exactly once", () => {
  const calls = [];
  const texture = { isTexture: true, dispose: () => calls.push("texture") };
  const material = { map: texture, dispose: () => calls.push("material") };
  const geometry = { dispose: () => calls.push("geometry") };
  const root = {
    traverse(callback) {
      callback({ geometry, material });
      callback({ geometry, material: [material] });
    },
  };

  disposeObjectTree(root);
  assert.deepEqual(calls.sort(), ["geometry", "material", "texture"]);
});

test("resource disposer is idempotent and runs callbacks in reverse order", () => {
  const calls = [];
  const disposer = createResourceDisposer();
  disposer.add(() => calls.push("first"));
  disposer.add(() => calls.push("second"));

  assert.equal(disposer.dispose(), true);
  assert.equal(disposer.dispose(), false);
  assert.deepEqual(calls, ["second", "first"]);
  assert.throws(() => disposer.add(() => {}), /disposed/);
});

test("the unified music space registers and releases every GPU resource", async () => {
  const sources = await Promise.all([
    "00-pointer-cover-particles.js",
    "01-float-skull-backcover.js",
    "03-background-star-river.js",
    "15-ripples-cover-depth.js",
  ].map((file) => readFile(`projects/pulse-room/src/mineradio/02-visual/${file}`, "utf8")));
  const runtime = sources.join("\n");
  assert.match(runtime, /function registerMusicSpaceResource/);
  assert.match(runtime, /musicSpaceResources\.push\(resource\)/);
  assert.match(runtime, /function disposeUnifiedMusicSpace/);
  assert.match(runtime, /resource\.dispose\(\)/);
  assert.match(runtime, /musicSpaceResources\.length = 0/);
  assert.match(runtime, /beforeunload[^\n]*disposeUnifiedMusicSpace/);
});
