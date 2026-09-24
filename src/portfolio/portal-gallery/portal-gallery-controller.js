const PROJECT_NAMES = {
  "frame-zero": "FRAME//ZERO",
  "pulse-room": "PULSE ROOM",
  "set-flow": "SET//FLOW",
  "player-signal": "PLAYER SIGNAL",
  "relic-01": "RELIC//01",
};

function setFocus(root, portals, status, next) {
  root.dataset.focus = next || "";
  portals.forEach((portal) => {
    portal.classList.toggle("is-focused", portal.dataset.portal === next);
  });

  if (!status) return;
  status.dataset.state = next || "";
  const value = status.querySelector("strong");
  if (value) value.textContent = next ? PROJECT_NAMES[next] : "MOVE TO CHOOSE";
}

export function mountPortalGallery({ root } = {}) {
  if (!root) return () => {};

  const field = root.querySelector("[data-portal-field]");
  const portals = [...root.querySelectorAll("[data-portal]")];
  const status = root.querySelector("[data-portal-status]");
  if (!field || portals.length === 0) return () => {};

  const transition = document.querySelector("[data-project-transition]");
  const transitionImage = transition?.querySelector("[data-project-transition-image]");
  const transitionLabel = transition?.querySelector("[data-project-transition-label]");
  const entryLinks = [...document.querySelectorAll("[data-project-preview][href]")];

  let pointerFrame = 0;
  let transitionTimer = 0;
  let focus = "";
  const updateFocus = (next) => {
    if (focus === next) return;
    focus = next;
    setFocus(root, portals, status, next);
  };

  const handlePointerEnter = (event) => {
    updateFocus(event.currentTarget.dataset.portal || "");
  };

  const handleFocus = (event) => {
    updateFocus(event.currentTarget.dataset.portal || "");
  };

  const handlePointerMove = (event) => {
    const rect = field.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      root.style.setProperty("--portal-pointer-x", `${x.toFixed(2)}px`);
      root.style.setProperty("--portal-pointer-y", `${y.toFixed(2)}px`);
    });
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(pointerFrame);
    root.style.setProperty("--portal-pointer-x", "0px");
    root.style.setProperty("--portal-pointer-y", "0px");
    updateFocus("");
  };

  const handleEntryClick = (event) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || !transition
    ) return;

    const link = event.currentTarget;
    const project = link.dataset.projectPreview;
    const href = link.href;
    if (!project || !href || document.documentElement.dataset.pageTransition === "entering") return;

    event.preventDefault();
    const surface = link.querySelector("[data-project-preview-surface]")
      || link.querySelector(".project-media")
      || link;
    const media = surface.querySelector("img") || link.querySelector("img");
    const rect = surface.getBoundingClientRect();
    const duration = 120;

    transition.style.setProperty("--transition-left", `${rect.left}px`);
    transition.style.setProperty("--transition-top", `${rect.top}px`);
    transition.style.setProperty("--transition-width", `${rect.width}px`);
    transition.style.setProperty("--transition-height", `${rect.height}px`);
    if (transitionImage && media) transitionImage.src = media.currentSrc || media.src;
    if (transitionLabel) transitionLabel.textContent = PROJECT_NAMES[project] || project;
    try {
      const transitionPayload = JSON.stringify({
        image: media?.currentSrc || media?.src || "",
        label: PROJECT_NAMES[project] || project,
        timestamp: Date.now(),
      });
      window.sessionStorage.setItem("zeno:project-transition", transitionPayload);
      window.sessionStorage.setItem("ziaver:project-transition", transitionPayload);
    } catch {
      // A blocked storage area should not prevent the project from opening.
    }
    transition.dataset.project = project;
    transition.dataset.state = "entering";
    document.documentElement.dataset.pageTransition = "entering";
    document.body.classList.add("is-project-transitioning");

    transitionTimer = window.setTimeout(() => {
      window.location.assign(href);
    }, duration);
  };

  portals.forEach((portal) => {
    portal.addEventListener("pointerenter", handlePointerEnter);
    portal.addEventListener("focus", handleFocus);
  });
  field.addEventListener("pointermove", handlePointerMove);
  field.addEventListener("pointerleave", handlePointerLeave);
  entryLinks.forEach((link) => link.addEventListener("click", handleEntryClick));
  root.style.setProperty("--portal-pointer-x", "0px");
  root.style.setProperty("--portal-pointer-y", "0px");

  return () => {
    cancelAnimationFrame(pointerFrame);
    window.clearTimeout(transitionTimer);
    portals.forEach((portal) => {
      portal.removeEventListener("pointerenter", handlePointerEnter);
      portal.removeEventListener("focus", handleFocus);
    });
    field.removeEventListener("pointermove", handlePointerMove);
    field.removeEventListener("pointerleave", handlePointerLeave);
    entryLinks.forEach((link) => link.removeEventListener("click", handleEntryClick));
    root.style.removeProperty("--portal-pointer-x");
    root.style.removeProperty("--portal-pointer-y");
    root.removeAttribute("data-focus");
    portals.forEach((portal) => portal.classList.remove("is-focused"));
    document.documentElement.removeAttribute("data-page-transition");
    document.body.classList.remove("is-project-transitioning");
  };
}

