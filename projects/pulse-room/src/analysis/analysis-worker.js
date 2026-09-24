import { analyzeAudioPcm } from "./offline-analysis.js";
import { initializeEssentiaRuntime } from "./essentia-runtime.js";

self.exports = {};
importScripts(
  "./assets/essentia/essentia-wasm.umd.js",
  "./assets/essentia/essentia.js-core.umd.min.js",
);

const essentia = initializeEssentiaRuntime({
  wasmModule: self.exports.EssentiaWASM,
  EssentiaConstructor: self.Essentia,
});

self.addEventListener("message", async ({ data }) => {
  if (data?.type !== "analyze") return;
  const { requestId, trackId, pcm, sampleRate, style } = data;
  try {
    const analysis = analyzeAudioPcm({
      essentia,
      pcm,
      sampleRate,
      style,
      onProgress(progress) {
        self.postMessage({ type: "progress", requestId, trackId, progress });
      },
    });
    self.postMessage({ type: "result", requestId, trackId, analysis });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      trackId,
      code: "WORKER_ANALYSIS_FAILED",
      message: error instanceof Error ? error.message : "Imported audio analysis failed",
    });
  }
});
