/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/05-playback/13-playback-start-audio.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function pulsePlaybackRuntime() {
  return window.PulseRuntime && window.PulseRuntime.playback
    ? window.PulseRuntime.playback
    : null;
}

function isPulseLocalSong(song) {
  return !!(song && (song.type === 'local' || song.local === true || song.localUrl || song.file));
}

var pulseMediaAcquireController = null;

function pulseMediaOwner(song) {
  if (!window.PulseRuntime) return null;
  return isPulseLocalSong(song) ? PulseRuntime.localMedia : PulseRuntime.media;
}

function clearAlbumGaplessPreload(reason) {
  albumGaplessState.serial += 1;
  albumGaplessState.preload = null;
  albumGaplessState.handoff = false;
  var playback = pulsePlaybackRuntime();
  if (playback) playback.warm(null);
}

function setAlbumGaplessPlaybackContext(enabled, context) {
  albumGaplessState.enabled = !!enabled;
  albumGaplessState.context = context || null;
  if (!enabled) clearAlbumGaplessPreload('context-disabled');
  return albumGaplessState.enabled;
}

async function resolveAlbumGaplessPlaybackData(song) {
  if (!song || isPulseLocalSong(song) || !song.url) return null;
  return { url: song.url, local: true, trial: false };
}

function scheduleAlbumGaplessPreloadForCurrent(token) {
  if (token !== trackSwitchToken || !playQueue.length || currentIdx < 0) return false;
  var nextIndex = (currentIdx + 1) % playQueue.length;
  if (nextIndex === currentIdx) return false;
  var nextSong = playQueue[nextIndex];
  if (!nextSong || isPulseLocalSong(nextSong)) return false;
  albumGaplessState.preload = {
    index: nextIndex,
    key: queueItemKey(nextSong),
    token: token,
    mixPending: false,
    mixStarted: false
  };
  var playback = pulsePlaybackRuntime();
  if (playback) playback.warm(nextSong);
  return true;
}

function pulseFormatTime(seconds) {
  seconds = Math.max(0, Number(seconds) || 0);
  var minutes = Math.floor(seconds / 60);
  var remainder = Math.floor(seconds % 60);
  return minutes + ':' + String(remainder).padStart(2, '0');
}

function renderPulseProgress() {
  if (!audio) return;
  var durationSeconds = Number(audio.duration);
  var currentSeconds = Number(audio.currentTime);
  if (!isFinite(durationSeconds) || durationSeconds < 0) durationSeconds = 0;
  if (!isFinite(currentSeconds) || currentSeconds < 0) currentSeconds = 0;
  var progress = document.getElementById('progress-bar');
  var fill = document.getElementById('progress-fill');
  var thumb = document.getElementById('progress-thumb');
  var currentNode = document.getElementById('current-time');
  var durationNode = document.getElementById('duration');
  var timeNode = document.getElementById('time-display');
  var ratio = durationSeconds > 0 ? Math.max(0, Math.min(1, currentSeconds / durationSeconds)) : 0;
  if (progress) {
    progress.setAttribute('aria-valuenow', String(Math.round(ratio * 1000)));
    progress.setAttribute('aria-valuetext', pulseFormatTime(currentSeconds) + ' / ' + pulseFormatTime(durationSeconds));
  }
  if (fill) fill.style.width = (ratio * 100) + '%';
  if (thumb) thumb.style.left = (ratio * 100) + '%';
  if (currentNode) currentNode.textContent = pulseFormatTime(currentSeconds);
  if (durationNode) durationNode.textContent = pulseFormatTime(durationSeconds);
  if (timeNode) timeNode.textContent = pulseFormatTime(currentSeconds) + ' / ' + pulseFormatTime(durationSeconds);
}

function bindPulsePlaybackEvents(media) {
  if (!media || media.__pulsePlaybackEventsBound) return;
  media.__pulsePlaybackEventsBound = true;
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(function (name) {
    media.addEventListener(name, renderPulseProgress);
  });
  media.addEventListener('play', function () {
    if (media !== audio) return;
    syncPlaybackStateFromAudioEvent('play');
  });
  media.addEventListener('pause', function () {
    if (media !== audio) return;
    syncPlaybackStateFromAudioEvent('pause');
  });
}

function updatePulseTrackUi(song) {
  var title = song.title || song.name || '未命名曲目';
  var artist = song.artist || song.composer || 'PULSE ROOM';
  song.name = title;
  var titleNode = document.getElementById('track-title');
  var artistNode = document.getElementById('track-artist');
  if (titleNode) titleNode.textContent = title;
  if (artistNode) artistNode.textContent = artist;
  if (typeof syncPulseTrackSelection === 'function') {
    syncPulseTrackSelection(song, { origin: 'playback' });
  }
  safePlaybackStep('legacy-track-info', function () {
    if (typeof updateControlTrackInfo === 'function') updateControlTrackInfo(song);
  });
}

function commitPulseTrackCover(song, token, extraOptions) {
  var custom = typeof getCustomCoverForSong === 'function' ? getCustomCoverForSong(song) : '';
  var cover = custom || song.customCover || song.cover || '';
  if (cover && !/^(data:image\/|blob:|https?:\/\/)/i.test(cover)) {
    try { cover = new URL(cover, window.location.href).href; } catch (e) { }
  }
  var options = Object.assign({
    trackToken: token,
    coverKey: 'cover:' + String(song.id || queueItemKey(song)),
    trackSwitch: true,
    seamlessCover: true
  }, extraOptions || {});
  if (cover && /^data:image\//i.test(cover) && typeof applyCoverDataUrl === 'function') {
    applyCoverDataUrl(cover, options);
    return true;
  }
  if (cover && typeof loadCoverFromUrl === 'function') {
    loadCoverFromUrl(cover, options);
    return true;
  }
  if (song.file && typeof loadCoverFromFile === 'function') {
    loadCoverFromFile(song.file, options);
    return true;
  }
  return true;
}

function pulseNextWarmTrack(index) {
  if (!Array.isArray(playQueue) || playQueue.length < 2) return null;
  var next = playQueue[(index + 1) % playQueue.length];
  return isPulseLocalSong(next) ? null : next;
}

async function playQueueAt(idx, opts) {
  opts = opts || {};
  idx = Math.round(Number(idx));
  if (!Array.isArray(playQueue) || !playQueue.length || !isFinite(idx) || idx < 0 || idx >= playQueue.length) {
    return false;
  }
  var playback = pulsePlaybackRuntime();
  if (!playback) throw new Error('PULSE playback bridge is unavailable');

  var token = ++trackSwitchToken;
  var song = cloneSong(playQueue[idx]);
  if (!song) return false;
  song.name = song.name || song.title || '未命名曲目';
  song.title = song.title || song.name;
  playQueue[idx] = song;
  currentIdx = idx;
  currentTrack = song;
  currentLocalSong = isPulseLocalSong(song) ? song : null;
  activeRadioContext = null;
  if (window.PulseRuntime && PulseRuntime.analysis) {
    Promise.resolve(PulseRuntime.analysis.select(Object.assign({}, song, {
      local: isPulseLocalSong(song)
    }))).then(function (analysisState) {
      if (analysisState && analysisState.status === 'fallback' && PulseRuntime.status) {
        PulseRuntime.status.report('analysis', { trackId: song.id, error: analysisState.error });
      }
    }).catch(function (error) {
      console.warn('[PULSE Analysis] selection failed', error);
      if (PulseRuntime.status) PulseRuntime.status.report('analysis', { trackId: song.id, error: error });
    });
  }

  if (typeof suppressShelfPreviewForPlaybackSwitch === 'function') suppressShelfPreviewForPlaybackSwitch();
  updatePulseTrackUi(song);
  if (typeof showLoading === 'function') showLoading({ trackSwitch: true, seamlessCover: true });
  if (typeof resetAudioVisualState === 'function') resetAudioVisualState();
  if (typeof resetBeatCameraSync === 'function') resetBeatCameraSync(0);
  currentBeatMap = null;
  beatMapNextIdx = 0;
  cancelBeatAnalysisTimer();
  beatMapToken += 1;

  if (!audio) audio = document.getElementById('audio');
  if (!audio) throw new Error('PULSE audio element is unavailable');
  bindPulsePlaybackEvents(audio);
  audio.__mineradioQueueItemKey = queueItemKey(song);
  audio.__mineradioTrackSwitchToken = token;
  audio.onended = function () {
    if (token !== trackSwitchToken) return;
    if (playMode === 'single') playQueueAt(currentIdx, { autoRepeat: true });
    else nextTrack(false);
  };

  try {
    if (pulseMediaAcquireController) {
      pulseMediaAcquireController.abort(new DOMException('Superseded by a newer track', 'AbortError'));
    }
    pulseMediaAcquireController = new AbortController();
    var mediaOwner = pulseMediaOwner(song);
    if (!mediaOwner || typeof mediaOwner.acquire !== 'function') {
      throw new Error('PULSE media adapter is unavailable');
    }
    var mediaLease = await mediaOwner.acquire(song, { signal: pulseMediaAcquireController.signal });
    if (token !== trackSwitchToken) {
      mediaOwner.release(mediaLease);
      return false;
    }
    commitPulseTrackCover(song, token);
    var started = await playback.load(song, {
      autoplay: false,
      deferPlay: true,
      lease: mediaLease,
      serial: token,
      warmTrack: pulseNextWarmTrack(idx),
      beforeCommit: function () {
        if (token === trackSwitchToken && typeof preparePlaybackFadeIn === 'function') preparePlaybackFadeIn();
      }
    });
    if (!started || token !== trackSwitchToken) return false;

    scheduleAudioResumePosition(audio, opts.resumeAt != null ? opts.resumeAt : pendingPlaybackResumeAt, token);
    pendingPlaybackResumeAt = 0;
    await ensurePlaybackAudioGraph('pulse-track-switch');
    if (token !== trackSwitchToken) return false;
    if (opts.fade === false) restorePlaybackGain();
    else startPlaybackFadeIn();
    await playback.play();
    if (token !== trackSwitchToken) return false;
    playing = true;
    if (uniforms && uniforms.uAlpha && typeof tweenParticleAlpha === 'function') {
      tweenParticleAlpha(uniforms.uAlpha.value || 0, 1.0, 220);
    }
    renderPulseProgress();
    syncPlaybackStateFromAudioEvent('playing');
    if (typeof hideLoading === 'function') hideLoading();
    if (typeof schedulePlaybackAnalyserRecovery === 'function') schedulePlaybackAnalyserRecovery('pulse-track-switch');
    if (typeof saveLastPlaybackSnapshot === 'function') saveLastPlaybackSnapshot(true, 'track-switch');
    safeRenderQueuePanel('play-queue-at');
    safeShelfRebuild('play-queue-at', true);
    scheduleAlbumGaplessPreloadForCurrent(token);
    if (
      PulseRuntime.status
      && (PulseRuntime.status.current.kind === 'audio'
        || PulseRuntime.status.current.kind === 'import-invalid')
    ) PulseRuntime.status.clear();
    return true;
  } catch (err) {
    if (token !== trackSwitchToken || (err && err.name === 'AbortError')) return false;
    restorePlaybackGain();
    playing = false;
    if (typeof hideLoading === 'function') hideLoading();
    if (!opts.suppressPlayFailureNotice) showToast(playbackFailureToastText(err));
    if (PulseRuntime.status) {
      PulseRuntime.status.report('audio', { trackId: song.id, error: err });
    }
    console.error('[PULSE Playback] failed to load track', song.id || song.name, err);
    return false;
  }
}
