import { derivePowerRail } from "./power-rail.js";

const STAGE_LABELS = Object.freeze({
  runtime: "检查图形运行时",
  blacksite: "建立黑站场景",
});

export function createUiController(documentRef) {
  const body = documentRef.body;
  const overlay = documentRef.getElementById("loadingOverlay");
  const progressBar = documentRef.getElementById("loadingProgress");
  const stageLabel = documentRef.getElementById("loadingStage");
  const errorLabel = documentRef.getElementById("loadingError");
  const retryButton = documentRef.getElementById("loadingRetry");

  return {
    renderState(state) {
      body.dataset.appState = state;
      if (state === "ready") overlay?.classList.add("is-complete");
      if (state === "loading") overlay?.classList.remove("is-complete", "has-error");
    },
    renderProgress({ stage, completed, total }) {
      const ratio = total > 0 ? completed / total : 0;
      if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
      if (stageLabel) stageLabel.textContent = STAGE_LABELS[stage] ?? stage;
    },
    renderError(error) {
      overlay?.classList.add("has-error");
      if (errorLabel) errorLabel.textContent = error?.message || "资源加载失败";
      if (retryButton) retryButton.hidden = false;
    },
    bindRetry(handler) {
      retryButton?.addEventListener("click", handler);
    },
    renderPowerGrid(restoredCircuitIds) {
      const stages = derivePowerRail(restoredCircuitIds);
      for (const row of documentRef.querySelectorAll("[data-power-stage]")) {
        const state = stages[row.dataset.powerStage] ?? "off";
        const indicator = row.querySelector("i");
        if (!indicator) continue;
        indicator.classList.toggle("is-live", state === "live");
        indicator.classList.toggle("is-partial", state === "partial");
      }
    },
  };
}
