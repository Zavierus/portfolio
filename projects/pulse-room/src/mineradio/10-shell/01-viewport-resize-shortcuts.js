/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/10-shell/01-viewport-resize-shortcuts.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function refreshMainRendererViewport() {
  if (typeof camera !== 'undefined' && camera) {
    camera.aspect = Math.max(1, innerWidth) / Math.max(1, innerHeight);
    camera.updateProjectionMatrix();
  }
  if (typeof applyRendererPowerMode === 'function') applyRendererPowerMode();
}

function scheduleMainRendererViewportRefresh() {
  refreshMainRendererViewport();
  [48, 160].forEach(function (delay) {
    setTimeout(refreshMainRendererViewport, delay);
  });
}

function isPulseInteractiveTarget(target) {
  if (!target || !target.closest) return false;
  return !!target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]');
}

function closePulseOverlay() {
  var sourceDialog = document.getElementById('source-license-dialog');
  if (sourceDialog && sourceDialog.open) {
    sourceDialog.close();
    return true;
  }
  var fxPanel = document.getElementById('fx-panel');
  if (fxPanel && fxPanel.classList.contains('show') && typeof toggleFxPanel === 'function') {
    toggleFxPanel(false);
    return true;
  }
  if (typeof miniQueueOpen !== 'undefined' && miniQueueOpen && typeof closeMiniQueue === 'function') {
    closeMiniQueue();
    return true;
  }
  var playlistPanel = document.getElementById('playlist-panel');
  if (playlistPanel && (playlistPanel.classList.contains('show') || playlistPanel.classList.contains('peek'))) {
    if (typeof closePlaylistPanelSoft === 'function') closePlaylistPanelSoft('escape');
    return true;
  }
  var drawer = document.querySelector('.track-drawer.open');
  if (drawer) {
    if (typeof closePulseTrackDrawer === 'function') closePulseTrackDrawer({ restoreFocus: true });
    else drawer.classList.remove('open');
    return true;
  }
  return false;
}

window.addEventListener('resize', scheduleMainRendererViewportRefresh);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && closePulseOverlay()) {
    event.preventDefault();
    return;
  }
  if (isPulseInteractiveTarget(event.target)) return;
  if (event.code === 'Space') {
    var playButton = document.getElementById('play-btn');
    if (!playButton || event.target === playButton) return;
    event.preventDefault();
    playButton.click();
  }
});
