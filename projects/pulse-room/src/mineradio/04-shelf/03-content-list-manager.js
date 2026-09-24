/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/04-shelf/03-content-list-manager.js */
/* Modified for PULSE ROOM on 2026-07-30. */
// PULSE ROOM has no secondary service-backed content level. This inert shape
// preserves the retained shelf lifecycle contract while all selection is
// routed through the four-record local catalog.
function makeContentListManager() {
  return Object.freeze({
    open: function () { return false; },
    close: function () { return false; },
    isOpen: function () { return false; },
    update: function () {},
    refreshTheme: function () {},
    raycastRows: function () { return null; },
    raycastPanel: function () { return null; },
    pickRowAtScreen: function () { return null; },
    screenContainsPanel: function () { return false; },
  });
}
