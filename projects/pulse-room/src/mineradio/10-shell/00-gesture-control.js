/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/10-shell/00-gesture-control.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var soundstageEntered = false;
var soundstageEnterPromise = null;
var gestureRotation = { x: 0, y: 0 };

function resumePulseAudioContext() {
  var contexts = [
    typeof audioCtx !== 'undefined' ? audioCtx : null,
    typeof uiSfxCtx !== 'undefined' ? uiSfxCtx : null
  ].filter(Boolean);
  if (!contexts.length) return Promise.resolve();
  return Promise.all(contexts.map(function (context) {
    if (context.state !== 'suspended' || typeof context.resume !== 'function') return null;
    return context.resume().catch(function () { return null; });
  }));
}

function preparePulseIdleTrack() {
  var runtime = window.PulseRuntime;
  if (!runtime || !runtime.selection || !Array.isArray(runtime.catalog)) return Promise.resolve(false);
  var track = runtime.catalog.find(function (item) {
    return String(item.id) === String(runtime.selection.selectedId);
  }) || runtime.catalog[0];
  if (!track) return Promise.resolve(false);
  if (typeof ensurePulseCatalogQueue === 'function') ensurePulseCatalogQueue();
  var idleSong = cloneSong(track);
  if (typeof updatePulseTrackUi === 'function') updatePulseTrackUi(idleSong);
  if (typeof commitPulseTrackCover === 'function') {
    commitPulseTrackCover(idleSong, trackSwitchToken, { idlePreview: true });
  }
  document.body.dataset.trackId = String(track.id);
  var analysis = runtime.analysis
    ? Promise.resolve(runtime.analysis.select(track))
    : Promise.resolve(null);
  return analysis.then(function (analysisState) {
    if (analysisState && analysisState.status === 'fallback' && runtime.status) {
      runtime.status.report('analysis', { trackId: track.id, error: analysisState.error });
    }
    return true;
  });
}

function enterPulseSoundstage() {
  if (soundstageEnterPromise) return soundstageEnterPromise;
  soundstageEnterPromise = resumePulseAudioContext().then(function () {
    soundstageEntered = true;
    document.body.classList.remove('soundstage-locked');
    document.body.classList.add('studio-entry-active');
    window.setTimeout(function () {
      document.body.classList.remove('studio-entry-active');
    }, 1650);
    var state = document.getElementById('play-state');
    if (state) state.textContent = '声场已就绪';
    var play = document.getElementById('play-btn');
    if (play) play.focus({ preventScroll: true });
    if (typeof showToast === 'function') showToast('声场已就绪，选择音乐开始播放');
    return preparePulseIdleTrack().then(function () { return true; });
  }).catch(function (error) {
    console.warn('[PULSE Entry] failed to prepare idle track', error);
    soundstageEnterPromise = null;
    if (typeof showToast === 'function') showToast('音频尚未解锁，请再次点击进入');
    return false;
  });
  return soundstageEnterPromise;
}

function bindSoundstageEntry() {
  var button = document.getElementById('enter-soundstage');
  if (!button || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';
  button.addEventListener('click', enterPulseSoundstage);
}

bindSoundstageEntry();
