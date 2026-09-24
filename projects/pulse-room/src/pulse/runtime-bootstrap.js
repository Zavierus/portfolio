import * as THREE from "three";
import threePackage from "three/package.json" with { type: "json" };
import {
  detectPerformanceEnvironment,
  resolvePerformanceQuality,
} from "../performance/quality-policy.js";
import { getBuiltInTracks } from "../track-library.js";
import { createAnalysisBridge } from "./analysis-bridge.js";
import { createCatalogAdapter } from "./catalog-adapter.js";
import { createCatalogSelectionController } from "./catalog-selector.js";
import { createCoverFallback } from "./cover-fallback.js";
import { createLocalMediaAdapter } from "./local-media-adapter.js";
import { createPlaybackBridge } from "./playback-bridge.js";
import { createPortfolioAdapter } from "./portfolio-adapter.js";
import { createRuntimeStatus } from "./runtime-status.js";
import { createSeekController } from "./seek-controller.js";
import { createStaticMediaLoader } from "./static-media-loader.js";
import { BUILT_IN_ANALYSIS } from "./built-in-analysis.js";

const audioElement = globalThis.document?.getElementById("audio");
if (!audioElement) throw new Error("PULSE ROOM requires #audio before runtime bootstrap");

const catalog = createCatalogAdapter({ tracks: getBuiltInTracks() });
const localMedia = createLocalMediaAdapter();
const media = createStaticMediaLoader({
  maxBytes: 96 * 1024 * 1024,
});
const playback = createPlaybackBridge({
  audio: audioElement,
  media,
  localMedia,
});
const quality = resolvePerformanceQuality(detectPerformanceEnvironment());
const analysis = createAnalysisBridge({
  analysisByTrack: globalThis.location?.protocol === "file:" ? BUILT_IN_ANALYSIS : null,
});
const selection = createCatalogSelectionController({ catalog: catalog.all });
const status = createRuntimeStatus();
const portfolio = createPortfolioAdapter();

const runtime = {
  THREE,
  threeVersion: threePackage.version,
  catalog,
  localMedia,
  media,
  playback,
  quality,
  analysis,
  selection,
  status,
  portfolio,
  createCoverFallback,
  createSeekController,
};

globalThis.THREE = THREE;
globalThis.PulseRuntime = runtime;
globalThis.dispatchEvent(new CustomEvent("pulse-runtime-ready"));

globalThis.addEventListener("beforeunload", () => {
  analysis.dispose();
  selection.dispose();
  status.dispose();
  portfolio.dispose();
  playback.dispose();
  localMedia.dispose();
  media.dispose();
}, { once: true });
