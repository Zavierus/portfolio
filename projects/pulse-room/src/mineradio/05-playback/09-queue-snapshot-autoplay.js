/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/05-playback/09-queue-snapshot-autoplay.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function cloneSong(song) {
  if (!song || typeof song !== 'object') return null;
  return Object.assign({}, song);
}

function queueItemKey(song) {
  if (!song) return '';
  if (song.type === 'local' || song.local === true || song.file || song.localKey) {
    return 'local:' + (song.localKey || song.id || song.name || song.title || '');
  }
  return 'pulse:' + (song.id || song.url || song.name || song.title || '');
}

function pulseCatalogTrack(id) {
  var catalog = window.PulseRuntime && window.PulseRuntime.catalog && Array.isArray(window.PulseRuntime.catalog.all)
    ? window.PulseRuntime.catalog.all
    : [];
  for (var i = 0; i < catalog.length; i++) {
    if (String(catalog[i].id) === String(id)) return cloneSong(catalog[i]);
  }
  return null;
}

function playbackRestoreSongSnapshot(song) {
  if (!song) return null;
  if (song.type === 'local' || song.local === true || song.file || song.localKey) {
    return {
      id: song.id || '',
      type: 'local',
      source: 'local',
      local: true,
      localKey: song.localKey || '',
      localMissing: true,
      name: song.name || song.title || '本地音乐',
      title: song.title || song.name || '本地音乐',
      artist: song.artist || '本地文件',
      duration: Math.max(0, Number(song.duration) || 0)
    };
  }
  var catalogSong = pulseCatalogTrack(song.id);
  if (!catalogSong) return null;
  catalogSong.name = catalogSong.name || catalogSong.title;
  return catalogSong;
}

function readLastPlaybackSnapshot() {
  try {
    var raw = localStorage.getItem(LAST_PLAYBACK_STORE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    return parsed && parsed.version === 2 ? parsed : null;
  } catch (e) {
    return null;
  }
}

function saveLastPlaybackSnapshot(force, reason) {
  var now = Date.now();
  if (!force && now - lastPlaybackSnapshotSavedAt < 1500) return;
  var song = playQueue && currentIdx >= 0 && currentIdx < playQueue.length
    ? playQueue[currentIdx]
    : currentLocalSong;
  if (!song) return;
  var queue = Array.isArray(playQueue)
    ? playQueue.slice(0, 16).map(playbackRestoreSongSnapshot).filter(Boolean)
    : [];
  var current = playbackRestoreSongSnapshot(song);
  if (!current) return;
  var payload = {
    version: 2,
    savedAt: now,
    reason: reason || '',
    current: current,
    currentIdx: Math.max(0, currentIdx),
    currentTime: audio && isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0,
    duration: audio && isFinite(audio.duration) ? Math.max(0, audio.duration) : (Number(song.duration) || 0),
    queue: queue
  };
  try {
    localStorage.setItem(LAST_PLAYBACK_STORE_KEY, JSON.stringify(payload));
    lastPlaybackSnapshotSavedAt = now;
    restoredLastPlaybackSnapshot = payload;
  } catch (e) { }
}

function applyRestoredPlaybackProgressUi(snapshot) {
  snapshot = snapshot || {};
  var current = Math.max(0, Number(snapshot.currentTime) || 0);
  var total = Math.max(current, Number(snapshot.duration) || 0);
  var currentNode = document.getElementById('current-time');
  var durationNode = document.getElementById('duration');
  var progressNode = document.getElementById('progress');
  if (currentNode && typeof formatProgramTime === 'function') currentNode.textContent = formatProgramTime(current);
  if (durationNode && typeof formatProgramTime === 'function') durationNode.textContent = formatProgramTime(total);
  if (progressNode) progressNode.value = total > 0 ? String(Math.round(current / total * 1000)) : '0';
}

function restoreLastPlaybackSnapshot() {
  var snapshot = readLastPlaybackSnapshot();
  if (!snapshot || !snapshot.current) return false;
  var current = playbackRestoreSongSnapshot(snapshot.current);
  if (!current) return false;
  if (current.localMissing) {
    currentLocalSong = current;
    playQueue = [];
    currentIdx = -1;
  } else {
    var restoredQueue = Array.isArray(snapshot.queue)
      ? snapshot.queue.map(playbackRestoreSongSnapshot).filter(Boolean)
      : [];
    if (!restoredQueue.length) restoredQueue = [current];
    var wantedKey = queueItemKey(current);
    var restoredIndex = restoredQueue.findIndex(function (song) { return queueItemKey(song) === wantedKey; });
    if (restoredIndex < 0) {
      restoredQueue.unshift(current);
      restoredIndex = 0;
    }
    playQueue = restoredQueue;
    currentIdx = restoredIndex;
    currentLocalSong = null;
  }
  restoredLastPlaybackSnapshot = snapshot;
  pendingPlaybackResumeAt = Math.max(0, Number(snapshot.currentTime) || 0);
  applyRestoredPlaybackProgressUi(snapshot);
  return true;
}

function canStartupAutoplayRestoredSnapshot() {
  return !!(Array.isArray(playQueue) && currentIdx >= 0 && currentIdx < playQueue.length);
}

function isStartupAutoplayPlaying() {
  return !!(audio && audio.src && !audio.paused && !audio.ended);
}

function clearStartupAutoplayRetryTimer() {
  if (!startupAutoplayRetryTimer) return;
  clearTimeout(startupAutoplayRetryTimer);
  startupAutoplayRetryTimer = null;
}

function finishStartupAutoplayJob(success) {
  clearStartupAutoplayRetryTimer();
  startupAutoplayAttempted = true;
  startupAutoplayAttemptCount = 0;
  return !!success;
}

function runStartupAutoplayAttempt(jobId) {
  if (jobId !== startupAutoplayJobId || !canStartupAutoplayRestoredSnapshot()) return false;
  startupAutoplayAttemptCount += 1;
  return Promise.resolve(playQueueAt(currentIdx, {
    manual: false,
    startupAutoplay: true,
    resumeAt: pendingPlaybackResumeAt
  })).then(finishStartupAutoplayJob, function () { return finishStartupAutoplayJob(false); });
}

function scheduleStartupAutoplayRetry(jobId, reason, delay) {
  clearStartupAutoplayRetryTimer();
  startupAutoplayRetryTimer = setTimeout(function () {
    startupAutoplayRetryTimer = null;
    runStartupAutoplayAttempt(jobId, reason || 'retry');
  }, Math.max(0, Number(delay) || 420));
  return true;
}

function scheduleStartupAutoplayFromSnapshot(reason) {
  if (!canStartupAutoplayRestoredSnapshot()) return false;
  startupAutoplayJobId += 1;
  return scheduleStartupAutoplayRetry(startupAutoplayJobId, reason || 'snapshot', 0);
}

function queueStartupAutoplayAfterHomeReveal(reason) {
  startupAutoplayHomeQueuedReason = reason || 'home-reveal';
  return true;
}

function flushStartupAutoplayAfterHomeReveal(reason, delay) {
  var queuedReason = startupAutoplayHomeQueuedReason;
  startupAutoplayHomeQueuedReason = '';
  return scheduleStartupAutoplayRetry(++startupAutoplayJobId, queuedReason || reason || 'home-revealed', delay || 0);
}

function markStartupHomeReadyForAutoplay(reason, delay) {
  startupHomeRevealReady = true;
  return flushStartupAutoplayAfterHomeReveal(reason, delay);
}
