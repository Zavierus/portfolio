const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));

function seeded(index, seed = 1) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createParticles(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: seeded(index, 19),
    y: seeded(index + count, 23),
    size: 0.6 + seeded(index + count * 2, 29) * 1.7,
    speed: 0.18 + seeded(index + count * 3, 31) * 0.48,
    phase: seeded(index + count * 4, 37) * Math.PI * 2,
  }));
}

function drawFogBlob(context, { x, y, radius, color, alpha, scaleX = 1, scaleY = 1 }) {
  context.save();
  context.translate(x, y);
  context.scale(scaleX, scaleY);
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(0.34, `${color}${Math.round(alpha * 0.46 * 255).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(-radius, -radius, radius * 2, radius * 2);
  context.restore();
}

function drawRibbon(context, { width, height, time, color, alpha, offset, tilt }) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `${color}00`);
  gradient.addColorStop(0.28, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(0.72, `${color}${Math.round(alpha * 0.55 * 255).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(1, `${color}00`);
  context.strokeStyle = gradient;
  context.lineWidth = 1.2;
  context.beginPath();
  const startY = height * (0.24 + offset) + Math.sin(time * 0.13 + tilt) * height * 0.025;
  context.moveTo(-40, startY);
  context.bezierCurveTo(
    width * 0.28,
    startY - height * (0.18 + Math.sin(time * 0.11 + tilt) * 0.02),
    width * 0.48,
    startY + height * 0.2,
    width * 0.7,
    startY - height * 0.05,
  );
  context.bezierCurveTo(width * 0.86, startY - height * 0.2, width * 0.96, startY + height * 0.08, width + 40, startY - height * 0.04);
  context.stroke();
}

export function mountAmbientField({
  canvas,
  enabled,
  windowRef = window,
  documentRef = document,
} = {}) {
  if (!canvas || !enabled) return () => {};
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return () => {};

  const state = {
    cssWidth: 1,
    cssHeight: 1,
    time: 0,
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
    visible: true,
    running: false,
    frameId: 0,
    previousTimestamp: null,
    particles: createParticles(54),
  };

  function resize() {
    state.cssWidth = Math.max(1, windowRef.innerWidth || 1);
    state.cssHeight = Math.max(1, windowRef.innerHeight || 1);
    const pixelRatio = Math.min(0.78, Math.max(0.55, (windowRef.devicePixelRatio || 1) * 0.66));
    canvas.width = Math.max(320, Math.round(state.cssWidth * pixelRatio));
    canvas.height = Math.max(220, Math.round(state.cssHeight * pixelRatio));
    canvas.style.width = `${state.cssWidth}px`;
    canvas.style.height = `${state.cssHeight}px`;
    context.setTransform(canvas.width / state.cssWidth, 0, 0, canvas.height / state.cssHeight, 0, 0);
  }

  function draw() {
    const { cssWidth: width, cssHeight: height, time, pointerX, pointerY, scroll } = state;
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = "screen";

    const drift = scroll * height * 0.12;
    drawFogBlob(context, {
      x: width * 0.18 + pointerX * 22,
      y: height * 0.2 - drift * 0.22 + pointerY * 14,
      radius: Math.max(width, height) * 0.36,
      color: "#4ed8c1",
      alpha: 0.24,
      scaleX: 1.24,
      scaleY: 0.72,
    });
    drawFogBlob(context, {
      x: width * 0.78 - pointerX * 20,
      y: height * 0.46 + drift * 0.24 - pointerY * 10,
      radius: Math.max(width, height) * 0.33,
      color: "#e47f78",
      alpha: 0.16,
      scaleX: 0.86,
      scaleY: 1.12,
    });
    drawFogBlob(context, {
      x: width * 0.56 + Math.sin(time * 0.14) * width * 0.06,
      y: height * 0.84 - drift * 0.12,
      radius: Math.max(width, height) * 0.29,
      color: "#756bff",
      alpha: 0.11,
      scaleX: 1.36,
      scaleY: 0.54,
    });

    drawRibbon(context, { width, height, time, color: "#8af4d4", alpha: 0.13, offset: 0.06, tilt: 0.2 });
    drawRibbon(context, { width, height, time: time + 3, color: "#f39f8c", alpha: 0.08, offset: 0.34, tilt: 1.8 });

    for (const [index, particle] of state.particles.entries()) {
      const x = particle.x * width + Math.sin(time * particle.speed + particle.phase) * 10;
      const y = (particle.y * height - time * particle.speed * 12 - drift * (0.12 + particle.x * 0.2)) % height;
      const alpha = 0.035 + (Math.sin(time * particle.speed + particle.phase) * 0.5 + 0.5) * 0.1;
      context.fillStyle = `rgba(205,246,235,${alpha})`;
      context.beginPath();
      context.arc(x, y < 0 ? y + height : y, particle.size * (index % 7 === 0 ? 1.6 : 1), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    const vignette = context.createRadialGradient(width * 0.5, height * 0.45, height * 0.1, width * 0.5, height * 0.5, Math.max(width, height) * 0.76);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.35)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  function start() {
    if (state.running || !state.visible) return;
    state.running = true;
    state.previousTimestamp = null;
    state.frameId = windowRef.requestAnimationFrame(tick);
  }

  function stop() {
    if (!state.running) return;
    state.running = false;
    windowRef.cancelAnimationFrame(state.frameId);
    state.frameId = 0;
  }

  function tick(timestamp) {
    if (!state.running) return;
    const delta = state.previousTimestamp === null ? 0 : Math.min(0.05, Math.max(0, (timestamp - state.previousTimestamp) / 1000));
    state.previousTimestamp = timestamp;
    state.time += delta;
    draw();
    state.frameId = windowRef.requestAnimationFrame(tick);
  }

  const onPointerMove = (event) => {
    state.pointerX = clamp((event.clientX / Math.max(1, state.cssWidth)) * 2 - 1, -1, 1);
    state.pointerY = clamp((event.clientY / Math.max(1, state.cssHeight)) * 2 - 1, -1, 1);
  };
  const onPointerLeave = () => {
    state.pointerX = 0;
    state.pointerY = 0;
  };
  const onScroll = () => {
    const maxScroll = Math.max(1, documentRef.documentElement.scrollHeight - state.cssHeight);
    state.scroll = clamp((windowRef.scrollY || 0) / maxScroll, 0, 1);
  };
  const onVisibilityChange = () => {
    state.visible = !documentRef.hidden;
    if (state.visible) start();
    else stop();
  };

  resize();
  draw();
  windowRef.addEventListener("resize", resize, { passive: true });
  windowRef.addEventListener("pointermove", onPointerMove, { passive: true });
  windowRef.addEventListener("pointerleave", onPointerLeave, { passive: true });
  windowRef.addEventListener("scroll", onScroll, { passive: true });
  documentRef.addEventListener("visibilitychange", onVisibilityChange);
  onScroll();
  start();

  return () => {
    stop();
    windowRef.removeEventListener("resize", resize);
    windowRef.removeEventListener("pointermove", onPointerMove);
    windowRef.removeEventListener("pointerleave", onPointerLeave);
    windowRef.removeEventListener("scroll", onScroll);
    documentRef.removeEventListener("visibilitychange", onVisibilityChange);
    context.clearRect(0, 0, state.cssWidth, state.cssHeight);
  };
}
