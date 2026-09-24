export function createPortfolioAdapter({
  documentRef = globalThis.document,
  locationRef = globalThis.location,
} = {}) {
  const sourceButton = documentRef?.getElementById?.("source-license") ?? null;
  const sourceDialog = documentRef?.getElementById?.("source-license-dialog") ?? null;
  const backButton = documentRef?.getElementById?.("portfolio-back") ?? null;
  let disposed = false;

  function openSource() {
    if (disposed || !sourceDialog) return false;
    if (typeof sourceDialog.showModal === "function") sourceDialog.showModal();
    else sourceDialog.setAttribute?.("open", "");
    return true;
  }

  function back() {
    if (disposed) return false;
    const target = backButton?.getAttribute?.("href") || "../../index.html?ziaver=latest";
    if (typeof locationRef?.assign === "function") locationRef.assign(target);
    else if (locationRef) locationRef.href = target;
    else return false;
    return true;
  }

  function onSourceClick(event) {
    event?.preventDefault?.();
    openSource();
  }

  function onBackClick(event) {
    event?.preventDefault?.();
    back();
  }

  function onDialogClick(event) {
    if (event?.target === sourceDialog) sourceDialog.close?.();
  }

  if (sourceButton && sourceDialog) {
    sourceButton.dataset.bound = "true";
    sourceButton.addEventListener("click", onSourceClick);
    sourceDialog.addEventListener("click", onDialogClick);
  }
  backButton?.addEventListener("click", onBackClick);

  return Object.freeze({
    openSource,
    back,
    dispose() {
      if (disposed) return false;
      disposed = true;
      sourceButton?.removeEventListener("click", onSourceClick);
      sourceDialog?.removeEventListener("click", onDialogClick);
      backButton?.removeEventListener("click", onBackClick);
      if (sourceButton?.dataset) delete sourceButton.dataset.bound;
      return true;
    },
  });
}
