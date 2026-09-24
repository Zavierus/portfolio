/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/06-lyrics/04-progress-seek.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var progressDragState = {
  active: false,
  previewTime: 0,
  previewDuration: 0,
  previewHoldUntil: 0,
  sourceSerial: 0
};
var progressSeekController = null;
var progressPointerId = null;
var progressActiveSurface = null;
var PULSE_KEYBOARD_SEEK_SECONDS = 5;
var pulseProgressSurfaceIds = ['progress-bar', 'classic-progress-bar'];

function normalizePlaybackDurationSeconds(value) {
  var raw = Number(value);
  if (!isFinite(raw) || raw <= 0) return 0;
  return raw > 1000 ? raw / 1000 : raw;
}

function playbackDurationFromSong(song) {
  if (!song) return 0;
  return normalizePlaybackDurationSeconds(song.duration || song.durationMs || song.dt || 0);
}

function getPlaybackDurationSeconds() {
  if (audio && isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return playbackDurationFromSong(currentCoverSong());
}

function getPlaybackCurrentSeconds() {
  return audio && isFinite(audio.currentTime) && audio.currentTime > 0 ? audio.currentTime : 0;
}

function pulseSeekFormatTime(seconds) {
  if (typeof pulseFormatTime === 'function') return pulseFormatTime(seconds);
  seconds = Math.max(0, Number(seconds) || 0);
  var minutes = Math.floor(seconds / 60);
  return minutes + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

function renderPulseSeekPosition(currentSec, durationSec) {
  currentSec = Math.max(0, Number(currentSec) || 0);
  durationSec = Math.max(0, Number(durationSec) || 0);
  if (durationSec > 0) currentSec = Math.min(currentSec, durationSec);
  var currentNode = document.getElementById('current-time');
  var durationNode = document.getElementById('duration');
  var timeNode = document.getElementById('time-display');
  var classicCurrentNode = document.getElementById('classic-progress-current');
  var classicDurationNode = document.getElementById('classic-progress-duration');
  var ratio = durationSec > 0 ? currentSec / durationSec : 0;
  pulseProgressSurfaceIds.forEach(function (barId) {
    var isClassic = barId === 'classic-progress-bar';
    var progress = document.getElementById(barId);
    var fill = document.getElementById(isClassic ? 'classic-progress-fill' : 'progress-fill');
    var thumb = document.getElementById(isClassic ? 'classic-progress-thumb' : 'progress-thumb');
    if (progress) {
      progress.setAttribute('aria-valuenow', String(Math.round(ratio * 1000)));
      progress.setAttribute('aria-valuetext', pulseSeekFormatTime(currentSec) + ' / ' + pulseSeekFormatTime(durationSec));
      progress.setAttribute('aria-disabled', durationSec > 0 ? 'false' : 'true');
    }
    if (fill) fill.style.width = (ratio * 100) + '%';
    if (thumb) thumb.style.left = (ratio * 100) + '%';
  });
  if (currentNode) currentNode.textContent = pulseSeekFormatTime(currentSec);
  if (durationNode) durationNode.textContent = pulseSeekFormatTime(durationSec);
  if (timeNode) timeNode.textContent = pulseSeekFormatTime(currentSec) + ' / ' + pulseSeekFormatTime(durationSec);
  if (classicCurrentNode) classicCurrentNode.textContent = pulseSeekFormatTime(currentSec);
  if (classicDurationNode) classicDurationNode.textContent = pulseSeekFormatTime(durationSec);
  if (typeof syncPulseClassicPlaybackUi === 'function') syncPulseClassicPlaybackUi(currentSec, durationSec);
}

function renderProgressPreview(currentSec, durationSec) {
  progressDragState.previewTime = Math.max(0, Number(currentSec) || 0);
  progressDragState.previewDuration = Math.max(0, Number(durationSec) || 0);
  progressDragState.previewHoldUntil = performance.now() + 5200;
  renderPulseSeekPosition(progressDragState.previewTime, progressDragState.previewDuration);
}

function renderProgressLive(currentSec, durationSec) {
  progressDragState.previewHoldUntil = 0;
  progressDragState.previewTime = 0;
  progressDragState.previewDuration = 0;
  renderPulseSeekPosition(currentSec, durationSec);
}

function isProgressDragPreviewActive() {
  if (
    progressDragState.previewHoldUntil
    && Number(progressDragState.sourceSerial) !== Number(trackSwitchToken)
  ) {
    progressDragState.previewHoldUntil = 0;
  }
  return !!(
    progressDragState.active
    || progressDragState.previewHoldUntil > performance.now()
  );
}

function getProgressDragPreviewSeconds() {
  return isProgressDragPreviewActive() ? progressDragState.previewTime : null;
}

function updatePlaybackProgressUi() {
  if (isProgressDragPreviewActive()) return;
  renderPulseSeekPosition(getPlaybackCurrentSeconds(), getPlaybackDurationSeconds());
}

if (typeof renderPulseProgress === 'function') {
  var renderPulseProgressWithoutSeekHold = renderPulseProgress;
  renderPulseProgress = function () {
    if (isProgressDragPreviewActive()) return;
    renderPulseProgressWithoutSeekHold();
  };
}

function playbackTransitionHasAudibleNextDeck() {
  var preload = typeof albumGaplessState !== 'undefined' && albumGaplessState ? albumGaplessState.preload : null;
  return !!(
    preload
    && preload.mixStarted
    && preload.media
    && preload.media !== audio
    && !preload.media.paused
    && !preload.media.ended
    && Number(preload.media.volume) > 0.001
  );
}

function bindPlaybackProgressEvents(audioEl) {
  if (!audioEl || audioEl._mineradioProgressBound) return;
  if (progressSeekController && audio && audioEl === audio) progressSeekController.cancel();
  audioEl._mineradioProgressBound = true;
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked', 'play', 'pause', 'emptied'].forEach(function (name) {
    audioEl.addEventListener(name, updatePlaybackProgressUi);
  });
  ['play', 'playing', 'pause', 'ended', 'emptied', 'abort', 'error'].forEach(function (name) {
    audioEl.addEventListener(name, function () {
      if (audioEl !== audio) return;
      if (Number(audioEl.__mineradioTrackSwitchToken) !== Number(trackSwitchToken)) return;
      if (
        name !== 'emptied'
        && typeof playbackMediaMatchesCurrentQueueItem === 'function'
        && !playbackMediaMatchesCurrentQueueItem(audioEl)
      ) return;
      if (name === 'ended' && playbackTransitionHasAudibleNextDeck()) return;
      syncPlaybackStateFromAudioEvent(name);
      saveLastPlaybackSnapshot(name === 'pause' || name === 'ended', name);
    });
  });
  ['error', 'stalled'].forEach(function (name) {
    audioEl.addEventListener(name, function () {
      if (audioEl !== audio) return;
      if (Number(audioEl.__mineradioTrackSwitchToken) !== Number(trackSwitchToken)) return;
      if (typeof playbackMediaMatchesCurrentQueueItem === 'function' && !playbackMediaMatchesCurrentQueueItem(audioEl)) return;
      if (typeof schedulePlaybackStallRecovery === 'function') {
        schedulePlaybackStallRecovery(name, {
          silent: name !== 'error',
          ownerMedia: audioEl,
          ownerToken: trackSwitchToken,
          ownerQueueItemKey: String(audioEl.__mineradioQueueItemKey || '')
        });
      }
    });
  });
}

function commitPulseSeekState(time) {
  if (typeof syncBeatMapPlaybackCursor === 'function') syncBeatMapPlaybackCursor(time, true);
  if (typeof resetBeatCameraSync === 'function') resetBeatCameraSync(time);
  if (window.PulseRuntime && PulseRuntime.analysis) PulseRuntime.analysis.seek(time);
  if (typeof saveLastPlaybackSnapshot === 'function') saveLastPlaybackSnapshot(true, 'seek');
}

function bindPulseProgressSurface(progressInput) {
  if (!progressInput || !progressSeekController || progressInput._pulseSeekBound) return false;
  progressInput._pulseSeekBound = true;
  progressInput.addEventListener('pointerdown', function (event) {
    if (!audio || !getPlaybackDurationSeconds() || progressDragState.active) return;
    if (
      typeof albumGaplessState !== 'undefined'
      && albumGaplessState
      && albumGaplessState.preload
      && (albumGaplessState.preload.mixPending || albumGaplessState.preload.mixStarted)
      && typeof clearAlbumGaplessPreload === 'function'
    ) clearAlbumGaplessPreload('manual-seek');
    progressDragState.active = progressSeekController.begin(event);
    progressDragState.sourceSerial = Number(trackSwitchToken) || 0;
    progressPointerId = event.pointerId;
    progressActiveSurface = progressInput;
    progressInput.classList.add('is-dragging');
    try { progressInput.setPointerCapture(event.pointerId); } catch (error) { }
  });

  progressInput.addEventListener('pointermove', function (event) {
    if (!progressDragState.active || event.pointerId !== progressPointerId) return;
    progressSeekController.preview(event);
  });

  function finishPulseSeekInteraction(event, commit) {
    if (!progressDragState.active) return;
    if (commit) {
      progressSeekController.preview(event);
      void progressSeekController.commit(event);
    } else {
      progressSeekController.cancel();
    }
    progressDragState.active = false;
    if (progressActiveSurface) progressActiveSurface.classList.remove('is-dragging');
    if (progressPointerId != null) {
      try { progressActiveSurface.releasePointerCapture(progressPointerId); } catch (error) { }
    }
    progressPointerId = null;
    progressActiveSurface = null;
  }

  progressInput.addEventListener('pointerup', function (event) {
    finishPulseSeekInteraction(event, true);
  });
  progressInput.addEventListener('pointercancel', function (event) {
    finishPulseSeekInteraction(event, false);
  });
  progressInput.addEventListener('lostpointercapture', function (event) {
    if (progressDragState.active) finishPulseSeekInteraction(event, false);
  });
  progressInput.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    var duration = getPlaybackDurationSeconds();
    if (!audio || !duration) return;
    event.preventDefault();
    var direction = event.key === 'ArrowLeft' ? -1 : 1;
    var target = Math.max(0, Math.min(duration,
      getPlaybackCurrentSeconds() + direction * PULSE_KEYBOARD_SEEK_SECONDS));
    var keyboardTarget = { min: 0, max: 1000, value: Math.round(target / duration * 1000) };
    var keyboardEvent = { currentTarget: keyboardTarget, target: keyboardTarget };
    if (!progressSeekController.begin(keyboardEvent)) return;
    progressSeekController.preview(keyboardEvent);
    void progressSeekController.commit(keyboardEvent);
  });
  return true;
}

var primaryProgressSurface = document.getElementById('progress-bar');
var pulseProgressSurfaces = pulseProgressSurfaceIds.map(function (id) {
  return id === 'progress-bar' ? primaryProgressSurface : document.getElementById(id);
}).filter(Boolean);

if (
  pulseProgressSurfaces.length
  && window.PulseRuntime
  && typeof window.PulseRuntime.createSeekController === 'function'
) {
  progressSeekController = window.PulseRuntime.createSeekController({
    getMedia: function () { return audio; },
    getSourceSerial: function () { return Number(trackSwitchToken) || 0; },
    renderPreview: renderProgressPreview,
    renderLive: renderProgressLive,
    onCommit: commitPulseSeekState,
    now: function () { return performance.now(); }
  });
  pulseProgressSurfaces.forEach(bindPulseProgressSurface);
}

setInterval(function () {
  if (!audio) {
    if (restoredLastPlaybackSnapshot && pendingPlaybackResumeAt > 0) {
      applyRestoredPlaybackProgressUi(restoredLastPlaybackSnapshot);
    } else {
      updatePlaybackProgressUi();
    }
    return;
  }
  updatePlaybackProgressUi();
  if (!isProgressDragPreviewActive()) saveLastPlaybackSnapshot(false, 'tick');
}, 200);
