/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/04-shelf/02-rebuild-panel-sync.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function pulseCatalogTracks() {
  if (!window.PulseRuntime || !PulseRuntime.catalog) return [];
  if (Array.isArray(PulseRuntime.catalog.all)) return PulseRuntime.catalog.all;
  return Array.isArray(PulseRuntime.catalog) ? PulseRuntime.catalog : [];
}

function pulseQueueSongFromCatalog(track) {
  var song = cloneSong(track);
  if (song) song.name = song.name || song.title;
  return song;
}

function ensurePulseCatalogQueue(trackId) {
  var catalog = pulseCatalogTracks();
  if (!playQueue.length) {
    playQueue = catalog.map(pulseQueueSongFromCatalog).filter(Boolean);
  } else if (trackId != null) {
    var queueHasTrack = playQueue.some(function (song) {
      return song && String(song.id) === String(trackId);
    });
    if (!queueHasTrack) {
      var catalogTrack = catalog.find(function (track) {
        return track && String(track.id) === String(trackId);
      });
      var song = pulseQueueSongFromCatalog(catalogTrack);
      if (song) playQueue.push(song);
    }
  }
  return playQueue;
}

function pulseCatalogIndex(trackId) {
  return pulseCatalogTracks().findIndex(function (track) {
    return String(track.id) === String(trackId);
  });
}

function syncPulseTrackSelection(track, detail) {
  if (!track) return false;
  var trackId = String(track.id);
  var controls = document.querySelectorAll('[data-track-id]');
  controls.forEach(function (control) {
    var selected = control.getAttribute('data-track-id') === trackId;
    if (control.hasAttribute('aria-pressed')) {
      control.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
    control.toggleAttribute('aria-current', selected);
    if (control.closest('#track-list')) control.closest('li')?.classList.toggle('selected', selected);
  });
  if (shelfManager && shelfManager.setSelectedTrackId) {
    shelfManager.setSelectedTrackId(trackId);
  }
  document.body.dataset.trackId = trackId;
  if (typeof updatePulseClassicSelection === 'function') updatePulseClassicSelection(trackId);
  return true;
}

function focusPulseTrackSelection(track) {
  if (!track) return false;
  var id = CSS.escape(String(track.id));
  var control = document.querySelector('#playlist-panel [data-track-id="' + id + '"],#mini-queue-popover [data-track-id="' + id + '"],#track-list [data-track-id="' + id + '"]');
  if (!control) return false;
  control.focus();
  return true;
}

function closePulseTrackDrawer(opts) {
  opts = opts || {};
  var drawer = document.getElementById('track-drawer');
  var toggle = document.getElementById('track-list-toggle');
  if (!drawer || !toggle) return false;
  var focusWasInside = drawer.contains(document.activeElement);
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;
  toggle.setAttribute('aria-expanded', 'false');
  if (opts.restoreFocus || focusWasInside) toggle.focus();
  return true;
}

function openPulseTrackDrawer() {
  var drawer = document.getElementById('track-drawer');
  var toggle = document.getElementById('track-list-toggle');
  if (!drawer || !toggle) return false;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.inert = false;
  toggle.setAttribute('aria-expanded', 'true');
  var selected = drawer.querySelector('[aria-pressed="true"]');
  (selected || drawer.querySelector('button'))?.focus();
  return true;
}

function selectPulseTrack(trackId, detail) {
  if (!window.PulseRuntime || !PulseRuntime.selection) return Promise.resolve(false);
  return PulseRuntime.selection.select(trackId, detail || {});
}

function selectPulseShelfTrack(trackId, detail) {
  if (pulseCatalogIndex(trackId) >= 0) return selectPulseTrack(trackId, detail);
  var queueIndex = playQueue.findIndex(function (song) {
    return song && String(song.id) === String(trackId);
  });
  if (queueIndex < 0) return Promise.resolve(false);
  return Promise.resolve(playQueueAt(queueIndex, { manual: true }));
}

function bindPulseCatalogSelector() {
  if (!window.PulseRuntime || !PulseRuntime.selection) return false;
  var list = document.getElementById('track-list');
  if (!list || list.dataset.bound === 'true') return false;
  list.dataset.bound = 'true';

  ensurePulseCatalogQueue();
  PulseRuntime.selection.setHandler(function (track) {
    var queue = ensurePulseCatalogQueue(track.id);
    var index = queue.findIndex(function (song) { return String(song.id) === String(track.id); });
    if (index < 0) return false;
    return playQueueAt(index, { manual: true });
  });
  PulseRuntime.selection.setFocusHandler(focusPulseTrackSelection);
  PulseRuntime.selection.subscribe(syncPulseTrackSelection);

  list.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-track-id]');
    if (!button) return;
    selectPulseTrack(button.getAttribute('data-track-id'), {
      origin: 'list',
      userInitiated: true
    }).then(function (selected) {
      if (selected) closePulseTrackDrawer();
    });
  });

  var toggle = document.getElementById('track-list-toggle');
  var close = document.getElementById('track-list-close');
  if (toggle) toggle.addEventListener('click', function () {
    var drawer = document.getElementById('track-drawer');
    if (drawer && drawer.classList.contains('open')) closePulseTrackDrawer({ restoreFocus: true });
    else openPulseTrackDrawer();
  });
  if (close) close.addEventListener('click', function () {
    closePulseTrackDrawer({ restoreFocus: true });
  });
  var mobileTracks = matchMedia('(max-width: 900px)');
  closePulseTrackDrawer();
  mobileTracks.addEventListener('change', function () {
    closePulseTrackDrawer();
  });
  return true;
}

function initializePulseShelf() {
  if (!shelfManager || !shelfManager.setMode || !shelfManager.rebuild) return false;
  shelfManager.setMode(fx.shelf || 'side');
  shelfManager.rebuild(false);
  return true;
}

function safeShelfRebuild(reason, asyncCards) {
  if (!shelfManager || typeof shelfManager.rebuild !== 'function') return false;
  try {
    shelfManager.rebuild(asyncCards);
    return true;
  } catch (error) {
    console.warn('[PULSE Shelf]', reason || 'rebuild', error);
    return false;
  }
}

function scheduleShelfRebuild(reason, asyncCards) {
  requestAnimationFrame(function () { safeShelfRebuild(reason, asyncCards); });
}

function safeShelfCloseContent(reason) {
  if (!shelfManager || typeof shelfManager.closeContent !== 'function') return false;
  try {
    shelfManager.closeContent();
    if (!shelfPinnedOpen && typeof restoreBottomControlsAfterShelfExit === 'function') {
      requestAnimationFrame(function () { restoreBottomControlsAfterShelfExit(reason || 'shelf-content-close'); });
    }
    return true;
  } catch (error) {
    console.warn('[PULSE Shelf]', reason || 'close-content', error);
    return false;
  }
}

function isPlaylistPanelVisibleForRender() {
  var panel = document.getElementById('playlist-panel');
  var panelOpen = panel && (panel.classList.contains('show') || panel.classList.contains('peek') || panel.classList.contains('pinned'));
  return !!(panelOpen || miniQueueOpen);
}

function safeRenderQueuePanel(reason, opts) {
  opts = opts || {};
  if (!isPlaylistPanelVisibleForRender() && opts.deferWhenHidden !== false) {
    queuePanelDirty = true;
    return true;
  }
  try {
    renderQueuePanel(opts);
    queuePanelDirty = false;
    return true;
  } catch (error) {
    console.warn('[PULSE Queue]', reason || 'render', error);
    return false;
  }
}

function flushDeferredQueuePanel(reason) {
  if (!queuePanelDirty) return;
  safeRenderQueuePanel(reason || 'flush-deferred-queue', {
    animate: false,
    scrollCurrent: miniQueueOpen,
    deferWhenHidden: false
  });
}

window.addEventListener('blur', clearShelfPreviewOnPointerExit);
document.addEventListener('mouseleave', clearShelfPreviewOnPointerExit);
document.addEventListener('mouseout', function (event) {
  if (!event.relatedTarget && !event.toElement) clearShelfPreviewOnPointerExit(event);
});

bindPulseCatalogSelector();
