function selectNode(root, node, nodes) {
  if (!node) return;
  const kicker = root.querySelector("[data-constellation-kicker]");
  const title = root.querySelector("[data-constellation-title]");
  const description = root.querySelector("[data-constellation-description]");
  const status = root.querySelector("[data-constellation-status]");
  const key = node.dataset.constellationNode;

  root.dataset.active = key;
  nodes.forEach((candidate) => {
    const active = candidate === node;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-current", active ? "true" : "false");
  });
  if (kicker) kicker.textContent = node.dataset.kicker || "LIVE PROJECT";
  if (title) title.textContent = node.dataset.title || "PROJECT";
  if (description) description.textContent = node.dataset.description || "";
  if (status) status.textContent = `NODE ${node.querySelector(".constellation-node-index")?.textContent || "--"} / ACTIVE`;
}

export function mountConstellation({
  root,
  windowRef = window,
} = {}) {
  if (!root) return () => {};
  const field = root.querySelector("[data-constellation-field]");
  const nodes = [...root.querySelectorAll("[data-constellation-node]")];
  if (!field || nodes.length === 0) return () => {};

  const pointer = { x: 0, y: 0 };
  const setPointer = (x, y) => {
    pointer.x += (x - pointer.x) * 0.16;
    pointer.y += (y - pointer.y) * 0.16;
    field.style.setProperty("--constellation-pointer-x", `${pointer.x.toFixed(3)}`);
    field.style.setProperty("--constellation-pointer-y", `${pointer.y.toFixed(3)}`);
  };
  const onPointerMove = (event) => {
    const bounds = field.getBoundingClientRect();
    setPointer(
      ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
      ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1,
    );
  };
  const onPointerLeave = () => setPointer(0, 0);
  const onNodeEnter = (event) => selectNode(root, event.currentTarget, nodes);

  field.addEventListener("pointermove", onPointerMove, { passive: true });
  field.addEventListener("pointerleave", onPointerLeave, { passive: true });
  nodes.forEach((node) => {
    node.addEventListener("pointerenter", onNodeEnter, { passive: true });
    node.addEventListener("focus", onNodeEnter, { passive: true });
  });

  const initial = nodes.find((node) => node.dataset.constellationNode === "pulse-room") || nodes[0];
  selectNode(root, initial, nodes);
  field.style.setProperty("--constellation-pointer-x", "0");
  field.style.setProperty("--constellation-pointer-y", "0");

  return () => {
    field.removeEventListener("pointermove", onPointerMove);
    field.removeEventListener("pointerleave", onPointerLeave);
    nodes.forEach((node) => {
      node.removeEventListener("pointerenter", onNodeEnter);
      node.removeEventListener("focus", onNodeEnter);
      node.removeAttribute("aria-current");
    });
    root.removeAttribute("data-active");
    field.style.removeProperty("--constellation-pointer-x");
    field.style.removeProperty("--constellation-pointer-y");
  };
}
