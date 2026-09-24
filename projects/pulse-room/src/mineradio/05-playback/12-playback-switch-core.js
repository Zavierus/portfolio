/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/05-playback/12-playback-switch-core.js */
/* Modified for PULSE ROOM on 2026-07-30. */
function pauseCurrentAudioForTrackSwitch() {
  playToggleBusy = false;
  if (!audio) return;
  try {
    audioFadeSerial++;
    clearAudioFadeTimers();
    audio.onended = null;
    audio.pause();
  } catch (e) { }
  playing = false;
  safePlaybackStep('track-switch-icon', function () {
    if (typeof setPlayIcon === 'function') setPlayIcon(false);
  });
  syncPlaybackStateFromAudioEvent('track-switch');
}

function syncPlaybackStateFromAudioEvent(reason) {
  if (typeof updatePlaybackResumePauseMarker === 'function') updatePlaybackResumePauseMarker(reason);
  var isPlaying = !!(audio && audio.src && !audio.paused && !audio.ended);
  playing = isPlaying;
  document.body.dataset.playing = isPlaying ? 'true' : 'false';
  safePlaybackStep('play-state-icon', function () {
    if (typeof setPlayIcon === 'function') setPlayIcon(isPlaying);
  });
  var state = document.getElementById('play-state');
  if (state) state.textContent = isPlaying ? '正在播放' : (audio && audio.currentTime > 0 ? '已暂停' : '声场已就绪');
  if (!isPlaying && typeof hideLoading === 'function') hideLoading();
  if (typeof forcePlaybackControlsInteractive === 'function') forcePlaybackControlsInteractive();
}

function isPlaybackRecursionError(err) {
  var msg = String((err && err.message) || err || '');
  return err instanceof RangeError || /maximum call stack size exceeded/i.test(msg);
}

function safePlaybackStep(label, fn) {
  try {
    return fn();
  } catch (err) {
    console.warn('[PULSE Playback]', label, err);
    return null;
  }
}

function playbackFailureToastText(err) {
  var message = String(err && err.message ? err.message : (err || '')).trim();
  var lower = message.toLowerCase();
  if (/notallowederror|user gesture|autoplay/.test(lower)) return '浏览器阻止了自动播放，请再次点击播放';
  if (/decode|media_err_decode|not supported/.test(lower)) return '音频解码失败，请重试或导入其他文件';
  if (/abort|superseded|interrupted/.test(lower)) return '切歌请求已被新的选择替代';
  if (/network|failed to fetch|timeout|http/.test(lower)) return '本地音频读取失败，请检查文件后重试';
  return '播放失败' + (message ? '：' + message : '');
}

function scheduleAudioResumePosition(media, seconds, token) {
  seconds = Math.max(0, Number(seconds) || 0);
  if (!media || seconds < 0.35) return;
  var applied = false;
  function applyResume() {
    if (applied || token !== trackSwitchToken || media !== audio) return;
    var duration = Number(media.duration) || 0;
    var target = duration > 0 ? Math.min(seconds, Math.max(0, duration - 0.45)) : seconds;
    try {
      media.currentTime = target;
      applied = true;
      if (typeof syncBeatMapPlaybackCursor === 'function') syncBeatMapPlaybackCursor(target, true);
      if (typeof updatePlaybackProgressUi === 'function') updatePlaybackProgressUi();
    } catch (e) { }
  }
  media.addEventListener('loadedmetadata', applyResume, { once: true });
  media.addEventListener('canplay', applyResume, { once: true });
  setTimeout(applyResume, 520);
  applyResume();
}
