/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/05-playback/10-queue-actions.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function queueSong(song, opts) {
  opts = opts || {};
  var cloned = cloneSong(song);
  if (!cloned) return -1;
  var insertAt = playQueue.length;
  if (opts.position === 'next') {
    var key = queueItemKey(cloned);
    var existing = playQueue.findIndex(function (item) { return queueItemKey(item) === key; });
    if (existing === currentIdx) return currentIdx;
    if (existing >= 0) {
      cloned = playQueue.splice(existing, 1)[0];
      if (currentIdx >= 0 && existing < currentIdx) currentIdx -= 1;
    }
    insertAt = currentIdx >= 0
      ? Math.min(playQueue.length, currentIdx + 1)
      : playQueue.length;
    playQueue.splice(insertAt, 0, cloned);
  } else {
    playQueue.push(cloned);
    insertAt = playQueue.length - 1;
  }
  safeRenderQueuePanel('queue-song');
  safeShelfRebuild('queue-song');
  if (typeof refreshPulseClassicHome === 'function') refreshPulseClassicHome();
  if (typeof saveLastPlaybackSnapshot === 'function') saveLastPlaybackSnapshot(true, 'queue-song');
  return insertAt;
}

function queueSongNext(song) {
  return queueSong(song, { position: 'next' });
}

function queueSearchResult(i) {
  var song = playlist[i];
  if (!song) return;
  queueSongNext(song);
  showToast('下一首：' + (song.title || song.name || '本地曲目'));
}

function queueDetailSongNext(song) {
  if (!song) return;
  queueSongNext(song);
  showToast('下一首：' + (song.title || song.name || '本地曲目'));
}

function queueIndexNext(i) {
  i = Math.round(Number(i));
  if (!isFinite(i) || i < 0 || i >= playQueue.length) return;
  queueDetailSongNext(playQueue[i]);
}

function openQueueArtist(i) {
  var song = playQueue && playQueue[i];
  if (song) showToast(song.composer || song.artist || 'PULSE ROOM');
}

function moveQueueIndexToTop(idx) {
  idx = Math.round(Number(idx));
  if (!isFinite(idx) || idx < 0 || idx >= playQueue.length) return -1;
  if (idx === 0) return 0;
  var item = playQueue.splice(idx, 1)[0];
  playQueue.unshift(item);
  if (currentIdx === idx) currentIdx = 0;
  else if (currentIdx >= 0 && currentIdx < idx) currentIdx += 1;
  return 0;
}

function moveQueueIndex(fromIdx, toIdx, opts) {
  opts = opts || {};
  fromIdx = Math.round(Number(fromIdx));
  toIdx = Math.round(Number(toIdx));
  if (!isFinite(fromIdx) || !isFinite(toIdx) || fromIdx < 0 || fromIdx >= playQueue.length) return false;
  toIdx = Math.max(0, Math.min(playQueue.length - 1, toIdx));
  if (fromIdx === toIdx) return false;
  var currentSong = currentIdx >= 0 && currentIdx < playQueue.length ? playQueue[currentIdx] : null;
  var item = playQueue.splice(fromIdx, 1)[0];
  playQueue.splice(toIdx, 0, item);
  currentIdx = currentSong ? playQueue.indexOf(currentSong) : -1;
  if (opts.renderPanel !== false) {
    safeRenderQueuePanel('queue-reorder', { animate: false, scrollCurrent: false, deferWhenHidden: false });
  }
  if (opts.rebuildShelf !== false) safeShelfRebuild('queue-reorder', true);
  if (opts.persistSnapshot !== false && typeof saveLastPlaybackSnapshot === 'function') {
    saveLastPlaybackSnapshot(true, 'queue-reorder');
  }
  return true;
}

function playSearchResult(i) {
  var song = playlist[i];
  if (!song) return;
  var targetKey = queueItemKey(song);
  var matchIdx = playQueue.findIndex(function (item) { return queueItemKey(item) === targetKey; });
  if (matchIdx >= 0) currentIdx = moveQueueIndexToTop(matchIdx);
  else {
    playQueue.unshift(cloneSong(song));
    currentIdx = 0;
  }
  playQueueAt(currentIdx, { manual: true });
}
