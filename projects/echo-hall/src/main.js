import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import assetManifest from "../assets/asset-manifest.json";
import { loadEchoAssets } from "./assets/asset-loader.js";
import {
  resolveListenerAssetManifest,
  validateListenerArtifactAsset,
} from "./assets/listener-artifact-contract.js";
import { AudioDirector } from "./audio/audio-director.js";
import { WebAudioAdapter } from "./audio/web-audio-adapter.js";
import { FilmDirector } from "./film/film-director.js";
import { CHAPTERS, FILM_DURATION } from "./film/film-model.js";
import { ListenerScene } from "./render/listener-scene.js";
import { QualityPolicy, selectInitialQuality } from "./render/quality-policy.js";
import { createFilmUI } from "./ui/film-ui.js";

const canvas = document.getElementById("filmCanvas");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(pointer: coarse)");
const qaTimeScale = THREE.MathUtils.clamp(Number(window.__LISTENER_QA__?.timeScale) || 1, 1, 24);

let listenerScene = null;
let audioAdapter = null;
let audioDirector = null;
let filmDirector = null;
let qualityPolicy = null;
let frameId = 0;
let previousFrame = performance.now();
let resumeAfterVisibility = false;
let bootController = null;

const ui = createFilmUI({
  onIntent(intent) {
    if (intent.type === "retry") window.location.reload();
    if (intent.type === "play") beginPlayback();
    if (intent.type === "replay") replay();
    if (intent.type === "exit") exitFilm();
    if (intent.type === "toggle-sound") toggleSound();
  },
});

function loadWith(loader, url, { onProgress, signal, transform = (value) => value }) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Asset loading was aborted", "AbortError"));
    const onAbort = () => reject(new DOMException("Asset loading was aborted", "AbortError"));
    signal?.addEventListener("abort", onAbort, { once: true });
    loader.load(url, (value) => {
      signal?.removeEventListener("abort", onAbort);
      resolve(transform(value));
    }, onProgress, (error) => {
      signal?.removeEventListener("abort", onAbort);
      reject(error);
    });
  });
}

function createAssetAdapters(renderer) {
  const rgbeLoader = new RGBELoader();
  return {
    async gltf(url, context) {
      const ktx2Loader = new KTX2Loader().setTranscoderPath("./assets/basis/").detectSupport(renderer);
      const gltfLoader = new GLTFLoader().setKTX2Loader(ktx2Loader).setMeshoptDecoder(MeshoptDecoder);
      try {
        const gltf = await loadWith(gltfLoader, url, context);
        return validateListenerArtifactAsset(gltf);
      } finally {
        ktx2Loader.dispose();
      }
    },
    texture: (url, context) => loadWith(rgbeLoader, url, {
      ...context,
      transform(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        return texture;
      },
    }),
    async audio(url, { signal, onProgress }) {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
      const buffer = await response.arrayBuffer();
      onProgress(1);
      return buffer;
    },
  };
}

function selectQuality() {
  return selectInitialQuality({
    mobile: mobileQuery.matches || window.innerWidth < 760,
    deviceMemory: navigator.deviceMemory ?? Number.POSITIVE_INFINITY,
    hardwareConcurrency: navigator.hardwareConcurrency ?? Number.POSITIVE_INFINITY,
    saveData: Boolean(navigator.connection?.saveData),
  });
}

async function boot() {
  bootController?.abort();
  bootController = new AbortController();
  ui.dispatch({ type: "LOAD_START" });
  document.documentElement.dataset.listener = "loading";
  try {
    const quality = selectQuality();
    listenerScene = new ListenerScene({ canvas, quality, reducedMotion: reducedMotionQuery.matches });
    resize();
    listenerScene.render(0);
    const resolvedManifest = resolveListenerAssetManifest(assetManifest, quality);
    const result = await loadEchoAssets(resolvedManifest, {
      basePath: "./assets",
      adapters: createAssetAdapters(listenerScene.renderer),
      signal: bootController.signal,
      onProgress(progress) { ui.dispatch({ type: "LOAD_PROGRESS", progress }); },
    });
    listenerScene.mountListenerArtifact(result.assets["listener-artifact"]);
    const environment = result.assets["studio-small-09"] ?? null;
    listenerScene.setEnvironment(environment);
    const rawAudio = Object.fromEntries(
      resolvedManifest.filter(({ type }) => type === "audio").map(({ id }) => [id, result.assets[id]]),
    );
    audioAdapter = new WebAudioAdapter({ rawBuffers: rawAudio });
    audioDirector = new AudioDirector({ adapter: audioAdapter, buffers: rawAudio, muted: false });
    filmDirector = new FilmDirector({ duration: FILM_DURATION, chapters: CHAPTERS, onEvent: handleFilmEvent });
    if (window.__LISTENER_QA__) {
      window.__LISTENER_QA__.seek = (time) => {
        const state = filmDirector.seek(time);
        listenerScene.render(state.time);
        ui.dispatch({ type: "TIME", time: state.time, chapterId: state.chapterId });
        return state;
      };
      window.__LISTENER_QA__.state = () => filmDirector.state;
    }
    qualityPolicy = new QualityPolicy({ initialQuality: quality, onChange: ({ level }) => listenerScene.setQuality(level) });
    listenerScene.render(0);
    ui.dispatch({ type: "READY" });
    document.documentElement.dataset.listener = "ready";
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.error("THE LISTENER failed to start", error);
    ui.dispatch({
      type: "ERROR",
      kind: listenerScene ? "asset" : "webgl",
      message: listenerScene ? "影片素材未能完整载入。" : "当前浏览器无法创建实时三维画面。",
      retryable: Boolean(listenerScene),
    });
    document.documentElement.dataset.listener = "error";
  }
}

async function beginPlayback() {
  if (!filmDirector || filmDirector.state.playing) return;
  document.documentElement.requestFullscreen?.().catch(() => {});
  try {
    await audioDirector?.unlock(filmDirector.state.time);
    ui.dispatch({ type: "AUDIO_UNLOCKED" });
  } catch (error) {
    console.warn("Listener audio remains muted", error);
    audioDirector?.setMuted(true);
    ui.dispatch({ type: "MUTE", muted: true });
  }
  filmDirector.play();
  previousFrame = performance.now();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(animate);
}

function replay() {
  if (!filmDirector) return;
  filmDirector.replay();
  previousFrame = performance.now();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(animate);
}

function exitFilm() {
  filmDirector?.pause("exit");
  filmDirector?.seek(0);
  listenerScene?.render(0);
  ui.dispatch({ type: "READY" });
  document.exitFullscreen?.().catch(() => {});
}

async function toggleSound() {
  if (!audioDirector) return;
  if (!audioDirector.state.unlocked) {
    try {
      await audioDirector.unlock(filmDirector?.state.time ?? 0);
      ui.dispatch({ type: "AUDIO_UNLOCKED" });
    } catch {
      return;
    }
  }
  audioDirector.setMuted(!audioDirector.state.muted);
  ui.dispatch({ type: "MUTE", muted: audioDirector.state.muted });
}

function handleFilmEvent(event) {
  if (event.type === "play") {
    ui.dispatch({ type: "PLAY" });
    audioDirector?.start(event.time);
  }
  if (event.type === "pause") {
    ui.dispatch({ type: "PAUSE" });
    audioDirector?.pause(event.reason);
  }
  if (event.type === "seek") {
    listenerScene?.render(event.time);
    audioDirector?.seek(event.time);
  }
  if (event.type === "replay") {
    ui.dispatch({ type: "REPLAY" });
    audioDirector?.seek(0, "replay");
  }
  if (event.type === "finish") {
    ui.dispatch({ type: "FINISH" });
    audioDirector?.finish();
  }
}

function animate(now) {
  const delta = Math.min(0.05, Math.max(0, (now - previousFrame) / 1000));
  previousFrame = now;
  filmDirector.tick(delta * qaTimeScale);
  const state = filmDirector.state;
  listenerScene.render(state.time);
  audioDirector.update(state.time);
  ui.dispatch({ type: "TIME", time: state.time, chapterId: state.chapterId });
  qualityPolicy.recordFrame(delta * 1000, now);
  if (state.playing) frameId = requestAnimationFrame(animate);
}

function resize() {
  listenerScene?.resize(window.innerWidth, window.innerHeight);
  listenerScene?.render(filmDirector?.state.time ?? 0);
}

function dispose() {
  bootController?.abort();
  cancelAnimationFrame(frameId);
  audioDirector?.dispose();
  listenerScene?.dispose();
}

window.addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => {
  if (!filmDirector) return;
  if (document.hidden) {
    resumeAfterVisibility = filmDirector.state.playing;
    filmDirector.setVisibility(false);
    audioDirector?.setVisibility(false);
  } else {
    audioDirector?.setVisibility(true);
    if (resumeAfterVisibility) beginPlayback();
    resumeAfterVisibility = false;
    previousFrame = performance.now();
  }
});
reducedMotionQuery.addEventListener("change", ({ matches }) => listenerScene?.setReducedMotion(matches));
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  filmDirector?.pause("webgl-context-lost");
  ui.dispatch({ type: "ERROR", kind: "webgl", message: "实时三维画面已中断，请重新载入影片。", retryable: true });
});
window.addEventListener("beforeunload", dispose, { once: true });

boot();
