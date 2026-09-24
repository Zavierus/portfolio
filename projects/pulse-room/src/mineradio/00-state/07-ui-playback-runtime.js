/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/07-ui-playback-runtime.js */
/* Modified for PULSE ROOM on 2026-07-30. */
var presetTransition = { active: false, start: -10, duration: 0.92, from: 0, to: 0 };
var controlsAutoHide = true;
var controlsHovering = false;
var controlsHideTimer = null;
var controlsRevealHoldUntil = 0;
var controlsHandleDimTimer = null;
var controlsLastMoveAt = 0;
var controlsShelfSuppressUntil = 0;
var cursorHideTimer = null;
var CURSOR_HIDE_DELAY = 2500;
var fxPanelPinned = false;
var playlistPanelPinned = false;
var fxFabAutoHideRevealArmed = false;
var startupAutoplayAttempted = true;
var startupAutoplayJobId = 0;
var startupAutoplayRetryTimer = null;
var startupAutoplayAttemptCount = 0;
var startupAutoplayHomeFallbackTried = true;
var startupAutoplayHomeQueuedReason = '';
var startupHomeRevealReady = true;
var startupRestoreHomePending = false;
var pendingPlaybackResumeAt = 0;
var restoredLastPlaybackSnapshot = null;
var lastPlaybackSnapshotSavedAt = 0;
var hotkeySettings = {};
var immersiveMode = false;
var immersiveState = {
  shelfMode: 'side',
  shelfPinnedOpen: false,
  controlsAutoHide: true,
  bottomVisible: true
};
var pointerParallax = { x: 0, y: 0 };
var pointerTarget = { x: 0, y: 0 };
var headParallax = { x: 0, y: 0, active: false };
var headNeutral = null;

var PULSE_APP_MODE_STORE_KEY = 'pulse-room-app-mode-v1';
var pulseAppMode = 'studio';

function normalizePulseAppMode(value) {
  return String(value || '').toLowerCase() === 'classic' ? 'classic' : 'studio';
}

function readPulseAppMode() {
  try {
    var stored = localStorage.getItem(PULSE_APP_MODE_STORE_KEY);
    return stored ? normalizePulseAppMode(stored) : 'studio';
  } catch (error) {
    return 'studio';
  }
}

function savePulseAppMode(mode) {
  try { localStorage.setItem(PULSE_APP_MODE_STORE_KEY, normalizePulseAppMode(mode)); } catch (error) { }
}
