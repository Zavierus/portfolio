/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/06-hotkeys.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var pulseLocalHotkeysBound = false;

function bindHotkeySettings() {
  if (pulseLocalHotkeysBound) return;
  pulseLocalHotkeysBound = true;
  document.addEventListener('keydown', function (event) {
    if (
      isTypingTarget(event.target)
      || (typeof isPulseInteractiveTarget === 'function' && isPulseInteractiveTarget(event.target))
    ) return;
    if (event.code === 'Escape') {
      if (immersiveMode) setImmersiveMode(false);
      else toggleFxPanel(false);
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlay();
      return;
    }
    if (event.code === 'ArrowLeft' && event.altKey) {
      event.preventDefault();
      prevTrack(true);
      return;
    }
    if (event.code === 'ArrowRight' && event.altKey) {
      event.preventDefault();
      nextTrack(true);
      return;
    }
    if (event.code === 'KeyF' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      toggleImmersiveMode();
    }
  });
}
