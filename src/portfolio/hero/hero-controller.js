import { setHeroMode } from "./hero-fallback.js";
import { chooseHeroMode, HeroFrameBudget } from "./hero-quality-policy.js";
import { HeroScene } from "./hero-scene.js";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));

export class HeroController {
  constructor({
    scene,
    requestFrame = (callback) => requestAnimationFrame(callback),
    cancelFrame = (id) => cancelAnimationFrame(id),
    frameBudget = new HeroFrameBudget(),
    onFallback = () => {},
  }) {
    this.scene = scene;
    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.frameBudget = frameBudget;
    this.onFallback = onFallback;
    this.visible = true;
    this.running = false;
    this.disposed = false;
    this.frameId = 0;
    this.time = 0;
    this.pointer = [0, 0];
    this.scrollProgress = 0;
    this.previousTimestamp = null;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this.disposed || this.running || !this.visible) return false;
    this.running = true;
    this.previousTimestamp = null;
    this.frameId = this.requestFrame(this._tick);
    return true;
  }

  setVisible(visible) {
    const next = Boolean(visible);
    if (next === this.visible) return false;
    this.visible = next;
    if (next) this.start();
    else this.stop();
    return true;
  }

  stop() {
    if (!this.running) return false;
    this.running = false;
    this.cancelFrame(this.frameId);
    this.frameId = 0;
    return true;
  }

  setPointer(x, y) {
    this.pointer = [clamp(x, -1, 1), clamp(y, -1, 1)];
  }

  setScrollProgress(progress) {
    this.scrollProgress = clamp(progress, 0, 1);
  }

  resize(width, height) {
    this.scene.resize(width, height);
  }

  dispose() {
    if (this.disposed) return false;
    this.disposed = true;
    this.stop();
    this.scene.dispose();
    return true;
  }

  _tick(timestamp) {
    if (!this.running || this.disposed) return;
    const delta = this.previousTimestamp === null
      ? 0
      : Math.min(0.05, Math.max(0, (timestamp - this.previousTimestamp) / 1000));
    this.previousTimestamp = timestamp;
    this.time += delta;
    try {
      this.scene.render({
        time: this.time,
        pointer: this.pointer,
        scrollProgress: this.scrollProgress,
      });
    } catch (error) {
      this.stop();
      this.onFallback("poster", "render-error", error);
      return;
    }
    const budgetEvent = this.frameBudget.record(delta * 1000);
    if (budgetEvent?.level === "low") this.scene.setQuality("low");
    if (budgetEvent?.level === "poster") {
      this.stop();
      this.onFallback("poster", budgetEvent.reason);
      return;
    }
    this.frameId = this.requestFrame(this._tick);
  }
}

function supportsWebGL(windowRef, documentRef) {
  if (!windowRef.WebGLRenderingContext) return false;
  try {
    const testCanvas = documentRef.createElement("canvas");
    const context = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    const supported = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

export function mountHero({
  root,
  motionPolicy,
  windowRef = window,
  documentRef = document,
} = {}) {
  if (!root) return () => {};
  const canvas = root.querySelector("[data-hero-canvas]");
  const mode = chooseHeroMode({
    webgl: supportsWebGL(windowRef, documentRef),
    reducedMotion: motionPolicy?.reason === "reduced-motion",
    saveData: motionPolicy?.reason === "save-data",
    desktop: motionPolicy?.effects?.realtimeHero === true,
  });
  setHeroMode(root, mode, motionPolicy?.reason);
  if (mode !== "realtime" || !canvas) return () => {};

  let scene;
  try {
    scene = new HeroScene({ canvas });
  } catch (error) {
    console.warn("Portfolio hero switched to prerendered media", error);
    setHeroMode(root, "poster", "webgl-init-failed");
    return () => {};
  }

  const controller = new HeroController({
    scene,
    onFallback: (fallbackMode, reason, error) => {
      if (error) console.warn("Portfolio hero rendering stopped", error);
      setHeroMode(root, fallbackMode, reason);
    },
  });
  const resize = () => {
    const bounds = root.getBoundingClientRect();
    controller.resize(bounds.width, bounds.height);
  };
  const updateScroll = () => {
    const bounds = root.getBoundingClientRect();
    controller.setScrollProgress(clamp(-bounds.top / Math.max(1, bounds.height * 0.78), 0, 1));
  };
  const updatePointer = (event) => {
    const bounds = root.getBoundingClientRect();
    controller.setPointer(
      ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1,
      -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1),
    );
  };
  const resetPointer = () => controller.setPointer(0, 0);

  const observer = "IntersectionObserver" in windowRef
    ? new windowRef.IntersectionObserver(([entry]) => controller.setVisible(entry.isIntersecting), { threshold: 0.02 })
    : null;
  observer?.observe(root);
  root.addEventListener("pointermove", updatePointer, { passive: true });
  root.addEventListener("pointerleave", resetPointer, { passive: true });
  windowRef.addEventListener("resize", resize, { passive: true });
  windowRef.addEventListener("scroll", updateScroll, { passive: true });
  resize();
  updateScroll();
  controller.start();

  return () => {
    observer?.disconnect();
    root.removeEventListener("pointermove", updatePointer);
    root.removeEventListener("pointerleave", resetPointer);
    windowRef.removeEventListener("resize", resize);
    windowRef.removeEventListener("scroll", updateScroll);
    controller.dispose();
  };
}
