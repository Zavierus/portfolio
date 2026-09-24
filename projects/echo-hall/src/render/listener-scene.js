import * as THREE from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

import { ListenerArtifactController } from "../listener/listener-artifact-controller.js";
import { sampleListenerState } from "../listener/listener-state.js";
import { MemoryReconstruction } from "../memory/memory-reconstruction.js";
import { sampleMemoryState } from "../memory/memory-state.js";
import { Megastructure } from "../world/megastructure.js";
import { sampleMegastructureState } from "../world/megastructure-state.js";
import { CameraProgram } from "./camera-program.js";
import { QUALITY_PRESETS, capPixelRatio } from "./quality-policy.js";

export class ListenerScene {
  constructor({ canvas, quality = "high", reducedMotion = false }) {
    this.canvas = canvas;
    this.quality = quality;
    this.reducedMotion = reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== "low", powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070808);
    this.scene.fog = new THREE.FogExp2(0x070808, 0.018);
    this.cameraProgram = new CameraProgram({ aspect: 1 });
    this.listener = null;
    this.disposed = false;
    this.megastructure = new Megastructure({ scene: this.scene });
    this.memory = new MemoryReconstruction({ scene: this.scene });
    this._addLights();
    this.composer = new EffectComposer(this.renderer, { multisampling: quality === "high" ? 2 : 0 });
    this.composer.addPass(new RenderPass(this.scene, this.cameraProgram.camera));
    this.bloom = new BloomEffect({ intensity: 0.5, luminanceThreshold: 0.84, luminanceSmoothing: 0.16 });
    this.effectPass = new EffectPass(this.cameraProgram.camera, this.bloom);
    this.composer.addPass(this.effectPass);
    this.setQuality(quality);
  }

  setEnvironment(texture) {
    if (texture) this.scene.environment = texture;
  }

  mountListenerArtifact(asset) {
    if (this.disposed) return false;
    this.listener?.dispose();
    this.listener = new ListenerArtifactController({
      scene: this.scene,
      asset,
      quality: this.quality,
    });
    return true;
  }

  render(time) {
    const listenerState = sampleListenerState(time);
    const structureState = sampleMegastructureState(time);
    const memoryState = sampleMemoryState(time);
    this.listener?.update(listenerState);
    this.megastructure.update(structureState);
    this.memory.update(memoryState);
    const cameraState = this.cameraProgram.apply(time);
    this.canvas.dataset.shot = cameraState.shotId;
    this.canvas.dataset.chapter = cameraState.chapterId;
    this.scanLight.intensity = 0.8 + listenerState.scanResponse * 9;
    this.warningLight.intensity = memoryState.earthReveal * 7 + listenerState.coreExposure * 6;
    this.archiveLight.intensity = memoryState.bodyCompletion * 9;
    if (this.effectPass.enabled) this.composer.render();
    else this.renderer.render(this.scene, this.cameraProgram.camera);
    return cameraState;
  }

  resize(width, height) {
    const safeWidth = Math.max(1, Math.round(width));
    const safeHeight = Math.max(1, Math.round(height));
    this.renderer.setSize(safeWidth, safeHeight, false);
    this.composer.setSize(safeWidth, safeHeight);
    this.cameraProgram.resize(safeWidth / safeHeight);
  }

  setQuality(level) {
    if (!QUALITY_PRESETS[level]) return false;
    const preset = QUALITY_PRESETS[level];
    this.quality = level;
    this.renderer.setPixelRatio(capPixelRatio(globalThis.devicePixelRatio ?? 1, level));
    this.renderer.shadowMap.enabled = preset.shadowMapSize > 0;
    this.effectPass.enabled = preset.postprocessing && !this.reducedMotion;
    this.listener?.setQuality(level);
    this.memory.setQuality(level);
    return true;
  }

  setReducedMotion(reduced) {
    this.reducedMotion = Boolean(reduced);
    this.effectPass.enabled = QUALITY_PRESETS[this.quality].postprocessing && !this.reducedMotion;
  }

  dispose() {
    if (this.disposed) return false;
    this.disposed = true;
    this.listener?.dispose();
    this.megastructure.dispose();
    this.memory.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    return true;
  }

  _addLights() {
    this.scene.add(new THREE.HemisphereLight(0x9aa3a0, 0x030404, 0.48));
    const key = new THREE.DirectionalLight(0xebeae4, 3.6);
    key.position.set(-5, 8, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);
    this.scanLight = new THREE.PointLight(0x44e7ff, 5, 20, 2);
    this.scanLight.position.set(-2.5, 2.6, 3.4);
    this.scene.add(this.scanLight);
    this.warningLight = new THREE.PointLight(0xff3a22, 0, 18, 2);
    this.warningLight.position.set(0, 0, -1.5);
    this.scene.add(this.warningLight);
    const acid = new THREE.PointLight(0xd9ff32, 3.2, 10, 2);
    acid.position.set(-0.8, 1.2, 2.2);
    this.scene.add(acid);
    this.archiveLight = new THREE.PointLight(0xc9f8ff, 0, 14, 1.8);
    this.archiveLight.position.set(0.6, 1.5, 0.2);
    this.scene.add(this.archiveLight);
  }
}
