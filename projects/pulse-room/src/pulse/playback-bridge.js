function abortReason(signal) {
  return signal?.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function isAbort(error) {
  return error?.name === "AbortError";
}

function isLocalTrack(track) {
  return Boolean(
    track
    && (track.type === "local" || track.local === true || track.file || track.localUrl),
  );
}

function waitForMediaReady(audio, signal, timeoutMs) {
  if (signal.aborted) return Promise.reject(abortReason(signal));
  if (Number(audio.readyState) >= 2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer = 0;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
      signal.removeEventListener("abort", onAbort);
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const onReady = () => finish(resolve);
    const onError = () => {
      const detail = audio.error?.message || "media decode failed";
      finish(reject, new Error(`Audio decode failed: ${detail}`));
    };
    const onAbort = () => finish(reject, abortReason(signal));
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(() => {
      if (Number(audio.readyState) >= 2) finish(resolve);
      else finish(reject, new Error("Audio decode timed out"));
    }, timeoutMs);
  });
}

export function createPlaybackBridge({
  audio: initialAudio,
  media,
  localMedia,
  cache,
  decodeTimeoutMs = 15_000,
} = {}) {
  if (!initialAudio || typeof initialAudio.addEventListener !== "function") {
    throw new TypeError("A media element is required");
  }
  const mediaLoader = media ?? cache;
  if (!mediaLoader || typeof mediaLoader.acquire !== "function") {
    throw new TypeError("A static media loader is required");
  }

  let switchSerial = 0;
  let activeController = null;
  let activeLease = null;
  let disposed = false;
  let mediaElement = initialAudio;

  function releaseActive() {
    if (!activeLease) return;
    activeLease.release();
    activeLease = null;
  }

  async function load(track, {
    autoplay = false,
    serial,
    warmTrack = null,
    beforeCommit = null,
    lease: suppliedLease = null,
    deferPlay = false,
  } = {}) {
    if (disposed) throw new DOMException("Playback bridge is disposed", "AbortError");
    const requestSerial = ++switchSerial;
    const externalSerial = serial;
    const shouldResume = !deferPlay && Boolean(autoplay || (!mediaElement.paused && !mediaElement.ended));
    if (activeController) {
      activeController.abort(new DOMException("Superseded by a newer track", "AbortError"));
    }
    activeController = new AbortController();
    const { signal } = activeController;
    if (typeof mediaLoader.warm === "function") mediaLoader.warm(null);

    let candidate = null;
    try {
      if (!suppliedLease && isLocalTrack(track) && typeof localMedia?.acquire !== "function") {
        throw new TypeError("A local media adapter is required for local tracks");
      }
      candidate = suppliedLease ?? (isLocalTrack(track)
        ? await localMedia.acquire(track, { signal })
        : await mediaLoader.acquire(track, { signal }));
      if (!candidate || typeof candidate.url !== "string" || typeof candidate.release !== "function") {
        throw new TypeError("Media acquisition returned an invalid lease");
      }
      if (signal.aborted || requestSerial !== switchSerial) {
        candidate.release();
        return false;
      }

      if (typeof beforeCommit === "function") beforeCommit();
      if (signal.aborted || requestSerial !== switchSerial) {
        candidate.release();
        return false;
      }
      const requestMedia = mediaElement;
      requestMedia.pause();
      requestMedia.src = candidate.url;
      if ("preload" in requestMedia) requestMedia.preload = "auto";
      if (typeof requestMedia.load === "function") {
        const ready = waitForMediaReady(requestMedia, signal, decodeTimeoutMs);
        requestMedia.load();
        await ready;
      }
      if (signal.aborted || requestSerial !== switchSerial || requestMedia !== mediaElement) {
        candidate.release();
        return false;
      }

      const previousLease = activeLease;
      activeLease = candidate;
      candidate = null;
      previousLease?.release();
      requestMedia.__pulseTrackId = track?.id || "";
      requestMedia.__pulseSwitchSerial = externalSerial ?? requestSerial;
      if (shouldResume) {
        await requestMedia.play();
        if (signal.aborted || requestSerial !== switchSerial || requestMedia !== mediaElement) return false;
      }
      if (warmTrack && !isLocalTrack(warmTrack) && typeof mediaLoader.warm === "function") {
        void mediaLoader.warm(warmTrack);
      }
      return true;
    } catch (error) {
      candidate?.release();
      if (isAbort(error) || signal.aborted || requestSerial !== switchSerial) return false;
      throw error;
    }
  }

  return Object.freeze({
    load,
    adoptMedia(nextMedia) {
      if (disposed) return false;
      if (!nextMedia || typeof nextMedia.addEventListener !== "function") {
        throw new TypeError("A replacement media element is required");
      }
      if (nextMedia === mediaElement) return true;
      const previousMedia = mediaElement;
      switchSerial += 1;
      activeController?.abort(new DOMException("Playback media element replaced", "AbortError"));
      activeController = null;
      nextMedia.volume = previousMedia.volume;
      nextMedia.loop = previousMedia.loop;
      nextMedia.muted = previousMedia.muted;
      nextMedia.playbackRate = previousMedia.playbackRate;
      if ("preload" in nextMedia) nextMedia.preload = previousMedia.preload || "auto";
      nextMedia.__pulseTrackId = previousMedia.__pulseTrackId || "";
      nextMedia.__pulseSwitchSerial = previousMedia.__pulseSwitchSerial;
      mediaElement = nextMedia;
      return true;
    },
    play() {
      if (disposed) return Promise.reject(new DOMException("Playback bridge is disposed", "AbortError"));
      return mediaElement.play();
    },
    pause() {
      mediaElement.pause();
    },
    setVolume(value) {
      const number = Number(value);
      mediaElement.volume = Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
      return mediaElement.volume;
    },
    setLoop(value) {
      mediaElement.loop = Boolean(value);
      return mediaElement.loop;
    },
    currentLease() {
      return activeLease;
    },
    warm(track) {
      if (disposed || typeof mediaLoader.warm !== "function") return Promise.resolve(false);
      if (isLocalTrack(track)) return Promise.resolve(false);
      return mediaLoader.warm(track);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      switchSerial += 1;
      activeController?.abort(new DOMException("Playback bridge disposed", "AbortError"));
      activeController = null;
      mediaElement.pause();
      releaseActive();
      if (typeof mediaElement.removeAttribute === "function") mediaElement.removeAttribute("src");
      else mediaElement.src = "";
    },
  });
}
