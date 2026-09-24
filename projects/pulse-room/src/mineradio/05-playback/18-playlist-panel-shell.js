/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/06-lyrics/01-playlist-panel-shell.js */
/* Modified for PULSE ROOM on 2026-07-30. */
// ============================================================
function pulseMotionIsReduced() {
  return !!(
    (window.PulseRuntime && PulseRuntime.quality && PulseRuntime.quality.reducedMotion)
    || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
}
function animateListItems(container, selector, opts) {
  if (!container || !window.gsap) return;
  opts = opts || {};
  var items = Array.prototype.slice.call(container.querySelectorAll(selector));
  if (!items.length) return;
  var limit = opts.limit || 18;
  var targets = items.slice(0, limit);
  if (pulseMotionIsReduced()) return;
  window.gsap.killTweensOf(targets);
  window.gsap.fromTo(targets, {
    autoAlpha: 0,
    y: opts.y == null ? 8 : opts.y,
    x: opts.x == null ? -6 : opts.x
  }, {
    autoAlpha: 1,
    y: 0,
    x: 0,
    duration: opts.duration || 0.22,
    stagger: opts.stagger || 0.012,
    ease: opts.ease || 'power2.out',
    force3D: true,
    overwrite: true
  });
}
function smoothScrollToItem(scroller, item, opts) {
  if (!scroller || !item) return;
  opts = opts || {};
  var target = item.offsetTop - Math.max(0, (scroller.clientHeight - item.offsetHeight) * (opts.align == null ? 0.42 : opts.align));
  target = Math.max(0, Math.min(target, Math.max(0, scroller.scrollHeight - scroller.clientHeight)));
  if (pulseMotionIsReduced()) {
    scroller.scrollTop = target;
    return;
  }
  if (window.gsap) {
    if (typeof scroller.__syncSmoothWheelTarget === 'function') scroller.__syncSmoothWheelTarget(target);
    window.gsap.killTweensOf(scroller);
    window.gsap.to(scroller, { scrollTop: target, duration: opts.duration || 0.30, ease: opts.ease || 'power2.out', overwrite: true });
  } else if (scroller.scrollTo) {
    scroller.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    scroller.scrollTop = target;
  }
}
function bindSmoothWheelScroll(scroller) {
  if (!scroller || scroller.__smoothWheelBound) return;
  scroller.__smoothWheelBound = true;
  var targetTop = scroller.scrollTop;
  var tween = null;
  scroller.__syncSmoothWheelTarget = function (top) {
    if (tween) {
      tween.kill();
      tween = null;
    }
    targetTop = isFinite(top) ? top : scroller.scrollTop;
  };
  scroller.addEventListener('wheel', function (e) {
    if (!window.gsap || e.ctrlKey || pulseMotionIsReduced()) return;
    var max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (max <= 0 || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 18;
    else if (e.deltaMode === 2) delta *= scroller.clientHeight;
    var current = tween ? targetTop : scroller.scrollTop;
    var next = Math.max(0, Math.min(max, current + delta));
    if (next === current && ((delta < 0 && scroller.scrollTop <= 0) || (delta > 0 && scroller.scrollTop >= max - 1))) {
      targetTop = scroller.scrollTop;
      return;
    }
    e.preventDefault();
    targetTop = next;
    if (tween) tween.kill();
    tween = window.gsap.to(scroller, {
      scrollTop: targetTop,
      duration: 0.24,
      ease: 'power2.out',
      overwrite: true,
      onComplete: function () {
        tween = null;
        targetTop = scroller.scrollTop;
      }
    });
  }, { passive: false });
  scroller.addEventListener('scroll', function () {
    if (!tween) targetTop = scroller.scrollTop;
  }, { passive: true });
}
function bindSmoothQueueScrolling() {
  if (smoothWheelScrollBound) return;
  smoothWheelScrollBound = true;
  [
    'mini-queue-list',
    'search-results',
    'fx-panel',
    'playlist-panel',
    'track-detail-body'
  ].forEach(function (id) {
    bindSmoothWheelScroll(document.getElementById(id));
  });
}
function animateVisiblePanelList(listEl, selector, scroller, activeSelector, opts) {
  if (!listEl) return;
  opts = opts || {};
  requestAnimationFrame(function () {
    animateListItems(listEl, selector, { x: -8, y: 6, stagger: 0.01, duration: 0.20, limit: 16 });
    var active = activeSelector ? listEl.querySelector(activeSelector) : null;
    if (active && scroller && opts.scrollActive !== false) smoothScrollToItem(scroller, active, { duration: 0.32 });
  });
}
function miniQueueSkeleton() {
  return '<div class="mini-queue-skeleton"></div><div class="mini-queue-skeleton"></div><div class="mini-queue-skeleton"></div>';
}
function queueHydrationExpectedTotal() {
  var loaded = playQueue && playQueue.length || 0;
  if (!queueHydrationState || queueHydrationState.queueRef !== playQueue) return loaded;
  if (!queueHydrationState.active && !queueHydrationState.loading && !queueHydrationState.error) return loaded;
  return Math.max(loaded, Number(queueHydrationState.total) || 0);
}
function queueHydrationFooterHtml(compact) {
  if (!queueHydrationState || queueHydrationState.queueRef !== playQueue) return '';
  var loaded = playQueue.length;
  var total = queueHydrationExpectedTotal();
  if (!queueHydrationState.active && !queueHydrationState.error && (!total || loaded >= total)) return '';
  var label = queueHydrationState.error
    ? ('后续歌曲载入中断 · 已准备 ' + loaded + (total ? '/' + total : ''))
    : (queueHydrationState.loading
      ? ('正在载入下一批 · ' + loaded + (total ? '/' + total : ''))
      : ('已准备 ' + loaded + (total ? '/' + total : '') + ' · 播放或滚动到末尾时继续'));
  var retry = queueHydrationState.error
    ? '<button type="button" class="queue-hydration-retry" onclick="event.stopPropagation();retryPlaylistQueueHydration()">重试</button>'
    : (queueHydrationState.active && !queueHydrationState.loading
      ? '<button type="button" class="queue-hydration-retry" onclick="event.stopPropagation();requestPlaylistQueueHydrationForBrowse()">再载一批</button>'
      : '');
  return '<div class="queue-hydration-status' + (compact ? ' compact' : '') + '">' +
    '<span class="queue-hydration-spinner' + (queueHydrationState.loading ? ' spinning' : '') + '"></span>' +
    '<span>' + label + '</span>' + retry + '</div>';
}
function togglePlaylistPanel(force) {
  var el = document.getElementById('playlist-panel');
  if (!el) return false;
  var open = force == null ? !el.classList.contains('show') : !!force;
  setPulsePanelVisibility(el, open, 'pl', 'show');
  if (open) {
    markPlaylistPanelMotion(el, playlistPanelMotionMs('open'));
    var runPlaylistOpenAnimation = shouldAnimatePlaylistPanelOpen(el);
    scheduleUiWarmTask(function () {
      flushDeferredQueuePanel('playlist-panel-open');
      preparePlaylistPanelTabOnOpen(el);
      if (runPlaylistOpenAnimation) animatePlaylistPanelCurrentTab(el, { scrollActive: false });
    }, 180);
  }
  return open;
}
function closePlaylistPanelSoft(reason) {
  var panel = document.getElementById('playlist-panel');
  if (!panel || playlistPanelPinned) return false;
  if (!panel.classList.contains('peek') && !panel.classList.contains('show')) return false;
  if (peekTimers.pl) { clearTimeout(peekTimers.pl); peekTimers.pl = null; }
  if (typeof resetSecondaryPlaylistEdgeGuard === 'function') resetSecondaryPlaylistEdgeGuard();
  panel.classList.add('playlist-panel-closing');
  panel.classList.remove('peek');
  setPulsePanelVisibility(panel, false, 'pl', 'show');
  markPlaylistPanelMotion(panel, playlistPanelMotionMs('close'));
  setTimeout(function () { panel.classList.remove('playlist-panel-closing'); }, playlistPanelMotionMs('close') + 80);
  return true;
}
function applyPlaylistPanelPinState(openPanel) {
  var panel = document.getElementById('playlist-panel');
  var btn = document.getElementById('playlist-pin-btn');
  if (panel) {
    panel.classList.toggle('pinned', !!playlistPanelPinned);
    if (playlistPanelPinned || openPanel) {
      panel.dataset.preserveTabOnOpen = '1';
      setPeek(panel, true, 'pl');
    }
  }
  if (btn) {
    btn.classList.toggle('active', !!playlistPanelPinned);
    btn.title = playlistPanelPinned ? '取消常开歌单' : '常开歌单';
  }
}
function setPlaylistPanelPinned(on, silent) {
  playlistPanelPinned = !!on;
  saveBooleanPreference(PLAYLIST_PANEL_PIN_STORE_KEY, playlistPanelPinned);
  applyPlaylistPanelPinState(playlistPanelPinned);
  if (!silent) showToast(playlistPanelPinned ? '左侧歌单已常开' : '左侧歌单已恢复自动隐藏');
}
function togglePlaylistPanelPinned() {
  setPlaylistPanelPinned(!playlistPanelPinned);
}
function scrollPlaylistPanelToCurrent() {
  var panel = document.getElementById('playlist-panel');
  var list = document.getElementById('queue-list');
  if (!panel || !list || queueViewTab !== 'queue') return;
  var now = performance.now();
  if (panel.__lastCurrentScrollAt && now - panel.__lastCurrentScrollAt < 650) return;
  panel.__lastCurrentScrollAt = now;
  requestAnimationFrame(function () {
    renderQueuePanel({ animate: false, scrollCurrent: true });
    smoothScrollToItem(panel, list.querySelector('.queue-item.now'), { duration: 0.28, align: 0.34 });
  });
}
function animatePlaylistPanelCurrentTab(panel, opts) {
  opts = opts || {};
  panel = panel || document.getElementById('playlist-panel');
  if (queueViewTab === 'queue') {
    animateVisiblePanelList(document.getElementById('queue-list'), '.queue-item', panel, '.queue-item.now', { scrollActive: opts.scrollActive !== false });
  } else if (queueViewTab === 'playlists') {
    animateVisiblePanelList(document.getElementById('pl-list'), '.pl-card', panel);
  } else {
    animateVisiblePanelList(document.getElementById('podcast-list'), '.pl-card', panel);
  }
}
function preparePlaylistPanelTabOnOpen(panel) {
  var preserve = !!(panel && panel.dataset && panel.dataset.preserveTabOnOpen === '1');
  if (preserve && panel.dataset) {
    delete panel.dataset.preserveTabOnOpen;
  } else if (!playQueue.length && queueViewTab === 'queue') {
    switchPlaylistTab('playlists', { save: false, animate: false, refresh: false });
  }
  if (queueViewTab === 'queue') scrollPlaylistPanelToCurrent();
  else if (queueViewTab === 'playlists' || queueViewTab === 'podcasts') refreshUserPlaylists();
}
function switchPlaylistTab(tab, opts) {
  opts = opts || {};
  tab = normalizePlaylistPanelTab(tab);
  queueViewTab = tab;
  if (opts.save !== false) savePlaylistPanelTabPreference(tab);
  var queueTab = document.getElementById('tab-queue');
  var playlistTab = document.getElementById('tab-pl');
  if (queueTab) queueTab.classList.toggle('active', tab === 'queue');
  if (playlistTab) playlistTab.classList.toggle('active', tab === 'playlists');
  var podcastTab = document.getElementById('tab-podcast');
  if (podcastTab) podcastTab.classList.toggle('active', tab === 'podcasts');
  var queuePane = document.getElementById('queue-pane');
  var playlistPane = document.getElementById('pl-pane');
  if (queuePane) queuePane.style.display = tab === 'queue' ? '' : 'none';
  if (playlistPane) playlistPane.style.display = tab === 'playlists' ? '' : 'none';
  var podcastPane = document.getElementById('podcast-pane');
  if (podcastPane) podcastPane.style.display = tab === 'podcasts' ? '' : 'none';
  if ((tab === 'playlists' || tab === 'podcasts') && opts.refresh !== false) refreshUserPlaylists();
  if (opts.animate !== false) animatePlaylistPanelCurrentTab(document.getElementById('playlist-panel'));
}
function setMiniQueueOpen(open) {
  miniQueueOpen = !!open;
  var pop = document.getElementById('mini-queue-popover');
  var btn = document.getElementById('mini-queue-btn');
  var focusWasInside = !!(pop && pop.contains(document.activeElement));
  if (pop) {
    pop.classList.toggle('show', miniQueueOpen);
    pop.setAttribute('aria-hidden', miniQueueOpen ? 'false' : 'true');
    pop.inert = !miniQueueOpen;
  }
  if (btn) {
    btn.classList.toggle('active', miniQueueOpen);
    btn.setAttribute('aria-expanded', miniQueueOpen ? 'true' : 'false');
  }
  if (miniQueueOpen) {
    var seq = ++miniQueueRenderSeq;
    requestAnimationFrame(function () {
      if (seq !== miniQueueRenderSeq || !miniQueueOpen) return;
      renderMiniQueuePanel({ animate: true, scrollCurrent: true });
    });
    revealBottomControls(1300);
  } else if (focusWasInside && btn) {
    btn.focus();
  }
}
function toggleMiniQueue(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  setMiniQueueOpen(!miniQueueOpen);
}
function closeMiniQueue() {
  setMiniQueueOpen(false);
}
function bindMiniQueueButton() {
  var btn = document.getElementById('mini-queue-btn');
  if (!btn || btn.dataset.bound === 'true') return false;
  btn.dataset.bound = 'true';
  btn.addEventListener('click', toggleMiniQueue);
  btn.setAttribute('aria-expanded', 'false');
  return true;
}
function openPlaylistPanelTab(tab, preserve) {
  tab = normalizePlaylistPanelTab(tab);
  var panel = document.getElementById('playlist-panel');
  if (panel && panel.dataset && preserve !== false) panel.dataset.preserveTabOnOpen = '1';
  switchPlaylistTab(tab);
  setPeek(panel, true, 'pl');
}
function pulseQueueEscapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function bindPulseQueueRows(container) {
  if (!container) return;
  Array.prototype.forEach.call(container.querySelectorAll('[data-queue-index]'), function (row) {
    row.addEventListener('click', function () {
      playQueueAt(Number(row.getAttribute('data-queue-index')));
    });
    row.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      playQueueAt(Number(row.getAttribute('data-queue-index')));
    });
  });
  Array.prototype.forEach.call(container.querySelectorAll('[data-queue-remove]'), function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      removeFromQueue(Number(button.getAttribute('data-queue-remove')));
    });
  });
}
function pulseQueueRowsHtml(compact) {
  return playQueue.map(function (song, index) {
    var title = pulseQueueEscapeHtml(song.name || song.title || '未命名曲目');
    var artist = pulseQueueEscapeHtml(song.artist || song.composer || '本地音频');
    var cover = typeof songCoverSrc === 'function' ? songCoverSrc(song, 60) : '';
    var coverHtml = cover
      ? '<img src="' + pulseQueueEscapeHtml(cover) + '" alt="" loading="lazy" decoding="async">'
      : '<div class="' + (compact ? 'mini-queue-cover' : 'queue-cover-placeholder') + '"></div>';
    var itemClass = compact ? 'mini-queue-item' : 'queue-item';
    var infoClass = compact ? 'mini-queue-info' : 'qi-info';
    var nameClass = compact ? 'mini-queue-name' : 'qi-name';
    var subClass = compact ? 'mini-queue-sub' : 'qi-sub';
    return '<div class="' + itemClass + (index === currentIdx ? ' now' : '') + '" data-queue-index="' + index + '" data-track-id="' + pulseQueueEscapeHtml(song.id || '') + '" role="button" tabindex="0" aria-current="' + (index === currentIdx ? 'true' : 'false') + '">' +
      coverHtml +
      '<div class="' + infoClass + '"><div class="' + nameClass + '">' + title + '</div><div class="' + subClass + '">' + artist + '</div></div>' +
      '<button class="mini-queue-remove" type="button" data-queue-remove="' + index + '" aria-label="从队列移除">×</button>' +
      '</div>';
  }).join('');
}
function renderMiniQueuePanel(opts) {
  opts = opts || {};
  var list = document.getElementById('mini-queue-list');
  var count = document.getElementById('mini-queue-count');
  if (!list || !count) return;
  count.textContent = playQueue.length + ' 首';
  list.innerHTML = playQueue.length
    ? pulseQueueRowsHtml(true)
    : '<div class="mini-queue-empty">队列为空</div>';
  bindPulseQueueRows(list);
  if ((opts.animate || opts.scrollCurrent) && playQueue.length) {
    requestAnimationFrame(function () {
      if (opts.animate) animateListItems(list, '.mini-queue-item', { x: 0, y: 6, stagger: 0.01, duration: 0.20, limit: 16 });
      if (opts.scrollCurrent) smoothScrollToItem(list, list.querySelector('.mini-queue-item.now'), { duration: 0.30, align: 0.42 });
    });
  }
}
var panelReorderState = { timer: 0, active: false, pointerId: null, suppressClickUntil: 0 };
var reorderLongPressMs = 520;
var reorderMoveCancelPx = 9;
function clearPanelReorderClasses() {
  document.body.classList.remove('panel-reordering');
  Array.prototype.forEach.call(document.querySelectorAll('.reorder-pressing,.is-reordering,.is-reordering-list'), function (node) {
    node.classList.remove('reorder-pressing', 'is-reordering', 'is-reordering-list');
  });
}
function markPanelReorderSuppressed(ms) {
  panelReorderState.suppressClickUntil = performance.now() + (ms || 420);
  window.__mineradioSuppressReorderClick = true;
  setTimeout(function () {
    if (performance.now() >= panelReorderState.suppressClickUntil) window.__mineradioSuppressReorderClick = false;
  }, ms || 420);
}
function panelReorderClickSuppressed() {
  return performance.now() < (panelReorderState.suppressClickUntil || 0);
}
function cancelPanelReorder(markSuppress) {
  if (panelReorderState.timer) clearTimeout(panelReorderState.timer);
  if (markSuppress && panelReorderState.active && panelReorderState.kind === 'queue' && typeof saveLastPlaybackSnapshot === 'function') {
    saveLastPlaybackSnapshot(true, 'queue-reorder-final');
  }
  if (markSuppress && panelReorderState.active) markPanelReorderSuppressed(520);
  clearPanelReorderClasses();
  panelReorderState.timer = 0;
  panelReorderState.active = false;
  panelReorderState.pointerId = null;
}
function panelReorderBlockedTarget(target) {
  return !!(target && target.closest && target.closest('button,a,input,textarea,select,[data-pl-load-more],[data-pl-detail-load-more],[data-pl-detail-top],[data-pl-detail-play],[data-pl-detail-artist],[data-pl-detail-row],.pl-inline-detail'));
}
function panelReorderHitFromTarget(target) {
  if (!target || !target.closest || panelReorderBlockedTarget(target)) return null;
  var queueItem = target.closest('.queue-item[data-queue-index],.mini-queue-item[data-queue-index]');
  if (queueItem) {
    var queueRoot = queueItem.closest('#queue-list,#mini-queue-list');
    if (!queueRoot) return null;
    var queueIndex = Number(queueItem.getAttribute('data-queue-index'));
    if (!isFinite(queueIndex)) return null;
    return { kind: 'queue', item: queueItem, rootId: queueRoot.id, index: queueIndex, provider: '' };
  }
  var card = target.closest('.pl-card[data-playlist-index]');
  if (card && card.closest('#pl-list')) {
    var playlistIndex = Number(card.getAttribute('data-playlist-index'));
    if (!isFinite(playlistIndex) || playlistIndex < 0) return null;
    return {
      kind: 'playlist',
      item: card,
      rootId: 'pl-list',
      index: playlistIndex,
      provider: card.getAttribute('data-playlist-provider') || ''
    };
  }
  return null;
}
function panelReorderHitAtPoint(x, y, state) {
  var el = document.elementFromPoint(x, y);
  var hit = panelReorderHitFromTarget(el);
  if (!hit || !state || hit.kind !== state.kind || hit.rootId !== state.rootId) return null;
  if (state.kind === 'playlist' && state.provider && hit.provider !== state.provider) return null;
  return hit;
}
function markPanelReorderItem(state) {
  if (!state || !state.rootId) return;
  requestAnimationFrame(function () {
    var root = document.getElementById(state.rootId);
    if (!root) return;
    root.classList.add('is-reordering-list');
    var attr = state.kind === 'playlist' ? 'data-playlist-index' : 'data-queue-index';
    var item = root.querySelector('[' + attr + '="' + state.currentIndex + '"]');
    if (item) item.classList.add('is-reordering');
  });
}
function bindLongPressPanelReorder() {
  if (document.__mineradioPanelReorderBound) return;
  document.__mineradioPanelReorderBound = true;
  document.addEventListener('click', function (e) {
    if (!panelReorderClickSuppressed()) return;
    if (!e.target || !e.target.closest || !e.target.closest('#queue-list,#mini-queue-list,#pl-list')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button !== 0) return;
    var hit = panelReorderHitFromTarget(e.target);
    if (!hit) return;
    cancelPanelReorder(false);
    panelReorderState = {
      timer: 0,
      active: false,
      pointerId: e.pointerId,
      kind: hit.kind,
      rootId: hit.rootId,
      provider: hit.provider,
      startX: e.clientX,
      startY: e.clientY,
      currentIndex: hit.index,
      suppressClickUntil: panelReorderState.suppressClickUntil || 0
    };
    hit.item.classList.add('reorder-pressing');
    panelReorderState.timer = setTimeout(function () {
      if (panelReorderState.pointerId !== e.pointerId) return;
      panelReorderState.active = true;
      document.body.classList.add('panel-reordering');
      markPanelReorderItem(panelReorderState);
      if (typeof markRenderInteraction === 'function') markRenderInteraction('panel-reorder', 900);
    }, reorderLongPressMs);
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (panelReorderState.pointerId == null || e.pointerId !== panelReorderState.pointerId) return;
    var dx = e.clientX - panelReorderState.startX;
    var dy = e.clientY - panelReorderState.startY;
    if (!panelReorderState.active) {
      if (Math.sqrt(dx * dx + dy * dy) > reorderMoveCancelPx) cancelPanelReorder(false);
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (typeof markRenderInteraction === 'function') markRenderInteraction('panel-reorder', 900);
    var hit = panelReorderHitAtPoint(e.clientX, e.clientY, panelReorderState);
    if (!hit || hit.index === panelReorderState.currentIndex) return;
    var moved = panelReorderState.kind === 'queue'
      ? (typeof moveQueueIndex === 'function' && moveQueueIndex(panelReorderState.currentIndex, hit.index, { rebuildShelf: true, renderPanel: true, persistSnapshot: false }))
      : (typeof moveUserPlaylistIndex === 'function' && moveUserPlaylistIndex(panelReorderState.currentIndex, hit.index, { rebuildShelf: true, renderPanel: true }));
    if (!moved) return;
    panelReorderState.currentIndex = hit.index;
    clearPanelReorderClasses();
    document.body.classList.add('panel-reordering');
    markPanelReorderItem(panelReorderState);
  }, { capture: true, passive: false });
  document.addEventListener('pointerup', function (e) {
    if (panelReorderState.pointerId == null || e.pointerId !== panelReorderState.pointerId) return;
    cancelPanelReorder(true);
  }, true);
  document.addEventListener('pointercancel', function (e) {
    if (panelReorderState.pointerId == null || e.pointerId !== panelReorderState.pointerId) return;
    cancelPanelReorder(false);
  }, true);
}
document.addEventListener('click', function (e) {
  if (miniQueueOpen && !(e.target && e.target.closest && e.target.closest('#bottom-bar'))) closeMiniQueue();
});
bindMiniQueueButton();
bindSmoothQueueScrolling();
if (typeof bindPlaylistPanelLazyRender === 'function') bindPlaylistPanelLazyRender();
bindLongPressPanelReorder();
if (typeof bindModalBackdropClose === 'function') bindModalBackdropClose();
function renderQueuePanel(opts) {
  opts = opts || {};
  var list = document.getElementById('queue-list');
  if (!list) return;
  list.innerHTML = playQueue.length
    ? pulseQueueRowsHtml(false)
    : '<div class="queue-empty">队列为空，可导入本地音乐</div>';
  bindPulseQueueRows(list);
  if (opts.animate && playQueue.length) {
    animateVisiblePanelList(list, '.queue-item', document.getElementById('playlist-panel'), '.queue-item.now');
  }
  renderMiniQueuePanel({ scrollCurrent: opts.scrollCurrent !== false && miniQueueOpen });
}
