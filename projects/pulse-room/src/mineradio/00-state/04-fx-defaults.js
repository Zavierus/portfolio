/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/04-fx-defaults.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var PULSE_ROOM_SETTINGS_STORE_KEY = 'pulse-room-settings-v3';
var PULSE_ROOM_SETTINGS_SCHEMA = 3;

var fxDefaults = {
  preset: 0,
  intensity: 0.92,
  point: 1,
  speed: 1,
  twist: 0,
  color: 1.1,
  scatter: 0,
  bgFade: 0.2,
  coverResolution: 1.55,
  depth: 0.2,
  bloom: true,
  bloomStrength: 0.62,
  edge: false,
  cinema: true,
  cinemaShake: 0.42,

  visualTintMode: 'custom',
  visualTintColor: '#dcff39',
  mistColorMode: 'custom',
  mistPrimaryColor: '#159b80',
  mistSecondaryColor: '#6de7b0',
  mistDensity: 1.0,
  uiAccentColor: '#dcff39',
  backgroundColorMode: 'custom',
  backgroundColor: '#050506',
  backgroundOpacity: 1,
  backgroundMedia: null,
  backgroundMediaCropX: 50,
  backgroundMediaCropY: 50,
  backgroundMediaZoom: 1,

  shelf: 'side',
  shelfPinnedOpen: false,
  shelfCameraMode: 'dynamic',
  shelfPresence: 'always',
  shelfSize: 0.92,
  shelfOffsetX: -0.34,
  shelfOffsetY: -0.2,
  shelfOffsetZ: 0.12,
  shelfAngleY: -11,
  shelfAngleYManual: true,
  shelfOpacity: 1,
  shelfBgOpacity: 0.79,
  shelfAccentColor: '#dcff39',
  shelfDetailOffsetX: 0,
  shelfDetailOffsetY: 0,
  shelfDetailOffsetZ: 0,
  shelfDetailScale: 1.35,
  shelfDetailAngleX: 0,
  shelfDetailAngleY: -13,
  shelfDetailRowGap: 1,
  shelfDetailOpenDuration: 0.6,
  shelfDetailCloseDuration: 0.18,
  shelfDetailRowDuration: 0.72,
  shelfDetailIntroStrength: 1,
  shelfDetailParallax: 1,
  shelfSummonOpenDuration: 0.91,
  shelfSummonCloseDuration: 0.46,
  shelfSummonSlide: 1.9,
  shelfSummonStagger: 1,
  shelfSummonScale: 1,
  shelfSummonParallax: 1,
  shelfCameraEnterSpeed: 0.24,
  shelfCameraExitSpeed: 0.24,

  performanceQuality: 'high',
  foregroundFpsMode: 'vsync',
  immersive: false,
  cam: 'off',

  // Retained runtime defaults that have no browser settings control.
  floatLayer: true,
  backgroundStarRiver: true,
  particleLyrics: true,
  aiDepth: false,
  backgroundAlbumCover: false,
  playlistPanelGlassBlur: 14,
  playlistPanelGlassDensity: 0.55,
  playlistPanelOpenDuration: 0.72,
  playlistPanelCloseDuration: 0.48,
  performanceBackground: 'release',
  liveBackgroundKeep: false,
  lyricGlow: false,
  lyricGlowParticles: false,
  lyricGlowStrength: 0,
  lyricCameraLock: false,
  desktopLyrics: false,
  desktopLyricsFps: 0,
  wallpaperMode: false,
  sonicAudioMonitorEnabled: false,
  sonicAudioAutoTrack: false
};

function normalizeForegroundFpsMode(value) {
  var mode = String(value || '').trim().toLowerCase();
  if (mode === 'vsync' || mode === 'adaptive') return mode;
  if (/^(45|60|75|90|120)$/.test(mode)) return mode;
  return fxDefaults.foregroundFpsMode;
}

function foregroundFixedFpsForMode(mode) {
  mode = normalizeForegroundFpsMode(mode);
  if (mode === 'vsync') return 0;
  if (mode === 'adaptive') return null;
  return Math.max(1, Number(mode) || 60);
}
