import assert from "node:assert/strict";
import test from "node:test";

import { initializeEssentiaRuntime } from "../src/analysis/essentia-runtime.js";

test("Essentia runtime constructs the API from a worker-compatible WASM module", async () => {
  const wasmModule = { EssentiaJS: class FakeEssentiaBackend {} };
  let constructorArgument = null;

  class FakeEssentia {
    constructor(module) {
      constructorArgument = module;
    }
  }

  const runtime = await initializeEssentiaRuntime({
    wasmModule,
    EssentiaConstructor: FakeEssentia,
  });

  assert.equal(constructorArgument, wasmModule);
  assert.ok(runtime instanceof FakeEssentia);
});
