import { createQueueState } from "./queue-state.js";

export function createAudioPlayer({ audioElement, onChange = () => {} }) {
  if (!audioElement) throw new Error("audioElement is required");
  const queue = createQueueState();
  let context = null;
  let source = null;
  let analyser = null;
  let gain = null;
  let frequencyData = new Uint8Array(0);
  let timeData = new Uint8Array(0);

  const state = () => ({
    ...queue.snapshot(),
    playing: !audioElement.paused,
    currentTime: audioElement.currentTime || 0,
    duration: Number.isFinite(audioElement.duration) ? audioElement.duration : 0,
    volume: Number(audioElement.volume),
    loop: audioElement.loop,
  });

  const emit = () => onChange(state());

  async function ensureGraph() {
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      source = context.createMediaElementSource(audioElement);
      analyser = context.createAnalyser();
      gain = context.createGain();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser).connect(gain).connect(context.destination);
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);
    }
    if (context.state === "suspended") await context.resume();
  }

  function loadCurrent({ autoplay = false } = {}) {
    const track = queue.current();
    if (!track) {
      audioElement.removeAttribute("src");
      audioElement.load();
      emit();
      return null;
    }
    audioElement.src = track.url;
    audioElement.load();
    emit();
    if (autoplay) play();
    return track;
  }

  async function play() {
    if (!queue.current()) return false;
    await ensureGraph();
    try {
      await audioElement.play();
      emit();
      return true;
    } catch (error) {
      emit();
      throw error;
    }
  }

  function pause() {
    audioElement.pause();
    emit();
  }

  function toggle() {
    return audioElement.paused ? play() : (pause(), Promise.resolve(true));
  }

  function addTracks(tracks, { replace = false, autoplay = false } = {}) {
    if (replace) queue.replace(tracks);
    else queue.add(tracks);
    if (replace || !audioElement.src) loadCurrent({ autoplay });
    else emit();
    return queue.snapshot();
  }

  function select(index, { autoplay = !audioElement.paused } = {}) {
    if (!queue.select(index)) return null;
    return loadCurrent({ autoplay });
  }

  function next({ autoplay = !audioElement.paused } = {}) {
    if (!queue.next()) return null;
    return loadCurrent({ autoplay });
  }

  function previous({ autoplay = !audioElement.paused } = {}) {
    if (!queue.previous()) return null;
    return loadCurrent({ autoplay });
  }

  function seek(seconds) {
    const duration = Number.isFinite(audioElement.duration) ? audioElement.duration : 0;
    audioElement.currentTime = Math.min(duration, Math.max(0, Number(seconds) || 0));
    emit();
  }

  function setVolume(value) {
    audioElement.volume = Math.min(1, Math.max(0, Number(value) || 0));
    emit();
  }

  function setLoop(value) {
    audioElement.loop = Boolean(value);
    emit();
  }

  function analysis() {
    if (!analyser) return { frequencyData, timeData };
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);
    return { frequencyData, timeData };
  }

  audioElement.addEventListener("timeupdate", emit);
  audioElement.addEventListener("durationchange", emit);
  audioElement.addEventListener("play", emit);
  audioElement.addEventListener("pause", emit);
  audioElement.addEventListener("ended", () => {
    if (!audioElement.loop) next({ autoplay: true });
  });

  return {
    addTracks,
    analysis,
    destroy() {
      pause();
      for (const track of queue.snapshot().items) if (track.revoke) URL.revokeObjectURL(track.url);
      context?.close();
    },
    next,
    pause,
    play,
    previous,
    seek,
    select,
    setLoop,
    setVolume,
    state,
    toggle,
  };
}
