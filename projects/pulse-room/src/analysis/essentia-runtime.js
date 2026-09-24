export function initializeEssentiaRuntime({ wasmModule, EssentiaConstructor }) {
  if (typeof EssentiaConstructor !== "function") {
    throw new TypeError("Essentia core runtime must expose a constructor");
  }

  if (!wasmModule || typeof wasmModule.EssentiaJS !== "function") {
    throw new TypeError("Essentia worker runtime exposed an invalid WASM module");
  }
  return new EssentiaConstructor(wasmModule);
}
