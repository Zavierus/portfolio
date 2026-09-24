import * as THREE from "three";
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";

import { detectPerformanceEnvironment, resolvePerformanceQuality } from "./quality-policy.js";
import { createResourceDisposer, disposeObjectTree } from "./resource-disposal.js";

const viewportFor = (windowRef, canvas) => ({
  width: Math.max(1, windowRef?.innerWidth ?? canvas.clientWidth ?? 1),
  height: Math.max(1, windowRef?.innerHeight ?? canvas.clientHeight ?? 1),
});

export function createVjStage(canvas, options = {}) {
  if (!canvas) throw new TypeError("VJ stage requires a canvas");
  const windowRef = options.windowRef ?? globalThis.window;
  const quality = options.quality ?? resolvePerformanceQuality(detectPerformanceEnvironment({ windowRef }));
  const resources = createResourceDisposer();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.id === "high",
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050506);
  scene.fog = new THREE.FogExp2(0x050506, 0.045);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 220);
  const composer = new EffectComposer(renderer, { multisampling: 0 });
  composer.addPass(new RenderPass(scene, camera));

  let bloom = null;
  if (quality.bloom) {
    bloom = new SelectiveBloomEffect(scene, camera, {
      intensity: 1.15,
      luminanceThreshold: 0.62,
      luminanceSmoothing: 0.18,
      mipmapBlur: true,
    });
  }
  const effects = [bloom].filter(Boolean);
  if (effects.length) composer.addPass(new EffectPass(camera, ...effects));

  let contextLost = false;
  let disposed = false;
  const onContextLost = (event) => {
    event.preventDefault();
    contextLost = true;
    canvas.dataset.context = "lost";
    options.onContextLost?.();
  };
  const onContextRestored = () => {
    contextLost = false;
    canvas.dataset.context = "ready";
    resize();
    options.onContextRestored?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);

  function resize() {
    if (disposed) return false;
    const { width, height } = viewportFor(windowRef, canvas);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    return true;
  }

  resize();

  return Object.freeze({
    canvas,
    renderer,
    scene,
    camera,
    composer,
    bloom,
    quality,
    resources,
    addBloom(object) {
      bloom?.selection.add(object);
      return object;
    },
    removeBloom(object) {
      bloom?.selection.delete(object);
    },
    render(delta = 1 / 60) {
      if (disposed || contextLost) return false;
      composer.render(Math.min(0.05, Math.max(0, delta)));
      return true;
    },
    resize,
    dispose() {
      if (disposed) return false;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
      resources.dispose();
      disposeObjectTree(scene);
      composer.dispose();
      renderer.dispose();
      return true;
    },
    get contextLost() {
      return contextLost;
    },
  });
}
