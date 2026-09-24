/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/05-packaged-fx-archive.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var PACKAGED_DEFAULT_FX_SNAPSHOT = Object.freeze(Object.assign({}, fxDefaults));

function clonePackagedDefaultFxSnapshot() {
  return Object.assign({}, PACKAGED_DEFAULT_FX_SNAPSHOT);
}

function packagedDefaultVisualSettingsRaw() {
  return clonePackagedDefaultFxSnapshot();
}
