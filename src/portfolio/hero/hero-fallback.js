export function setHeroMode(root, mode, reason = null) {
  if (!root) return;
  root.dataset.heroMode = mode;
  root.dataset.heroReason = reason ?? "capable";
  root.querySelector("[data-hero-canvas]")?.toggleAttribute("hidden", mode !== "realtime");
  root.querySelector("[data-hero-poster]")?.removeAttribute("hidden");
}
