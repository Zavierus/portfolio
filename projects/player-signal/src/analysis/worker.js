import { analyzeDataset } from "./pipeline.js";

const scope = typeof self === "undefined" ? null : self;

if (scope) {
  scope.addEventListener("message", (event) => {
    const requestId = event.data?.requestId ?? null;
    if (event.data?.type === "ping") {
      scope.postMessage({ type: "ready", requestId });
      return;
    }
    if (event.data?.type !== "analyze") return;
    try {
      const result = analyzeDataset(event.data.dataset, event.data.options, (progress) => {
        scope.postMessage({ type: "progress", requestId, ...progress });
      });
      scope.postMessage({
        type: "complete",
        requestId,
        result,
      });
    } catch (error) {
      scope.postMessage({
        type: "error",
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
