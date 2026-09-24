/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/02-accent-background-controls.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var pulseBackgroundObjectUrl = '';

function defaultUiAccentColor() {
  return normalizeHexColor(fxDefaults.uiAccentColor, '#dcff39');
}

function applyUiAccentColor() {
  var color = normalizeHexColor(fx.uiAccentColor, defaultUiAccentColor());
  var rgb = hexToRgb(color);
  var root = document.documentElement;
  root.style.setProperty('--fc-accent', color);
  root.style.setProperty('--fc-accent-hov', color);
  root.style.setProperty('--fc-accent-rgb', rgb.r + ',' + rgb.g + ',' + rgb.b);
  root.style.setProperty('--home-accent', color);
  root.style.setProperty('--home-accent-rgb', rgb.r + ',' + rgb.g + ',' + rgb.b);
  root.style.setProperty('--glass-border', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.30)');
}

function updateUiAccentControls() {
  applyUiAccentColor();
  var color = normalizeHexColor(fx.uiAccentColor, defaultUiAccentColor());
  var picker = document.getElementById('ui-accent-picker');
  var value = document.getElementById('ui-accent-value');
  if (picker) picker.value = color;
  if (value) value.textContent = color.toUpperCase();
}

function setUiAccentColor(color, silent) {
  fx.uiAccentColor = normalizeHexColor(color, defaultUiAccentColor());
  fx.shelfAccentColor = fx.uiAccentColor;
  updateUiAccentControls();
  if (shelfManager && shelfManager.refreshTheme) shelfManager.refreshTheme();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('界面强调色 ' + fx.uiAccentColor.toUpperCase());
}

function updateVisualTintControls() {
  var color = normalizeHexColor(fx.visualTintColor, fxDefaults.visualTintColor);
  var picker = document.getElementById('visual-tint-picker');
  var value = document.getElementById('visual-tint-value');
  if (picker) picker.value = color;
  if (value) value.textContent = fx.visualTintMode === 'auto' ? 'COVER' : color.toUpperCase();
  document.querySelectorAll('#visual-tint-seg [data-visual-tint]').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-visual-tint') === fx.visualTintMode);
  });
}

function setVisualTintAuto(silent) {
  fx.visualTintMode = 'auto';
  updateVisualTintControls();
  syncFxUniforms();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('视觉着色跟随封面');
}

function setVisualTintCustom(color, silent) {
  fx.visualTintMode = 'custom';
  fx.visualTintColor = normalizeHexColor(color, fxDefaults.visualTintColor);
  updateVisualTintControls();
  syncFxUniforms();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('视觉着色 ' + fx.visualTintColor.toUpperCase());
}

function escapeCssUrl(value) {
  return String(value || '').replace(/(["\\\n\r])/g, '\\$1');
}

function applyCustomBackground() {
  var color = normalizeHexColor(fx.backgroundColor, fxDefaults.backgroundColor);
  var rgb = hexToRgb(color);
  var media = normalizeBackgroundMedia(fx.backgroundMedia);
  var opacity = clampRange(fx.backgroundOpacity, 0, 1);
  var layer = document.getElementById('custom-bg');
  var video = document.getElementById('custom-bg-video');
  var image = media && media.type === 'image' ? media.src : '';
  var hasVideo = !!(media && media.type === 'video');
  document.documentElement.style.setProperty('--custom-bg-color-rgb', rgb.r + ', ' + rgb.g + ', ' + rgb.b);
  document.body.classList.toggle('custom-background-override', fx.backgroundColorMode === 'custom' || !!media);
  document.body.classList.toggle('custom-background-flat', !media);
  document.body.classList.toggle('custom-background-video', hasVideo);
  if (layer) {
    layer.style.setProperty('--custom-bg-image', image ? 'url("' + escapeCssUrl(image) + '")' : 'none');
    layer.style.setProperty('--custom-bg-image-opacity', image ? opacity.toFixed(3) : '0');
    layer.style.setProperty('--custom-bg-video-opacity', hasVideo ? opacity.toFixed(3) : '0');
    layer.style.setProperty('--custom-bg-base-opacity', opacity.toFixed(3));
    layer.style.setProperty('--custom-bg-position-x', fx.backgroundMediaCropX.toFixed(1) + '%');
    layer.style.setProperty('--custom-bg-position-y', fx.backgroundMediaCropY.toFixed(1) + '%');
    layer.style.setProperty('--custom-bg-zoom', fx.backgroundMediaZoom.toFixed(3));
  }
  if (!video) return;
  if (!hasVideo) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    return;
  }
  if (video.getAttribute('src') !== media.src) {
    video.setAttribute('src', media.src);
    video.load();
  }
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  var playPromise = video.play();
  if (playPromise && playPromise.catch) playPromise.catch(function () {});
}

function updateCustomBackgroundControls() {
  var media = normalizeBackgroundMedia(fx.backgroundMedia);
  var color = normalizeHexColor(fx.backgroundColor, fxDefaults.backgroundColor);
  var picker = document.getElementById('bg-color-picker');
  var value = document.getElementById('bg-color-value');
  var opacity = document.getElementById('fx-bgopacity');
  var preview = document.getElementById('bg-media-preview');
  if (picker) picker.value = color;
  if (value) value.textContent = color.toUpperCase();
  if (opacity) opacity.value = fx.backgroundOpacity;
  if (preview) {
    preview.classList.toggle('empty', !media);
    preview.dataset.kind = media ? (media.type === 'video' ? 'VID' : 'IMG') : 'NONE';
    preview.style.backgroundImage = media && media.type === 'image' ? 'url("' + escapeCssUrl(media.src) + '")' : '';
  }
  applyCustomBackground();
}

function setCustomBackgroundColor(color, silent) {
  fx.backgroundColorMode = 'custom';
  fx.backgroundColor = normalizeHexColor(color, fxDefaults.backgroundColor);
  updateCustomBackgroundControls();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('背景色 ' + fx.backgroundColor.toUpperCase());
}

function setCustomBackgroundOpacity(value) {
  fx.backgroundOpacity = clampRange(Number(value), 0, 1);
  updateCustomBackgroundControls();
  scheduleVisualSettingsSave(160);
}

function clearCustomBackgroundImage(silent) {
  fx.backgroundMedia = null;
  if (pulseBackgroundObjectUrl) URL.revokeObjectURL(pulseBackgroundObjectUrl);
  pulseBackgroundObjectUrl = '';
  updateCustomBackgroundControls();
  saveVisualSettings();
  if (!silent && typeof showToast === 'function') showToast('已清除背景媒体');
}

function setCustomBackgroundMedia(media, silent) {
  var normalized = normalizeBackgroundMedia(media);
  if (!normalized) return;
  fx.backgroundMedia = normalized;
  updateCustomBackgroundControls();
  saveVisualSettings();
  if (!silent && typeof showToast === 'function') showToast(normalized.type === 'video' ? '已载入动态背景' : '已载入背景图像');
}

function readBackgroundMediaFile(file) {
  if (!file || !/^(image|video)\//i.test(file.type || '')) {
    if (typeof showToast === 'function') showToast('请选择图片或视频文件');
    return;
  }
  var type = /^video\//i.test(file.type) ? 'video' : 'image';
  var canPersist = type === 'image' && file.size <= 1200000;
  if (canPersist && typeof FileReader === 'function') {
    var reader = new FileReader();
    reader.onload = function () {
      setCustomBackgroundMedia({ type: type, src: String(reader.result || ''), name: file.name, persistent: true });
    };
    reader.readAsDataURL(file);
    return;
  }
  if (pulseBackgroundObjectUrl) URL.revokeObjectURL(pulseBackgroundObjectUrl);
  pulseBackgroundObjectUrl = URL.createObjectURL(file);
  setCustomBackgroundMedia({ type: type, src: pulseBackgroundObjectUrl, name: file.name, persistent: false });
}


function updateMistColorControls() {
  var primary = normalizeHexColor(fx.mistPrimaryColor, '#159b80');
  var secondary = normalizeHexColor(fx.mistSecondaryColor, '#6de7b0');
  var pPicker = document.getElementById('mist-primary-picker');
  var sPicker = document.getElementById('mist-secondary-picker');
  var pVal = document.getElementById('mist-primary-value');
  var sVal = document.getElementById('mist-secondary-value');
  var dSlider = document.getElementById('fx-mistdensity');
  if (pPicker) pPicker.value = primary;
  if (sPicker) sPicker.value = secondary;
  if (pVal) pVal.textContent = primary.toUpperCase();
  if (sVal) sVal.textContent = secondary.toUpperCase();
  if (dSlider) dSlider.value = fx.mistDensity || 1.0;
  applyMistColors();
}

function setMistPrimaryColor(color, silent) {
  fx.mistPrimaryColor = normalizeHexColor(color, '#159b80');
  updateMistColorControls();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('雾气主色 ' + fx.mistPrimaryColor.toUpperCase());
}

function setMistSecondaryColor(color, silent) {
  fx.mistSecondaryColor = normalizeHexColor(color, '#6de7b0');
  updateMistColorControls();
  scheduleVisualSettingsSave(120);
  if (!silent && typeof showToast === 'function') showToast('雾气副色 ' + fx.mistSecondaryColor.toUpperCase());
}

function setMistDensity(value) {
  fx.mistDensity = clampRange(Number(value), 0.2, 2.0);
  if (typeof spaceUniforms !== 'undefined' && spaceUniforms && spaceUniforms.uFluidOpacity) {
    spaceUniforms.uFluidOpacity.value = fx.mistDensity * 0.85;
  }
  scheduleVisualSettingsSave(160);
}

function applyMistColors() {
  if (typeof musicSpacePaletteState !== 'undefined' && musicSpacePaletteState && fx.mistColorMode === 'custom') {
    musicSpacePaletteState.target.primary.set(normalizeHexColor(fx.mistPrimaryColor, '#159b80'));
    musicSpacePaletteState.target.secondary.set(normalizeHexColor(fx.mistSecondaryColor, '#6de7b0'));
    musicSpacePaletteState.current.primary.set(normalizeHexColor(fx.mistPrimaryColor, '#159b80'));
    musicSpacePaletteState.current.secondary.set(normalizeHexColor(fx.mistSecondaryColor, '#6de7b0'));
    if (typeof spaceUniforms !== 'undefined' && spaceUniforms && spaceUniforms.uFluidPrimary) {
      spaceUniforms.uFluidPrimary.value.copy(musicSpacePaletteState.current.primary);
      spaceUniforms.uFluidSecondary.value.copy(musicSpacePaletteState.current.secondary);
    }
  }
}
