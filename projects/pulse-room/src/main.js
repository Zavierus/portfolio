import { createFrequencyBands, formatTime, summarizeBands, waveformLevel } from "./audio-analysis.js";
import { AnalysisClient } from "./analysis/analysis-client.js";
import { createAudioPlayer } from "./audio-player.js";
import { performanceDescriptorForTrack } from "./performance/performance-registry.js";
import { getBuiltInTracks } from "./track-library.js";
import { createVisualizer } from "./visualizer.js";

const $ = (id) => document.getElementById(id);
const audio = $("audio");
const visualizer = createVisualizer($("visualizer"), {
  onError: (error) => showToast(
    error?.code === "WEBGL_CONTEXT_LOST"
      ? "VISUAL CONTEXT LOST / AUDIO CONTINUES"
      : "VISUAL WORLD COULD NOT BE LOADED",
  ),
});
const meterIds = ["low", "mid", "high", "peak"];
let latestState = null;
let queueSignature = "";
let draggingProgress = false;
let lastMeterUpdate = 0;
let previousPeak = 0;
let lastAnalysisError = null;
let selectedVisualTrackId = null;
let displayedSection = "";
const analysisStates = new Map();
const requestedTrackAnalysis = new Set();

const analysisClient = new AnalysisClient({
  onProgress({ trackId, progress }) {
    analysisStates.set(trackId, { status: "analyzing", progress });
    if (latestState?.current?.id === trackId) renderPlayerStatus(latestState);
  },
});

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.remove("show");
  void $("toast").offsetWidth;
  $("toast").classList.add("show");
}

function renderQueue(state) {
  const signature = `${state.index}:${state.items.map((item) => item.id).join("|")}`;
  if (signature === queueSignature) return;
  queueSignature = signature;
  $("queueList").innerHTML = "";
  state.items.forEach((track, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.classList.toggle("active", index === state.index);
    button.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><span></span>`;
    button.querySelector("span").textContent = track.title;
    button.addEventListener("click", () => {
      player.select(index);
      $("analysisRail").classList.remove("open");
    });
    item.append(button);
    $("queueList").append(item);
  });
  $("queueCount").textContent = `${String(state.items.length).padStart(2, "0")} TRACK${state.items.length === 1 ? "" : "S"}`;
}

function renderPlayerStatus(state) {
  const track = state.current;
  const analysis = track ? analysisStates.get(track.id) : null;
  if (analysis?.status === "analyzing") {
    $("statusText").textContent = `ANALYSIS / ${Math.round(analysis.progress * 100)}%`;
  } else if (analysis?.status === "loading") {
    $("statusText").textContent = "LOADING CUE DATA";
  } else if (analysis?.status === "fallback") {
    $("statusText").textContent = "REALTIME ANALYSIS";
  } else {
    $("statusText").textContent = state.playing ? "ANALYSER ACTIVE" : track ? "READY / SPACE TO PLAY" : "IMPORT AUDIO";
  }
}

function requestTrackAnalysis(track) {
  if (!track?.analysisUrl || requestedTrackAnalysis.has(track.id)) return;
  requestedTrackAnalysis.add(track.id);
  analysisStates.set(track.id, { status: "loading", progress: 0 });
  analysisClient.loadTrack(track).then((result) => {
    analysisStates.set(track.id, { status: result.status, progress: result.status === "ready" ? 1 : 0 });
    if (latestState?.current?.id === track.id) renderPlayerStatus(latestState);
  });
}

function renderPlayer(state) {
  latestState = state;
  const track = state.current;
  const performance = performanceDescriptorForTrack(track);
  document.body.dataset.playing = String(state.playing);
  document.body.dataset.performance = performance.id;
  if (track?.id !== selectedVisualTrackId) {
    selectedVisualTrackId = track?.id ?? null;
    displayedSection = "";
    $("sectionLabel").textContent = "STANDBY";
    visualizer.selectTrack(track, { time: state.currentTime });
  }
  $("worldLabel").textContent = performance.label;
  $("playButton").setAttribute("aria-label", state.playing ? "暂停" : "播放");
  $("trackTitle").textContent = track?.title || "No Audio Loaded";
  $("trackArtist").textContent = track?.artist || "PULSE ROOM / LOCAL SESSION";
  $("trackIndex").textContent = String(Math.max(1, state.index + 1)).padStart(2, "0");
  $("currentTime").textContent = formatTime(state.currentTime);
  $("duration").textContent = formatTime(state.duration);
  if (!draggingProgress) $("progress").value = state.duration ? Math.round(state.currentTime / state.duration * 1000) : 0;
  $("volume").value = state.volume;
  $("loopButton").setAttribute("aria-pressed", String(state.loop));
  renderPlayerStatus(state);
  renderQueue(state);
  requestTrackAnalysis(track);
}

const player = createAudioPlayer({ audioElement: audio, onChange: renderPlayer });
player.setVolume(0.82);
player.addTracks(getBuiltInTracks(), { replace: true });

function tracksFromFiles(files) {
  const supported = [];
  const rejected = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "audio";
    if (!file.type.startsWith("audio/") && !["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(extension)) {
      rejected.push(file.name);
      continue;
    }
    supported.push({
      file,
      track: {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        title: file.name.replace(/\.[^.]+$/, ""),
        artist: `LOCAL FILE / ${extension.toUpperCase()}`,
        url: URL.createObjectURL(file),
        revoke: true,
      },
    });
  }
  return { supported, rejected };
}

function importFiles(fileList) {
  const { supported, rejected } = tracksFromFiles([...fileList]);
  if (supported.length) {
    const firstNewIndex = player.state().items.length;
    player.addTracks(supported.map(({ track }) => track));
    player.select(firstNewIndex, { autoplay: false });
    for (const entry of supported) analyzeImportedFile(entry).catch(() => {});
    showToast(`${supported.length} TRACK${supported.length === 1 ? "" : "S"} ADDED`);
  }
  if (rejected.length) showToast(`UNSUPPORTED: ${rejected.join(", ")}`);
}

async function analyzeImportedFile({ file, track }) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    analysisStates.set(track.id, { status: "fallback", progress: 0 });
    return;
  }
  analysisStates.set(track.id, { status: "analyzing", progress: 0 });
  renderPlayerStatus(player.state());
  const context = new AudioContextClass();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const pcm = new Float32Array(buffer.length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < pcm.length; index += 1) pcm[index] += data[index] / buffer.numberOfChannels;
    }
    const result = await analysisClient.analyzePcm({
      trackId: track.id,
      pcm,
      sampleRate: buffer.sampleRate,
    });
    lastAnalysisError = result.error ?? null;
    analysisStates.set(track.id, { status: result.status, progress: result.status === "ready" ? 1 : 0 });
  } catch (error) {
    lastAnalysisError = error;
    analysisStates.set(track.id, { status: "fallback", progress: 0 });
  } finally {
    await context.close();
    if (latestState?.current?.id === track.id) renderPlayerStatus(player.state());
  }
}

$("fileInput").addEventListener("change", (event) => {
  importFiles(event.target.files);
  event.target.value = "";
});
$("playButton").addEventListener("click", () => player.toggle().catch(() => showToast("CLICK PLAY TO ENABLE AUDIO")));
$("previousButton").addEventListener("click", () => player.previous());
$("nextButton").addEventListener("click", () => player.next());
$("loopButton").addEventListener("click", () => player.setLoop(!player.state().loop));
$("volume").addEventListener("input", (event) => player.setVolume(event.target.value));
$("progress").addEventListener("pointerdown", () => { draggingProgress = true; });
$("progress").addEventListener("input", (event) => {
  if (!latestState?.duration) return;
  $("currentTime").textContent = formatTime(event.target.value / 1000 * latestState.duration);
});
$("progress").addEventListener("change", (event) => {
  draggingProgress = false;
  if (latestState?.duration) player.seek(event.target.value / 1000 * latestState.duration);
});
$("queueButton").addEventListener("click", () => $("analysisRail").classList.toggle("open"));

let dragDepth = 0;
window.addEventListener("dragenter", (event) => {
  event.preventDefault();
  dragDepth += 1;
  $("dropZone").classList.add("show");
});
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("dragleave", (event) => {
  event.preventDefault();
  dragDepth -= 1;
  if (dragDepth <= 0) {
    dragDepth = 0;
    $("dropZone").classList.remove("show");
  }
});
window.addEventListener("drop", (event) => {
  event.preventDefault();
  dragDepth = 0;
  $("dropZone").classList.remove("show");
  importFiles(event.dataTransfer.files);
});

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || ["INPUT", "BUTTON"].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  player.toggle().catch(() => showToast("CLICK PLAY TO ENABLE AUDIO"));
});
window.addEventListener("resize", visualizer.resize);
audio.addEventListener("error", () => showToast("AUDIO FILE COULD NOT BE DECODED"));

let previousTime = performance.now();
function animate(now) {
  const delta = Math.min(0.05, (now - previousTime) / 1000);
  previousTime = now;
  const { frequencyData, timeData } = player.analysis();
  const realBands = createFrequencyBands(frequencyData, 64);
  const summary = summarizeBands(realBands);
  const level = waveformLevel(timeData);
  const onset = Math.max(0, summary.peak - previousPeak);
  previousPeak = previousPeak * 0.58 + summary.peak * 0.42;
  const vjSignal = analysisClient.sample({
    trackId: latestState?.current?.id,
    time: latestState?.currentTime,
    realtime: {
      ...summary,
      onset,
      spectralCentroid: Math.min(1, summary.mid * 0.34 + summary.high * 0.82),
    },
  });
  visualizer.update({
    bands: latestState?.playing ? realBands : [],
    summary,
    level,
    vjSignal,
    playing: latestState?.playing,
    currentTime: latestState?.currentTime,
  }, delta);

  if (now - lastMeterUpdate > 80) {
    const section = vjSignal.section === "realtime"
      ? "UNSCRIPTED"
      : String(vjSignal.section).replaceAll("-", " / ").toUpperCase();
    if (section !== displayedSection) {
      displayedSection = section;
      $("sectionLabel").textContent = section;
      document.body.dataset.section = vjSignal.section;
    }
    meterIds.forEach((id) => {
      const value = Math.round((summary[id] || 0) * 100);
      $(`${id}Meter`).style.width = `${value}%`;
      $(`${id}Value`).textContent = String(value).padStart(2, "0");
    });
    lastMeterUpdate = now;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
window.addEventListener("beforeunload", () => {
  analysisClient.dispose();
  visualizer.dispose();
  player.destroy();
}, { once: true });

window.__PULSE_ROOM_QA__ = Object.freeze({
  analysis: () => ({
    client: analysisClient.state,
    active: latestState?.current ? analysisStates.get(latestState.current.id) ?? null : null,
    lastError: lastAnalysisError ? {
      name: lastAnalysisError.name,
      code: lastAnalysisError.code ?? null,
      message: lastAnalysisError.message,
    } : null,
  }),
});
