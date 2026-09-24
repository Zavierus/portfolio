/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/01-perf-render-state.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function markAppPerf(name) {
  try {
    var value = performance.now();
    appPerfMarks.push({ name: name, value: Math.round(value) });
    if (performance && performance.mark) performance.mark('pulse-room:' + name);
  } catch (e) { }
}
markAppPerf('script-start');

function isDeepBackgroundMode() {
  return document.hidden === true;
}

function isLiveBackgroundKeepMode() {
  return false;
}

function isBackgroundReleaseMode() {
  return true;
}

function isHiddenForBackgroundOptimization() {
  return document.hidden === true;
}

function maybeTrimRuntimeCaches() { }

function applyRendererPowerMode() {
  if (typeof renderer === 'undefined' || !renderer) return;
  if (typeof getRenderPixelRatio === 'function') {
    renderer.setPixelRatio(getRenderPixelRatio());
  }
  renderer.setSize(Math.max(1, innerWidth), Math.max(1, innerHeight));
}

function installRenderPowerHooks() {
  if (installRenderPowerHooks.bound) return;
  installRenderPowerHooks.bound = true;
  document.addEventListener('visibilitychange', applyRendererPowerMode);
}

var queueViewTab = 'queue';
var playMode = 'loop';
var miniQueueOpen = false;
var miniQueueRenderSeq = 0;
var queueRenderSeq = 0;
var playlistRenderSeq = 0;
var queuePanelDirty = false;
var PLAYLIST_LAZY_BATCH_SIZE = 48;
var QUEUE_PANEL_BATCH_SIZE = PLAYLIST_LAZY_BATCH_SIZE;
var QUEUE_VIRTUAL_ROW_STEP = 62;
var QUEUE_VIRTUAL_OVERSCAN = 8;
var queuePanelRenderLimit = QUEUE_PANEL_BATCH_SIZE;
var queuePanelRenderKey = '';
var queuePanelVirtualState = { start: -1, end: -1, miniStart: -1, miniEnd: -1, raf: 0 };
var miniQueueLazyBound = false;
var PLAYLIST_PANEL_BATCH_SIZE = PLAYLIST_LAZY_BATCH_SIZE;
var PLAYLIST_CATALOG_FIRST_PAGE_SIZE = PLAYLIST_LAZY_BATCH_SIZE;
var PLAYLIST_CATALOG_BACKGROUND_PAGE_SIZE = 200;
var PLAYLIST_CARD_VIRTUAL_OVERSCAN_PX = 760;
var playlistPanelRenderLimit = PLAYLIST_PANEL_BATCH_SIZE;
var playlistPanelLazyBound = false;
var PLAYLIST_DETAIL_INITIAL_RENDER = PLAYLIST_LAZY_BATCH_SIZE;
var PLAYLIST_DETAIL_BATCH_SIZE = PLAYLIST_LAZY_BATCH_SIZE;
var PLAYLIST_DETAIL_ROW_STEP = 56;
var PLAYLIST_DETAIL_VIRTUAL_OVERSCAN = 7;
var PLAYLIST_DETAIL_OUTER_CHROME_HEIGHT = 142;
var PLAYLIST_DETAIL_OUTER_FOOTER_HEIGHT = 44;
var PLAYLIST_QUEUE_INITIAL_BATCH_SIZE = 96;
var PLAYLIST_QUEUE_BACKGROUND_BATCH_SIZE = 160;
var PLAYLIST_QUEUE_PLAYBACK_AHEAD_THRESHOLD = 96;
var playlistCatalogSyncState = { token: 0, loading: false, timer: 0, catalogs: {}, error: '' };
var playlistCatalogRevision = 0;
var smoothWheelScrollBound = false;
var coverProcessToken = 0;
var aiDepthPipeline = null;
var aiDepthReady = false;
var aiDepthBusy = false;
var aiDepthFailUntil = 0;
var coverDepthCache = Object.create(null);
var coverDepthCacheKeys = [];
var aiDepthLastRunAt = 0;
var aiDepthMinGapMs = 18000;
