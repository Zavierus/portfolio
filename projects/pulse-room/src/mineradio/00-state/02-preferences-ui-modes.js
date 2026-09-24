/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/02-preferences-ui-modes.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function readSavedVolume() {
  try {
    var value = parseFloat(localStorage.getItem('pulse-room-volume-v3'));
    return isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.82;
  } catch (e) {
    return 0.82;
  }
}

function normalizeAudioFadeMs(value, fallback) {
  var ms = Math.round(Number(value));
  if (!isFinite(ms)) ms = fallback;
  return Math.max(AUDIO_FADE_MIN_MS, Math.min(AUDIO_FADE_MAX_MS, ms));
}

function readAudioFadePreference() {
  var defaults = { fadeInMs: 460, fadeOutMs: 420 };
  try {
    var raw = JSON.parse(localStorage.getItem(AUDIO_FADE_STORE_KEY) || '{}') || {};
    return {
      fadeInMs: normalizeAudioFadeMs(raw.fadeInMs, defaults.fadeInMs),
      fadeOutMs: normalizeAudioFadeMs(raw.fadeOutMs, defaults.fadeOutMs)
    };
  } catch (e) {
    return defaults;
  }
}

function saveAudioFadePreference() {
  try {
    localStorage.setItem(AUDIO_FADE_STORE_KEY, JSON.stringify({
      fadeInMs: AUDIO_FADE_IN_MS,
      fadeOutMs: AUDIO_FADE_OUT_MS
    }));
  } catch (e) { }
}

function readBooleanPreference(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw == null ? !!fallback : raw === '1';
  } catch (e) {
    return !!fallback;
  }
}

function saveBooleanPreference(key, on) {
  try { localStorage.setItem(key, on ? '1' : '0'); } catch (e) { }
}

function readPlaylistPanelTabPreference() {
  return 'queue';
}

function savePlaylistPanelTabPreference() { }

function readDiyModePreference() {
  return false;
}

function readCloseBehaviorPreference() {
  return 'exit';
}

function readStartupResumeModePreference() {
  return 'resume';
}

function startupResumeSecondsFromSnapshot(snapshot) {
  return Math.max(0, Number(snapshot && snapshot.currentTime) || 0);
}

function applyDiyMode() {
  diyPlayerMode = false;
  document.body.classList.add('simple-mode');
}

function isDiyMode() {
  return false;
}
