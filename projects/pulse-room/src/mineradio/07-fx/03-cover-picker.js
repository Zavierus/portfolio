/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/03-cover-picker-fonts.js */
/* Modified for PULSE ROOM on 2026-07-30. */

function visualTintFromCurrentCover() {
  var palette = typeof currentCoverPalette !== 'undefined' ? currentCoverPalette : null;
  var candidate = palette && (palette.accent || palette.primary || palette.vibrant);
  return normalizeHexColor(candidate, fxDefaults.visualTintColor);
}

function applyCoverPickerColor() {
  if (fx.visualTintMode !== 'auto') return;
  fx.visualTintColor = visualTintFromCurrentCover();
  updateVisualTintControls();
  syncFxUniforms();
}
