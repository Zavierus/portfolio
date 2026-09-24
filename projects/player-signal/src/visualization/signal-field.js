const CATEGORY_COLORS = Object.freeze({
  performance: "#ff695d",
  stability: "#ff876b",
  controls: "#8fb8ff",
  multiplayer: "#a88cff",
  balance: "#ffb44a",
  content: "#5ed3d1",
  onboarding: "#7ed6a2",
  monetization: "#f091c2",
  "base-building": "#72c2e8",
  interface: "#a8c8d4",
});

const NORMALIZED_SLOTS = Object.freeze([
  [0.5, 0.48],
  [0.25, 0.3],
  [0.5, 0.22],
  [0.75, 0.3],
  [0.72, 0.59],
  [0.5, 0.73],
  [0.28, 0.63],
  [0.12, 0.48],
  [0.87, 0.49],
  [0.18, 0.8],
  [0.82, 0.79],
  [0.1, 0.18],
  [0.9, 0.18],
]);

const LABEL_DIRECTIONS = Object.freeze([
  [0, -1], [0, 1], [0, -1], [0, 1], [0, 1], [0, 1], [-1, 0], [0, 1], [0, 1], [0, 1], [0, 1], [1, 0], [-1, 0],
]);

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function createSignalFieldModel(topics, dimensions) {
  const width = Math.max(320, Number(dimensions.width) || 320);
  const height = Math.max(240, Number(dimensions.height) || 240);
  const sorted = [...topics].sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
  const nodes = sorted.map((topic, index) => {
    const slot = NORMALIZED_SLOTS[index % NORMALIZED_SLOTS.length];
    const radius = 16 + Math.max(0, Math.min(1, topic.dimensions?.volume ?? 0)) * 26;
    const x = clamp(width * slot[0], radius + 8, width - radius - 8);
    const y = clamp(height * slot[1], radius + 8, height - radius - 8);
    const [labelDirectionX, labelDirectionY] = LABEL_DIRECTIONS[index % LABEL_DIRECTIONS.length];
    const labelDistance = radius + 15;
    return Object.freeze({
      id: topic.id,
      label: topic.label,
      category: topic.category,
      x,
      y,
      radius,
      labelX: clamp(x + labelDirectionX * (labelDistance + 40), 46, width - 46),
      labelY: clamp(y + labelDirectionY * labelDistance, 15, height - 40),
      color: CATEGORY_COLORS[topic.category] ?? "#a8c8d4",
      brightness: 0.36 + Math.max(0, Math.min(1, topic.dimensions?.velocity ?? 0)) * 0.64,
      pulse: (topic.dimensions?.baselineDeviation ?? 0) >= 0.35 && (topic.confidence ?? 0) >= 0.45,
      score: topic.score,
      count: topic.raw?.count ?? 0,
      workState: topic.workState,
    });
  });
  return Object.freeze({ width, height, nodes: Object.freeze(nodes) });
}

export function nextSignalId(topics, selectedId, direction = 1) {
  if (!Array.isArray(topics) || topics.length === 0) return null;
  const currentIndex = topics.findIndex((topic) => topic.id === selectedId);
  if (currentIndex < 0) return topics[0].id;
  const offset = direction < 0 ? -1 : 1;
  return topics[(currentIndex + offset + topics.length) % topics.length].id;
}

function hexToRgb(color) {
  const value = Number.parseInt(color.slice(1), 16);
  return { r: value >> 16, g: (value >> 8) & 255, b: value & 255 };
}

function rgba(color, alpha) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mountSignalField(canvas, options = {}) {
  const context = canvas.getContext("2d");
  if (!context) return Object.freeze({ render() {}, dispose() {} });
  const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let topics = [];
  let model = createSignalFieldModel([], { width: 320, height: 240 });
  let selectedId = null;
  let frame = 0;
  let disposed = false;
  let time = 0;

  // 3D Orbital
  let rotX = 0.22;
  let rotY = 0.0;
  let targetRotX = 0.22;
  let targetRotY = 0.0;
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(bounds.width));
    const height = Math.max(240, Math.round(bounds.height));
    const pixelRatio = Math.min(1.5, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    model = createSignalFieldModel(topics, { width, height });
  }

  function project3D(x, y, z, w, h) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const cx = x - w / 2;
    const cy = y - h / 2;

    const x1 = cx * cosY + z * sinY;
    const y1 = cy;
    const z1 = -cx * sinY + z * cosY;

    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX + 500;

    const scale = 500 / Math.max(z2, 10);
    return {
      projX: w / 2 + x2 * scale,
      projY: h / 2 + y2 * scale,
      scale,
      z: z2,
    };
  }

  function draw() {
    const { width, height, nodes } = model;
    context.clearRect(0, 0, width, height);
    time += 0.016;

    if (!isDragging) {
      targetRotY += 0.0025;
    }
    rotX += (targetRotX - rotX) * 0.06;
    rotY += (targetRotY - rotY) * 0.06;

    const core = project3D(width / 2, height / 2, 0, width, height);
    context.save();
    context.strokeStyle = "rgba(94, 211, 209, 0.12)";
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(core.projX, core.projY, 90 * core.scale, 40 * core.scale, rotY * 0.5, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    const projectedNodes = nodes.map((node, i) => {
      const zOffset = Math.sin(i * 1.5) * 80;
      const proj = project3D(node.x, node.y, zOffset, width, height);
      return { ...node, ...proj };
    });

    projectedNodes.sort((a, b) => b.z - a.z);

    for (const node of projectedNodes) {
      context.beginPath();
      context.moveTo(core.projX, core.projY);
      context.lineTo(node.projX, node.projY);
      context.strokeStyle = rgba(node.color, 0.12);
      context.stroke();
    }

    for (const node of projectedNodes) {
      const pulse = node.pulse && !reducedMotion ? 1 + Math.sin(time * 0.55 + node.x) * 0.045 : 1;
      const radius = node.radius * node.scale * pulse;

      const gradient = context.createRadialGradient(node.projX, node.projY, radius * 0.1, node.projX, node.projY, radius * 2.2);
      gradient.addColorStop(0, rgba(node.color, 0.5 * node.brightness));
      gradient.addColorStop(0.5, rgba(node.color, 0.12 * node.brightness));
      gradient.addColorStop(1, rgba(node.color, 0));
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(node.projX, node.projY, radius * 2.2, 0, Math.PI * 2);
      context.fill();

      const bodyGrad = context.createRadialGradient(node.projX - radius * 0.3, node.projY - radius * 0.3, radius * 0.1, node.projX, node.projY, radius);
      bodyGrad.addColorStop(0, "#ffffff");
      bodyGrad.addColorStop(0.3, node.color);
      bodyGrad.addColorStop(1, rgba(node.color, 0.6));
      context.fillStyle = bodyGrad;
      context.strokeStyle = selectedId === node.id ? "#ffffff" : rgba(node.color, 0.9);
      context.lineWidth = selectedId === node.id ? 2.5 : 1;
      context.beginPath();
      context.arc(node.projX, node.projY, radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      if (node.pulse || selectedId === node.id) {
        context.strokeStyle = selectedId === node.id ? "#ffb44a" : rgba(node.color, 0.4);
        context.beginPath();
        context.arc(node.projX, node.projY, radius + 6, 0, Math.PI * 2);
        context.stroke();
      }

      context.fillStyle = selectedId === node.id ? "#ffffff" : "#e8f0f2";
      context.font = `600 ${Math.max(10, Math.round(11 * node.scale))}px 'Microsoft YaHei UI', sans-serif`;
      context.textAlign = "center";
      context.fillText(node.label, node.projX, node.projY + radius + 13);
      context.fillStyle = "#78909b";
      context.font = `600 ${Math.max(8, Math.round(9 * node.scale))}px 'Cascadia Mono', monospace`;
      context.fillText(`${String(node.count).padStart(2, "0")} REVIEWS`, node.projX, node.projY + radius + 25);
    }
  }

  function loop() {
    if (disposed) return;
    draw();
    frame = requestAnimationFrame(loop);
  }

  function render(nextTopics, nextSelectedId = null) {
    topics = [...nextTopics];
    selectedId = nextSelectedId;
    cancelAnimationFrame(frame);
    resize();
    draw();
    if (!reducedMotion) frame = requestAnimationFrame(loop);
  }

  function hitTest(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const { width, height, nodes } = model;
    for (const node of nodes) {
      const proj = project3D(node.x, node.y, 0, width, height);
      if (Math.hypot(proj.projX - x, proj.projY - y) <= node.radius * proj.scale + 8) {
        return node;
      }
    }
    return null;
  }

  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (isDragging) {
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      targetRotY += dx * 0.008;
      targetRotX = clamp(targetRotX + dy * 0.008, -1.0, 1.0);
    } else {
      canvas.style.cursor = hitTest(e) ? "pointer" : "default";
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    isDragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  });

  canvas.addEventListener("click", (event) => {
    const node = hitTest(event);
    if (node) options.onSelect?.(node.id);
  });

  canvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Enter") {
      if (selectedId) options.onSelect?.(selectedId);
      return;
    }
    const nextId = nextSignalId(topics, selectedId, event.key === "ArrowLeft" ? -1 : 1);
    if (nextId) options.onSelect?.(nextId);
  });

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => render(topics, selectedId)) : null;
  observer?.observe(canvas);

  return Object.freeze({
    render,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    },
  });
}
