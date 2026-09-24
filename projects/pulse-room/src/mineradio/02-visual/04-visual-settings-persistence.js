/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/02-visual/04-visual-settings-persistence.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var visualSettingsSaveTimer = null;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function normalizeHexColor(value, fallback) {
  var hex = String(value || '').trim();
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    hex = '#' + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2) + hex.charAt(3) + hex.charAt(3);
  }
  fallback = /^#[0-9a-f]{6}$/i.test(String(fallback || '')) ? String(fallback).toLowerCase() : '#a9b8c8';
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : fallback;
}

function hexToRgb(hex) {
  var normalized = normalizeHexColor(hex, '#000000').slice(1);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function readableInkForHex(hex) {
  var color = hexToRgb(hex || '#dcff39');
  var luminance = (color.r * 0.299 + color.g * 0.587 + color.b * 0.114) / 255;
  return luminance > 0.54 ? '#06100f' : '#f8fbff';
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h = 0;
  var s = 0;
  var l = (max + min) / 2;
  if (max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h, s: s, l: l };
}

function hslToRgb(h, s, l) {
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  var r;
  var g;
  var b;
  if (s === 0) r = g = b = l;
  else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbCss(color, alpha) {
  if (alpha == null) return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
}

function rgbToHexColor(r, g, b) {
  function part(value) {
    return Math.max(0, Math.min(255, Math.round(value || 0))).toString(16).padStart(2, '0');
  }
  return '#' + part(r) + part(g) + part(b);
}

function validSettingsNumber(value, fallback, min, max) {
  var number = Number(value);
  if (!isFinite(number) || number < min || number > max) return Number(fallback);
  return number;
}

function validSettingsEnum(value, fallback, pattern) {
  var normalized = String(value == null ? '' : value);
  return pattern.test(normalized) ? normalized : fallback;
}

function normalizeCoverResolution(value) {
  return validSettingsNumber(value, fxDefaults.coverResolution, 0.75, 1.55);
}

function normalizePerformanceBackgroundMode(value) {
  return value === 'keep' ? 'keep' : (value === 'auto' ? 'auto' : 'release');
}

function normalizePerformanceQuality(value) {
  return validSettingsEnum(value, fxDefaults.performanceQuality, /^(eco|balanced|high|ultra)$/);
}

function normalizeShelfCameraMode(value) {
  return value === 'static' ? 'static' : 'dynamic';
}

function normalizeShelfPresence(value) {
  return value === 'always' ? 'always' : 'auto';
}

function normalizeBackgroundMedia(value) {
  if (!value || typeof value !== 'object') return null;
  var type = value.type === 'video' ? 'video' : (value.type === 'image' ? 'image' : '');
  var src = String(value.src || '');
  if (!type || !/^(data:|blob:)/i.test(src)) return null;
  return { type: type, src: src, name: String(value.name || '').slice(0, 120), persistent: value.persistent === true };
}

function normalizePulseRoomSettings(raw) {
  raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  var next = Object.assign({}, fxDefaults);
  next.preset = Math.round(validSettingsNumber(raw.preset, fxDefaults.preset, 0, 3));
  next.intensity = validSettingsNumber(raw.intensity, fxDefaults.intensity, 0.2, 1.8);
  next.point = validSettingsNumber(raw.point, fxDefaults.point, 0.5, 2.2);
  next.speed = validSettingsNumber(raw.speed, fxDefaults.speed, 0.2, 2.5);
  next.twist = validSettingsNumber(raw.twist, fxDefaults.twist, 0, 2.2);
  next.color = validSettingsNumber(raw.color, fxDefaults.color, 0.4, 1.8);
  next.scatter = validSettingsNumber(raw.scatter, fxDefaults.scatter, 0, 1.4);
  next.bgFade = validSettingsNumber(raw.bgFade, fxDefaults.bgFade, 0, 1);
  next.coverResolution = normalizeCoverResolution(raw.coverResolution);
  next.depth = validSettingsNumber(raw.depth, fxDefaults.depth, 0, 1.2);
  next.bloom = typeof raw.bloom === 'boolean' ? raw.bloom : fxDefaults.bloom;
  next.bloomStrength = validSettingsNumber(raw.bloomStrength, fxDefaults.bloomStrength, 0, 1.6);
  next.edge = typeof raw.edge === 'boolean' ? raw.edge : fxDefaults.edge;
  next.cinema = typeof raw.cinema === 'boolean' ? raw.cinema : fxDefaults.cinema;
  next.cinemaShake = validSettingsNumber(raw.cinemaShake, fxDefaults.cinemaShake, 0, 1.2);

  next.visualTintMode = raw.visualTintMode === 'auto' ? 'auto' : 'custom';
  next.visualTintColor = normalizeHexColor(raw.visualTintColor, fxDefaults.visualTintColor);
  next.uiAccentColor = normalizeHexColor(raw.uiAccentColor, fxDefaults.uiAccentColor);
  next.backgroundColorMode = raw.backgroundColorMode === 'cover' ? 'cover' : 'custom';
  next.backgroundColor = normalizeHexColor(raw.backgroundColor, fxDefaults.backgroundColor);
  next.backgroundOpacity = validSettingsNumber(raw.backgroundOpacity, fxDefaults.backgroundOpacity, 0, 1);
  next.backgroundMedia = normalizeBackgroundMedia(raw.backgroundMedia);
  next.backgroundMediaCropX = validSettingsNumber(raw.backgroundMediaCropX, fxDefaults.backgroundMediaCropX, 0, 100);
  next.backgroundMediaCropY = validSettingsNumber(raw.backgroundMediaCropY, fxDefaults.backgroundMediaCropY, 0, 100);
  next.backgroundMediaZoom = validSettingsNumber(raw.backgroundMediaZoom, fxDefaults.backgroundMediaZoom, 1, 2.8);

  next.shelf = validSettingsEnum(raw.shelf, fxDefaults.shelf, /^(off|side|stage)$/);
  next.shelfPinnedOpen = raw.shelfPinnedOpen === true && next.shelf === 'side';
  next.shelfCameraMode = normalizeShelfCameraMode(raw.shelfCameraMode);
  next.shelfPresence = next.shelf === 'off' ? 'auto' : normalizeShelfPresence(raw.shelfPresence);
  next.shelfSize = validSettingsNumber(raw.shelfSize, fxDefaults.shelfSize, 0.65, 1.45);
  next.shelfOffsetX = validSettingsNumber(raw.shelfOffsetX, fxDefaults.shelfOffsetX, -1.2, 1.2);
  next.shelfOffsetY = validSettingsNumber(raw.shelfOffsetY, fxDefaults.shelfOffsetY, -0.9, 0.9);
  next.shelfOffsetZ = validSettingsNumber(raw.shelfOffsetZ, fxDefaults.shelfOffsetZ, -0.9, 0.9);
  next.shelfAngleY = validSettingsNumber(raw.shelfAngleY, fxDefaults.shelfAngleY, -30, 30);
  next.shelfAngleYManual = typeof raw.shelfAngleYManual === 'boolean' ? raw.shelfAngleYManual : fxDefaults.shelfAngleYManual;
  next.shelfOpacity = validSettingsNumber(raw.shelfOpacity, fxDefaults.shelfOpacity, 0.25, 1);
  next.shelfBgOpacity = validSettingsNumber(raw.shelfBgOpacity, fxDefaults.shelfBgOpacity, 0.25, 0.98);
  next.shelfAccentColor = normalizeHexColor(raw.shelfAccentColor, next.uiAccentColor);
  next.shelfDetailOffsetX = validSettingsNumber(raw.shelfDetailOffsetX, fxDefaults.shelfDetailOffsetX, -4.8, 4.8);
  next.shelfDetailOffsetY = validSettingsNumber(raw.shelfDetailOffsetY, fxDefaults.shelfDetailOffsetY, -3.6, 3.6);
  next.shelfDetailOffsetZ = validSettingsNumber(raw.shelfDetailOffsetZ, fxDefaults.shelfDetailOffsetZ, -3.6, 3.6);
  next.shelfDetailScale = validSettingsNumber(raw.shelfDetailScale, fxDefaults.shelfDetailScale, 0.72, 1.35);
  next.shelfDetailAngleX = validSettingsNumber(raw.shelfDetailAngleX, fxDefaults.shelfDetailAngleX, -24, 24);
  next.shelfDetailAngleY = validSettingsNumber(raw.shelfDetailAngleY, fxDefaults.shelfDetailAngleY, -28, 28);
  next.shelfDetailRowGap = validSettingsNumber(raw.shelfDetailRowGap, fxDefaults.shelfDetailRowGap, 0.72, 1.32);
  next.shelfDetailOpenDuration = validSettingsNumber(raw.shelfDetailOpenDuration, fxDefaults.shelfDetailOpenDuration, 0.12, 1.2);
  next.shelfDetailCloseDuration = validSettingsNumber(raw.shelfDetailCloseDuration, fxDefaults.shelfDetailCloseDuration, 0.08, 0.8);
  next.shelfDetailRowDuration = validSettingsNumber(raw.shelfDetailRowDuration, fxDefaults.shelfDetailRowDuration, 0.16, 1.6);
  next.shelfDetailIntroStrength = validSettingsNumber(raw.shelfDetailIntroStrength, fxDefaults.shelfDetailIntroStrength, 0, 1.8);
  next.shelfDetailParallax = validSettingsNumber(raw.shelfDetailParallax, fxDefaults.shelfDetailParallax, 0, 1.8);
  next.shelfSummonOpenDuration = validSettingsNumber(raw.shelfSummonOpenDuration, fxDefaults.shelfSummonOpenDuration, 0.08, 2);
  next.shelfSummonCloseDuration = validSettingsNumber(raw.shelfSummonCloseDuration, fxDefaults.shelfSummonCloseDuration, 0.08, 1.6);
  next.shelfSummonSlide = validSettingsNumber(raw.shelfSummonSlide, fxDefaults.shelfSummonSlide, 0, 4);
  next.shelfSummonStagger = validSettingsNumber(raw.shelfSummonStagger, fxDefaults.shelfSummonStagger, 0, 3);
  next.shelfSummonScale = validSettingsNumber(raw.shelfSummonScale, fxDefaults.shelfSummonScale, 0, 3);
  next.shelfSummonParallax = validSettingsNumber(raw.shelfSummonParallax, fxDefaults.shelfSummonParallax, 0, 2.5);
  next.shelfCameraEnterSpeed = validSettingsNumber(raw.shelfCameraEnterSpeed, fxDefaults.shelfCameraEnterSpeed, 0.2, 1.5);
  next.shelfCameraExitSpeed = validSettingsNumber(raw.shelfCameraExitSpeed, fxDefaults.shelfCameraExitSpeed, 0.2, 1.5);

  next.performanceQuality = normalizePerformanceQuality(raw.performanceQuality);
  next.foregroundFpsMode = normalizeForegroundFpsMode(raw.foregroundFpsMode);
  next.immersive = raw.immersive === true;
  next.cam = raw.cam === 'gesture' ? 'gesture' : 'off';
  return next;
}

var PULSE_ROOM_PERSISTED_SETTING_KEYS = Object.freeze([
  'preset', 'intensity', 'point', 'speed', 'twist', 'color', 'scatter', 'bgFade',
  'coverResolution', 'depth', 'bloom', 'bloomStrength', 'edge', 'cinema', 'cinemaShake',
  'visualTintMode', 'visualTintColor', 'uiAccentColor', 'backgroundColorMode',
  'backgroundColor', 'backgroundOpacity', 'backgroundMedia', 'backgroundMediaCropX',
  'backgroundMediaCropY', 'backgroundMediaZoom', 'shelf', 'shelfPinnedOpen',
  'shelfCameraMode', 'shelfPresence', 'shelfSize', 'shelfOffsetX', 'shelfOffsetY',
  'shelfOffsetZ', 'shelfAngleY', 'shelfAngleYManual', 'shelfOpacity', 'shelfBgOpacity',
  'shelfAccentColor', 'shelfDetailOffsetX', 'shelfDetailOffsetY', 'shelfDetailOffsetZ',
  'shelfDetailScale', 'shelfDetailAngleX', 'shelfDetailAngleY', 'shelfDetailRowGap',
  'shelfDetailOpenDuration', 'shelfDetailCloseDuration', 'shelfDetailRowDuration',
  'shelfDetailIntroStrength', 'shelfDetailParallax', 'shelfSummonOpenDuration',
  'shelfSummonCloseDuration', 'shelfSummonSlide', 'shelfSummonStagger',
  'shelfSummonScale', 'shelfSummonParallax', 'shelfCameraEnterSpeed',
  'shelfCameraExitSpeed', 'performanceQuality', 'foregroundFpsMode', 'immersive', 'cam'
]);

function parsePulseRoomSettingsText(text) {
  if (!text) return null;
  try {
    var value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch (error) {
    return null;
  }
}

function readCurrentFxAutosaveRaw() {
  try {
    return parsePulseRoomSettingsText(localStorage.getItem(PULSE_ROOM_SETTINGS_STORE_KEY)) || packagedDefaultVisualSettingsRaw();
  } catch (error) {
    return packagedDefaultVisualSettingsRaw();
  }
}

function serializableBackgroundMedia(media) {
  media = normalizeBackgroundMedia(media);
  if (!media || !media.persistent || !/^data:/i.test(media.src)) return null;
  return media;
}

function pulseRoomSettingsPayload(source) {
  var normalized = normalizePulseRoomSettings(source || fx);
  var payload = { schema: PULSE_ROOM_SETTINGS_SCHEMA, savedAt: Date.now() };
  PULSE_ROOM_PERSISTED_SETTING_KEYS.forEach(function (key) {
    payload[key] = key === 'backgroundMedia' ? serializableBackgroundMedia(normalized[key]) : normalized[key];
  });
  return payload;
}

function saveVisualSettings() {
  try {
    localStorage.setItem(PULSE_ROOM_SETTINGS_STORE_KEY, JSON.stringify(pulseRoomSettingsPayload(fx)));
  } catch (error) {
    // Large local videos remain session-only when browser storage is full.
  }
}

function scheduleVisualSettingsSave(delay) {
  if (visualSettingsSaveTimer) clearTimeout(visualSettingsSaveTimer);
  visualSettingsSaveTimer = setTimeout(function () {
    visualSettingsSaveTimer = null;
    saveVisualSettings();
  }, Math.max(80, Number(delay) || 220));
}

function flushVisualSettingsSave() {
  if (visualSettingsSaveTimer) clearTimeout(visualSettingsSaveTimer);
  visualSettingsSaveTimer = null;
  saveVisualSettings();
}

function coverParticleGridForResolution(value) {
  var grid = Math.round(118 * normalizeCoverResolution(value));
  grid = Math.max(88, Math.min(183, grid));
  return grid % 2 ? grid : grid + 1;
}

function coverParticleCountLabel(value) {
  var grid = coverParticleGridForResolution(value);
  return grid + 'x' + grid;
}

function coverTextureSizeForResolution(value) {
  value = normalizeCoverResolution(value);
  if (value >= 1.32) return 512;
  if (value >= 1.1) return 384;
  return 256;
}

function shelfDefaultAngleForCameraMode(mode) {
  return normalizeShelfCameraMode(mode) === 'static' ? -15 : 0;
}

function applyShelfCameraDefaultAngle(force) {
  if (!fx) return;
  fx.shelfCameraMode = normalizeShelfCameraMode(fx.shelfCameraMode);
  if (force || fx.shelfAngleYManual !== true) {
    fx.shelfAngleYManual = false;
    fx.shelfAngleY = shelfDefaultAngleForCameraMode(fx.shelfCameraMode);
  }
}

function normalizedShelfNumber(key, fallback, min, max) {
  var value = fx && fx[key] != null ? Number(fx[key]) : fallback;
  return isFinite(value) ? clampRange(value, min, max) : fallback;
}

function shelfDetailSettings() {
  return {
    x: normalizedShelfNumber('shelfDetailOffsetX', fxDefaults.shelfDetailOffsetX, -4.8, 4.8),
    y: normalizedShelfNumber('shelfDetailOffsetY', fxDefaults.shelfDetailOffsetY, -3.6, 3.6),
    z: normalizedShelfNumber('shelfDetailOffsetZ', fxDefaults.shelfDetailOffsetZ, -3.6, 3.6),
    scale: normalizedShelfNumber('shelfDetailScale', fxDefaults.shelfDetailScale, 0.72, 1.35),
    rx: normalizedShelfNumber('shelfDetailAngleX', fxDefaults.shelfDetailAngleX, -24, 24) * Math.PI / 180,
    ry: normalizedShelfNumber('shelfDetailAngleY', fxDefaults.shelfDetailAngleY, -28, 28) * Math.PI / 180,
    rowGap: normalizedShelfNumber('shelfDetailRowGap', fxDefaults.shelfDetailRowGap, 0.72, 1.32),
    openDuration: normalizedShelfNumber('shelfDetailOpenDuration', fxDefaults.shelfDetailOpenDuration, 0.12, 1.2),
    closeDuration: normalizedShelfNumber('shelfDetailCloseDuration', fxDefaults.shelfDetailCloseDuration, 0.08, 0.8),
    rowDuration: normalizedShelfNumber('shelfDetailRowDuration', fxDefaults.shelfDetailRowDuration, 0.16, 1.6),
    intro: normalizedShelfNumber('shelfDetailIntroStrength', fxDefaults.shelfDetailIntroStrength, 0, 1.8),
    parallax: normalizedShelfNumber('shelfDetailParallax', fxDefaults.shelfDetailParallax, 0, 1.8)
  };
}

function shelfSummonSettings() {
  return {
    openDuration: normalizedShelfNumber('shelfSummonOpenDuration', fxDefaults.shelfSummonOpenDuration, 0.08, 2),
    closeDuration: normalizedShelfNumber('shelfSummonCloseDuration', fxDefaults.shelfSummonCloseDuration, 0.08, 1.6),
    slide: normalizedShelfNumber('shelfSummonSlide', fxDefaults.shelfSummonSlide, 0, 4),
    stagger: normalizedShelfNumber('shelfSummonStagger', fxDefaults.shelfSummonStagger, 0, 3),
    scale: normalizedShelfNumber('shelfSummonScale', fxDefaults.shelfSummonScale, 0, 3),
    parallax: normalizedShelfNumber('shelfSummonParallax', fxDefaults.shelfSummonParallax, 0, 2.5),
    cameraEnterSpeed: normalizedShelfNumber('shelfCameraEnterSpeed', fxDefaults.shelfCameraEnterSpeed, 0.2, 1.5),
    cameraExitSpeed: normalizedShelfNumber('shelfCameraExitSpeed', fxDefaults.shelfCameraExitSpeed, 0.2, 1.5)
  };
}

function durationEaseFactor(seconds, dt) {
  seconds = Math.max(0.016, Number(seconds) || 0.016);
  dt = Math.max(1 / 240, Number(dt) || 1 / 60);
  return clampRange(1 - Math.exp(-dt / seconds), 0.001, 1);
}

function shelfSettings() {
  var angle = fx && fx.shelfAngleYManual === true
    ? normalizedShelfNumber('shelfAngleY', fxDefaults.shelfAngleY, -30, 30)
    : shelfDefaultAngleForCameraMode(fx && fx.shelfCameraMode);
  return {
    size: normalizedShelfNumber('shelfSize', fxDefaults.shelfSize, 0.65, 1.45),
    x: normalizedShelfNumber('shelfOffsetX', fxDefaults.shelfOffsetX, -1.2, 1.2),
    y: normalizedShelfNumber('shelfOffsetY', fxDefaults.shelfOffsetY, -0.9, 0.9),
    z: normalizedShelfNumber('shelfOffsetZ', fxDefaults.shelfOffsetZ, -0.9, 0.9),
    angle: angle * Math.PI / 180,
    opacity: normalizedShelfNumber('shelfOpacity', fxDefaults.shelfOpacity, 0.25, 1),
    bgOpacity: normalizedShelfNumber('shelfBgOpacity', fxDefaults.shelfBgOpacity, 0.25, 0.98),
    accent: normalizeHexColor((fx && fx.shelfAccentColor) || fxDefaults.shelfAccentColor, fxDefaults.shelfAccentColor)
  };
}

function shelfAlwaysVisible() {
  return !!(fx && normalizeShelfPresence(fx.shelfPresence) === 'always');
}

function shouldUseShelfDynamicCamera(type) {
  if (!/^shelf-/.test(String(type || ''))) return true;
  return !(fx && normalizeShelfCameraMode(fx.shelfCameraMode) === 'static');
}

function shelfAccentHex() {
  return normalizeHexColor((fx && fx.shelfAccentColor) || fxDefaults.shelfAccentColor, fxDefaults.shelfAccentColor);
}

function shelfAccentRgba(alpha, fallback) {
  var rgb = hexToRgb(shelfAccentHex());
  return rgb ? 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')' : fallback;
}
