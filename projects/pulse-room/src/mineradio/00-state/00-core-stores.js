/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/00-state/00-core-stores.js */
/* Modified for PULSE ROOM on 2026-07-30. */
'use strict';

function clampRange(value, min, max) {
  var numeric = Number(value);
  var lower = Number(min);
  var upper = Number(max);
  if (!isFinite(numeric)) numeric = isFinite(lower) ? lower : 0;
  if (!isFinite(lower)) lower = numeric;
  if (!isFinite(upper)) upper = numeric;
  if (upper < lower) {
    var swap = lower;
    lower = upper;
    upper = swap;
  }
  return Math.min(upper, Math.max(lower, numeric));
}

function clamp01(value) {
  return clampRange(value, 0, 1);
}

function normalizePerformanceQuality(value) {
  var quality = String(value || '').trim().toLowerCase();
  return /^(eco|balanced|high|ultra)$/.test(quality) ? quality : 'high';
}

var audio = null;
var audioCtx = null;
var source = null;
var audioSourceMedia = null;
var analyser = null;
var beatAnalyser = null;
var gainNode = null;
var analysisSinkNode = null;
var audioReady = false;
var uiSfxCtx = null;
var lastShelfSelectSfxAt = 0;

var FFT_SIZE = 2048;
var frequencyData = new Uint8Array(FFT_SIZE / 2);
var timeDomainData = new Uint8Array(FFT_SIZE);
var BEAT_FFT_SIZE = 2048;
var beatFrequencyData = new Uint8Array(BEAT_FFT_SIZE / 2);
var beatTimeDomainData = new Uint8Array(BEAT_FFT_SIZE);
var bass = 0, mid = 0, treble = 0, audioEnergy = 0, beatPulse = 0, prevEnergy = 0;
var lyricSunEnergy = 0, lyricSunTarget = 0, lyricSunHold = 0, lyricSunAvg = 0, lyricSunPeak = 0.55;
var smoothBass = 0, smoothMid = 0, smoothTreb = 0, smoothEnergy = 0;
var bassPeak = 0.12, midPeak = 0.10, treblePeak = 0.08, energyPeak = 0.10;
var beatOnsetFlag = false;
var lastStrongDrop = 0;

var lyricsLines = [];
var lyricsTranslationLines = [];
var lyricsVisible = false;
var lyricsHasNativeKaraoke = false;
var lyricsTimingSource = 'none';
var lyricsTranslationSource = 'none';

var playlist = [];
var playQueue = [];
var currentIdx = -1;
var playing = false;
var playToggleBusy = false;
var volumeTween = null;
var trackSwitchToken = 0;
var currentLocalSong = null;
var currentTrack = null;

function currentCoverSong() {
  if (currentLocalSong) return currentLocalSong;
  if (currentIdx >= 0 && currentIdx < playQueue.length) return playQueue[currentIdx];
  return currentTrack || null;
}

var audioFadeTimer = null;
var audioElementFadeFrame = 0;
var audioFadeSerial = 0;
var AUDIO_FADE_STORE_KEY = 'pulse-room-audio-fade-v1';
var AUDIO_FADE_MIN_MS = 0;
var AUDIO_FADE_MAX_MS = 3000;
var AUDIO_FADE_IN_MS = 460;
var AUDIO_FADE_OUT_MS = 420;
var AUDIO_SILENCE_GAIN = 0.0001;
var audioFadeEnvelope = 1;
var playbackResumeRecovery = {
  serial: 0,
  pending: false,
  lastAttemptAt: 0,
  lastReason: '',
  pausedAt: 0,
  pausedSongKey: '',
  pausedSrc: '',
  pausedPosition: 0,
  timerIds: []
};
var albumGaplessState = {
  enabled: false,
  defaultEnabled: false,
  albumKey: '',
  disabledAlbumKey: '',
  context: null,
  preload: null,
  serial: 0,
  monitorTimer: 0,
  handoff: false
};
var PLAYBACK_RESUME_STALL_DELAYS = [1600, 3600];
var PLAYBACK_RESUME_LONG_PAUSE_MS = 8 * 60 * 1000;

var queueHydrationState = {
  token: 0,
  active: false,
  loading: false,
  title: '',
  total: 0,
  nextOffset: 0,
  hasMore: false,
  loaded: 0,
  error: '',
  promise: null,
  timer: 0,
  queueRef: null
};
var playlistCoverCache = {};

var CUSTOM_COVER_STORE_KEY = 'pulse-room-custom-covers-v1';
var CUSTOM_LYRIC_STORE_KEY = 'pulse-room-legacy-text-v1';
var CUSTOM_LYRIC_PREF_STORE_KEY = 'pulse-room-legacy-text-prefs-v1';
var CUSTOM_LYRIC_FONT_STORE_KEY = 'pulse-room-legacy-fonts-v1';
var CUSTOM_LYRIC_FONT_MAX_COUNT = 0;
var CUSTOM_LYRIC_FONT_MAX_BYTES = 0;
var LYRIC_LAYOUT_STORE_KEY = 'pulse-room-visual-layout-v1';
var CURRENT_FX_AUTOSAVE_STORE_KEY = 'pulse-room-settings-v3';
var CURRENT_FX_AUTOSAVE_SCHEMA = 3;
var VISUAL_PRESET_SCHEMA = 'pulse-room-worlds-v1';
var MAX_VISUAL_PRESET_INDEX = 3;
var SONIC_PRESET_INDEX = 0;
var LEGACY_REMOVED_VISUAL_PRESET_INDEX = -1;
function normalizeSavedVisualPresetIndex(value) {
  var preset = Number(value);
  if (!isFinite(preset)) preset = 0;
  return Math.max(0, Math.min(MAX_VISUAL_PRESET_INDEX, preset));
}

var PLAYBACK_QUALITY_STORE_KEY = 'pulse-room-playback-quality-v1';
var CONTROLS_AUTO_HIDE_STORE_KEY = 'pulse-room-controls-idle-v1';
var FREE_CAMERA_STORE_KEY = 'pulse-room-free-camera-v1';
var LAST_PLAYBACK_STORE_KEY = 'pulse-room-last-playback-v1';
var LOCAL_BEATMAP_STORE_KEY = 'pulse-room-local-beatmaps-v1';
var LOCAL_BEAT_PREF_STORE_KEY = 'pulse-room-local-beatmap-prefs-v1';
var PLAYLIST_PANEL_PIN_STORE_KEY = 'pulse-room-track-drawer-pinned-v1';
var LOCAL_BEAT_COMBOS = ['', 'downbeat', 'push', 'drop', 'rebound', 'accent'];

var diyPlayerMode = false;
var customCoverMap = {};
var customLyricMap = {};
var customLyricPrefs = {};
var customLyricFonts = {};
var localBeatMapCache = {};
var localBeatMapPrefs = {};
var playbackQualityPrefs = {};
var playbackQuality = 'standard';
var audioOutputDeviceId = '';
var audioOutputDevices = [];
var audioInputDevices = [];
var audioOutputMirrorDeviceIds = [];
var audioInputBridgeState = null;
var audioOutputMirrorElements = {};
var audioOutputMirrorRuntime = {};
var audioOutputMirrorSyncTimer = 0;
var playbackQualityRuntimeCaps = {};

var coverCropState = null;
var coverCropBound = false;
var lyricSourceMode = 'none';
var originalLyricsState = {
  lines: [],
  hasNativeKaraoke: false,
  timingSource: 'none',
  translationLines: [],
  translationSource: 'none'
};
var localBeatAnalysis = { song: null, audioUrl: '', mode: 'realtime', active: false, token: 0 };
var likedSongMap = {};
var likeBusyMap = {};
var likeStatusToken = 0;
var collectTargetSong = null;
var collectBusy = false;

var emptyHomeActive = false;
var homeForcedOpen = false;
var homeSuppressed = false;
var homeVisualPresetActive = false;
var homeVisualPrevPreset = 0;
var activeRadioContext = null;
var listenStatsState = {};
var listenSession = null;
var appPerfMarks = [];
