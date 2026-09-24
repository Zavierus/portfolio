/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/06-fx-runtime-layout.js */
/* Modified for PULSE ROOM on 2026-07-30. */

function readSavedPlaybackVisualPreset() {
  var raw = readCurrentFxAutosaveRaw();
  return normalizeSavedVisualPresetIndex(raw && raw.preset);
}

var playbackVisualPreset = readSavedPlaybackVisualPreset();
var startupVisualPreviewActive = false;
var fx = normalizePulseRoomSettings(readCurrentFxAutosaveRaw());

function clampPlaylistPanelFxSettings() {
  fx.playlistPanelGlassBlur = Math.round(clampRange(fx.playlistPanelGlassBlur, 14, 60));
  fx.playlistPanelGlassDensity = clampRange(fx.playlistPanelGlassDensity, 0.55, 1);
  fx.playlistPanelOpenDuration = clampRange(fx.playlistPanelOpenDuration, 0.08, 0.72);
  fx.playlistPanelCloseDuration = clampRange(fx.playlistPanelCloseDuration, 0.06, 0.48);
}

function playlistPanelAlphaVars(density) {
  density = clampRange(Number(density) || fxDefaults.playlistPanelGlassDensity, 0.55, 1);
  return {
    sticky1: clampRange(0.52 + density * 0.46, 0.55, 0.98),
    sticky2: clampRange(0.46 + density * 0.48, 0.5, 0.94),
    sticky3: clampRange(0.28 + density * 0.56, 0.36, 0.84),
    toolbar1: clampRange(0.48 + density * 0.46, 0.52, 0.94),
    toolbar2: clampRange(0.42 + density * 0.46, 0.46, 0.88),
    toolbar3: clampRange(0.24 + density * 0.48, 0.3, 0.74)
  };
}

function setPlaylistPanelCssVar(name, value) {
  document.documentElement.style.setProperty(name, value);
  var panel = document.getElementById('playlist-panel');
  if (panel) panel.style.setProperty(name, value);
}

function applyPlaylistPanelFxSettings() {
  clampPlaylistPanelFxSettings();
  var blur = fx.playlistPanelGlassBlur;
  var density = fx.playlistPanelGlassDensity;
  var openMs = Math.round(fx.playlistPanelOpenDuration * 1000);
  var closeMs = Math.round(fx.playlistPanelCloseDuration * 1000);
  var alphas = playlistPanelAlphaVars(density);
  setPlaylistPanelCssVar('--playlist-panel-open-ms', openMs + 'ms');
  setPlaylistPanelCssVar('--playlist-panel-close-ms', closeMs + 'ms');
  setPlaylistPanelCssVar('--playlist-sticky-blur', blur + 'px');
  setPlaylistPanelCssVar('--playlist-toolbar-blur', Math.round(clampRange(blur * 0.74, 12, 46)) + 'px');
  setPlaylistPanelCssVar('--playlist-sticky-a1', alphas.sticky1.toFixed(3));
  setPlaylistPanelCssVar('--playlist-sticky-a2', alphas.sticky2.toFixed(3));
  setPlaylistPanelCssVar('--playlist-sticky-a3', alphas.sticky3.toFixed(3));
  setPlaylistPanelCssVar('--playlist-toolbar-a1', alphas.toolbar1.toFixed(3));
  setPlaylistPanelCssVar('--playlist-toolbar-a2', alphas.toolbar2.toFixed(3));
  setPlaylistPanelCssVar('--playlist-toolbar-a3', alphas.toolbar3.toFixed(3));
}

applyPlaylistPanelFxSettings();
