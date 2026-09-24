/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/10-shell/05-startup-bindings.js */
/* Modified for PULSE ROOM on 2026-07-30. */
audio = document.getElementById('audio');
if (audio) {
  audio.volume = Math.max(0, Math.min(1, readSavedVolume()));
  audio.addEventListener('play', function () {
    playing = true;
    document.body.dataset.playing = 'true';
    setPlayIcon(true);
    if (typeof syncPulseClassicPlaybackUi === 'function') syncPulseClassicPlaybackUi(getPlaybackCurrentSeconds(), getPlaybackDurationSeconds());
    var state = document.getElementById('play-state');
    if (state) state.textContent = '正在播放';
  });
  audio.addEventListener('pause', function () {
    playing = false;
    document.body.dataset.playing = 'false';
    setPlayIcon(false);
    if (typeof syncPulseClassicPlaybackUi === 'function') syncPulseClassicPlaybackUi(getPlaybackCurrentSeconds(), getPlaybackDurationSeconds());
    var state = document.getElementById('play-state');
    if (state) state.textContent = audio.currentTime > 0 ? '已暂停' : '声场已就绪';
  });
}
bindSoundstageEntry();
bindSourceLicenseDialog();
bindPulseTransportControls();
bindVolumeControls();
bindPulseRuntimeStatus();
initPulseIdleChrome();
scheduleMainRendererViewportRefresh();
initializePulseShelf();
bindFxPanel();
bindPulseAppModeControls();
renderPulseClassicHome();
updatePulseAppMode(readPulseAppMode(), { persist: false, animate: false });

window.addEventListener('beforeunload', function () {
  if (typeof flushPersistentVisualState === 'function') flushPersistentVisualState();
});

function pulseClassicCatalogTracks() {
  var tracks = [];
  var seen = Object.create(null);
  function append(source) {
    if (!Array.isArray(source)) return;
    source.forEach(function (track) {
      if (!track) return;
      var key = String(track.id || track.localKey || track.name || track.title || '');
      if (!key || seen[key]) return;
      seen[key] = true;
      tracks.push(track);
    });
  }
  var catalog = window.PulseRuntime && PulseRuntime.catalog;
  append(catalog && catalog.all);
  append(playQueue);
  return tracks;
}

function pulseClassicTrackTitle(track) {
  return String(track && (track.title || track.name) || 'Untitled current');
}

function pulseClassicTrackArtist(track) {
  return String(track && (track.artist || track.composer) || 'Local artist');
}

function pulseClassicTrackCover(track) {
  if (!track) return '';
  if (typeof songCoverSrc === 'function') return songCoverSrc(track, 160) || '';
  return String(track.cover || track.customCover || '');
}
function pulseClassicFormatTime(value) {
  if (typeof pulseFormatTime === 'function') return pulseFormatTime(value);
  var seconds = Math.max(0, Number(value) || 0);
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

function updatePulseClassicSelection(trackId) {
  var id = String(trackId || '');
  document.querySelectorAll('[data-classic-track-id]').forEach(function (item) {
    var selected = item.getAttribute('data-classic-track-id') === id;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
  return true;
}

function updateControlTrackInfo(song) {
  if (!song) return false;
  var title = pulseClassicTrackTitle(song);
  var artist = pulseClassicTrackArtist(song);
  var titleNode = document.getElementById('control-title-text');
  var artistNode = document.getElementById('control-artist');
  if (titleNode) titleNode.textContent = title;
  if (artistNode) artistNode.textContent = artist;
  var heroTitle = document.getElementById('classic-hero-title');
  var heroArtist = document.getElementById('classic-hero-artist');
  var nowTitle = document.getElementById('classic-now-title');
  var nowArtist = document.getElementById('classic-now-artist');
  if (heroTitle) heroTitle.textContent = title;
  if (heroArtist) heroArtist.textContent = artist;
  if (nowTitle) nowTitle.textContent = title;
  if (nowArtist) nowArtist.textContent = artist;
  var spotlightTitle = document.getElementById('studio-spotlight-title');
  var spotlightArtist = document.getElementById('studio-spotlight-artist');
  var spotlightIndex = document.getElementById('studio-spotlight-index');
  if (spotlightTitle) spotlightTitle.textContent = title;
  if (spotlightArtist) spotlightArtist.textContent = artist;
  if (spotlightIndex) {
    var spotlightTracks = pulseClassicCatalogTracks();
    var spotlightAt = spotlightTracks.findIndex(function (track) { return String(track && track.id) === String(song.id); });
    spotlightIndex.textContent = String(Math.max(0, spotlightAt) + 1).padStart(2, '0');
  }
  updatePulseClassicSelection(song.id);
  setControlCoverSrc(pulseClassicTrackCover(song));
  return true;
}

function setControlCoverSrc(src) {
  var cover = document.getElementById('control-cover');
  var nowCover = document.getElementById('classic-now-cover');
  var turntable = document.getElementById('classic-turntable-disc');
  var thumb = document.getElementById('thumb-cover');
  var safeSrc = String(src || '');
  var coverGradient = 'linear-gradient(145deg, rgba(var(--pulse-cover-secondary-rgb), .34), rgba(var(--pulse-cover-primary-rgb), .14) 54%, rgba(4,8,11,.16)), url("' + safeSrc.replace(/"/g, '%22') + '")';
  [cover, nowCover, turntable].forEach(function (node) {
    if (!node) return;
    node.classList.toggle('cover-empty', !safeSrc);
    node.dataset.coverSrc = safeSrc;
    node.style.backgroundImage = safeSrc ? coverGradient : '';
  });
  if (thumb) {
    thumb.classList.toggle('cover-empty', !safeSrc);
    if (safeSrc) thumb.src = safeSrc;
    else thumb.removeAttribute('src');
  }
  return true;
}

function syncPulseClassicPlaybackUi(current, duration) {
  var state = document.getElementById('classic-now-state');
  var time = document.getElementById('classic-now-time');
  var heroPlay = document.getElementById('classic-hero-play');
  var isPlaying = !!(audio && !audio.paused && !audio.ended);
  if (state) state.textContent = isPlaying ? 'PLAYING' : (audio && audio.currentTime > 0 ? 'PAUSED' : 'READY');
  if (time) time.textContent = pulseClassicFormatTime(current) + ' / ' + pulseClassicFormatTime(duration);
  var nextNode = document.getElementById('classic-up-next');
  if (nextNode) {
    var nextSong = Array.isArray(playQueue) && playQueue.length && currentIdx >= 0
      ? playQueue[(currentIdx + 1) % playQueue.length]
      : null;
    nextNode.textContent = nextSong ? pulseClassicTrackTitle(nextSong) : 'Select a track to begin';
  }
  if (heroPlay) {
    heroPlay.querySelector('.classic-play-mark')?.replaceChildren(document.createTextNode(isPlaying ? 'Ⅱ' : '▶'));
    heroPlay.querySelector('span:last-child').textContent = isPlaying ? 'PAUSE CURRENT' : 'PLAY CURRENT';
  }
  return true;
}

function refreshPulseClassicHome() {
  if (typeof renderPulseClassicHome === 'function') renderPulseClassicHome();
  if (typeof syncPulseClassicPlaybackUi === 'function') syncPulseClassicPlaybackUi(getPlaybackCurrentSeconds(), getPlaybackDurationSeconds());
  return true;
}

function renderPulseClassicHome() {
  var list = document.getElementById('classic-track-list');
  if (!list) return false;
  var tracks = pulseClassicCatalogTracks();
  list.replaceChildren();
  tracks.forEach(function (track, index) {
    if (!track) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'classic-track-item';
    button.setAttribute('data-classic-track-id', String(track.id || index));
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', '播放 ' + pulseClassicTrackTitle(track));

    var number = document.createElement('span');
    number.className = 'classic-track-number';
    number.textContent = String(index + 1).padStart(2, '0');
    var cover = document.createElement('img');
    cover.className = 'classic-track-cover';
    var coverSrc = pulseClassicTrackCover(track);
    cover.alt = pulseClassicTrackTitle(track) + ' 封面';
    cover.loading = 'lazy';
    cover.decoding = 'async';
    var coverTone = [
      { glow: 'rgba(104, 220, 255, .72)', tint: 'linear-gradient(135deg, rgba(36, 155, 212, .48), rgba(7, 22, 38, .92))' },
      { glow: 'rgba(171, 145, 255, .72)', tint: 'linear-gradient(135deg, rgba(108, 78, 212, .52), rgba(18, 12, 44, .92))' },
      { glow: 'rgba(255, 173, 118, .72)', tint: 'linear-gradient(135deg, rgba(208, 104, 48, .56), rgba(48, 18, 12, .92))' },
      { glow: 'rgba(122, 190, 255, .72)', tint: 'linear-gradient(135deg, rgba(55, 133, 210, .5), rgba(10, 25, 48, .92))' }
    ][index % 4];
    var coverWrap = document.createElement('span');
    coverWrap.className = 'classic-track-cover-wrap';
    coverWrap.style.setProperty('--track-cover-glow', coverTone.glow);
    coverWrap.style.setProperty('--track-cover-tint', coverTone.tint);
    if (coverSrc) cover.src = coverSrc;
    coverWrap.appendChild(cover);
    var copy = document.createElement('span');
    copy.className = 'classic-track-copy';
    var title = document.createElement('span');
    title.className = 'classic-track-title';
    title.textContent = pulseClassicTrackTitle(track);
    var artist = document.createElement('span');
    artist.className = 'classic-track-artist';
    artist.textContent = pulseClassicTrackArtist(track);
    copy.append(title, artist);
    var duration = document.createElement('span');
    duration.className = 'classic-track-duration';
    duration.textContent = pulseClassicFormatTime(Number(track.duration || track.durationMs || 0) > 1000 ? Number(track.duration || track.durationMs) / 1000 : Number(track.duration || 0));
    button.append(number, coverWrap, copy, duration);
    button.addEventListener('click', function () {
      if (typeof selectPulseTrack !== 'function') return;
      selectPulseTrack(track.id, { origin: 'classic-home', userInitiated: true });
    });
    list.appendChild(button);
  });
  var count = document.getElementById('classic-library-count');
  if (count) count.textContent = String(tracks.length).padStart(2, '0') + ' TRACKS';
  var current = typeof currentCoverSong === 'function' ? currentCoverSong() : null;
  if (current) updateControlTrackInfo(current);
  return true;
}

var pulseModeTransitionTimer = 0;

function pulseModeTransitionTo(mode, options) {
  options = options || {};
  if (options.animate === false || !document.body) return false;
  var body = document.body;
  body.classList.remove('pulse-mode-transition', 'pulse-mode-to-studio', 'pulse-mode-to-classic');
  // Force a style boundary so repeated clicks still replay the transition.
  void body.offsetWidth;
  body.classList.add('pulse-mode-transition', mode === 'classic' ? 'pulse-mode-to-classic' : 'pulse-mode-to-studio');
  if (pulseModeTransitionTimer) clearTimeout(pulseModeTransitionTimer);
  pulseModeTransitionTimer = setTimeout(function () {
    pulseModeTransitionTimer = 0;
    body.classList.remove('pulse-mode-transition', 'pulse-mode-to-studio', 'pulse-mode-to-classic');
  }, 560);
  return true;
}

function updatePulseAppMode(mode, options) {
  options = options || {};
  pulseAppMode = normalizePulseAppMode(mode);
  if (options.persist !== false) savePulseAppMode(pulseAppMode);
  document.body.dataset.appMode = pulseAppMode;
  document.body.setAttribute('data-app-mode', pulseAppMode);
  document.body.classList.toggle('classic-route-open', pulseAppMode === 'classic');
  pulseModeTransitionTo(pulseAppMode, options);
  var classic = document.getElementById('classic-home');
  if (classic) {
    classic.setAttribute('aria-hidden', pulseAppMode === 'classic' ? 'false' : 'true');
    classic.inert = pulseAppMode !== 'classic';
  }
  var button = document.getElementById('view-mode-btn');
  var label = document.getElementById('view-mode-label');
  var classicActive = pulseAppMode === 'classic';
  if (label) label.textContent = classicActive ? 'STUDIO' : 'CLASSIC';
  if (button) {
    button.setAttribute('aria-pressed', classicActive ? 'true' : 'false');
    button.setAttribute('aria-label', classicActive ? '切换到沉浸声场' : '切换到经典播放器');
    button.title = classicActive ? '切换到沉浸声场' : '切换到经典播放器';
  }
  if (options.animate !== false && typeof showToast === 'function') {
    showToast(classicActive ? '已切换到经典播放器' : '已切换到沉浸声场');
  }
  return pulseAppMode;
}

function bindPulseAppModeControls() {
  var modeButton = document.getElementById('view-mode-btn');
  if (modeButton && modeButton.dataset.bound !== 'true') {
    modeButton.dataset.bound = 'true';
    modeButton.addEventListener('click', function () {
      updatePulseAppMode(pulseAppMode === 'classic' ? 'studio' : 'classic');
    });
  }
  var heroPlay = document.getElementById('classic-hero-play');
  if (heroPlay && heroPlay.dataset.bound !== 'true') {
    heroPlay.dataset.bound = 'true';
    heroPlay.addEventListener('click', function () { togglePulseTransportPlayback(); });
  }
  var backButton = document.getElementById('classic-back');
  if (backButton && backButton.dataset.bound !== 'true') {
    backButton.dataset.bound = 'true';
    backButton.addEventListener('click', function () {
      updatePulseAppMode('studio');
    });
  }
  var nextButton = document.getElementById('classic-next-btn');
  if (nextButton && nextButton.dataset.bound !== 'true') {
    nextButton.dataset.bound = 'true';
    nextButton.addEventListener('click', function () { selectPulseRelativeTrack(1); });
  }
  var queueButton = document.getElementById('classic-open-queue');
  if (queueButton && queueButton.dataset.bound !== 'true') {
    queueButton.dataset.bound = 'true';
    queueButton.addEventListener('click', function () {
      if (typeof togglePlaylistPanel === 'function') togglePlaylistPanel(true);
    });
  }
  document.querySelectorAll('[data-classic-nav]').forEach(function (navButton) {
    if (navButton.dataset.bound === 'true') return;
    navButton.dataset.bound = 'true';
    navButton.addEventListener('click', function () {
      document.querySelectorAll('[data-classic-nav]').forEach(function (item) { item.classList.remove('active'); });
      navButton.classList.add('active');
      var library = document.getElementById('classic-library');
      if (navButton.dataset.classicNav !== 'home' && library) library.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else document.getElementById('classic-home')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  return true;
}
