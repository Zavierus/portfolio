import { createPerformanceDirector } from "./performance/performance-director.js";
import { createPerformanceModuleLoader } from "./performance/performance-registry.js";
import { createVjStage } from "./performance/vj-stage.js";
import { loadNullCathedralModule } from "./performance/worlds/null-cathedral.js";
import { loadPacketBloomModule } from "./performance/worlds/packet-bloom.js";
import { loadSignalChrysalisModule } from "./performance/worlds/signal-chrysalis.js";
import { loadSignalFieldModule } from "./performance/worlds/signal-field.js";
import { loadTriuneGateModule } from "./performance/worlds/triune-gate.js";

export function createVisualizer(canvas, { onError = () => {} } = {}) {
  const stage = createVjStage(canvas, {
    onContextLost() {
      const error = new Error("PULSE ROOM lost its WebGL context");
      error.code = "WEBGL_CONTEXT_LOST";
      canvas.dataset.performanceState = "context-lost";
      onError(error, null);
    },
    onContextRestored() {
      canvas.dataset.performanceState = canvas.dataset.performance ? "performing" : "idle";
    },
  });
  const fallback = () => loadSignalFieldModule({ stage });
  const loadPerformance = createPerformanceModuleLoader({
    "signal-chrysalis": () => loadSignalChrysalisModule({ stage }),
    "triune-gate": () => loadTriuneGateModule({ stage }),
    "null-cathedral": () => loadNullCathedralModule({ stage }),
    "packet-bloom": () => loadPacketBloomModule({ stage }),
    "signal-field": fallback,
  });
  const director = createPerformanceDirector({
    stage,
    loadPerformance,
    onStateChange(state, descriptor) {
      canvas.dataset.performanceState = state;
      if (descriptor?.id) canvas.dataset.performance = descriptor.id;
    },
    onError(error, track) {
      canvas.dataset.performanceState = "fallback";
      onError(error, track);
    },
  });

  let disposed = false;
  return Object.freeze({
    canvas,
    async selectTrack(track, options = {}) {
      if (disposed) return false;
      return director.select(track, options);
    },
    update(frame = {}, delta = 1 / 60) {
      if (disposed) return false;
      director.update(frame, delta);
      return stage.render(delta);
    },
    resize: stage.resize,
    dispose() {
      if (disposed) return false;
      disposed = true;
      director.dispose();
      stage.dispose();
      return true;
    },
    get activePerformance() {
      return director.activeId;
    },
  });
}
