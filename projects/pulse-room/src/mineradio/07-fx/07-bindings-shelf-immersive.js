/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/07-bindings-shelf-immersive.js */
/* Modified for PULSE ROOM on 2026-07-30. */

var RETAINED_PULSE_SETTING_IDS = Object.freeze([
  'preset-grid', 'ui-accent-picker', 'visual-tint-picker', 'visual-tint-seg',
  'mist-primary-picker', 'mist-secondary-picker', 'fx-mistdensity', 'bg-color-picker', 'fx-bgopacity', 'background-media-input', 'background-media-clear',
  'fx-intensity', 'fx-point', 'fx-speed', 'fx-twist', 'fx-scatter',
  'fx-coverres', 'fx-depth', 't-bloom', 'fx-bloom', 't-edge',
  'shelf-seg', 'shelf-camera-seg', 'shelf-presence-seg',
  'fx-shelfsize', 'fx-shelfx', 'fx-shelfy', 'fx-shelfangle',
  'fx-shelfsummonopen', 'fx-shelfsummonclose', 'performance-quality-seg',
  'foreground-fps-seg', 'immersive-settings-btn'
]);
var RETAINED_PULSE_SETTING_ID_SET = new Set(RETAINED_PULSE_SETTING_IDS);
var pulseFxPanelBound = false;

function retainedPulseSettingElement(id) {
  return RETAINED_PULSE_SETTING_ID_SET.has(id) ? document.getElementById(id) : null;
}

function bindRetainedRange(id, key, onInput) {
  var input = retainedPulseSettingElement(id);
  if (!input) return;
  input.addEventListener('input', function () {
    fx[key] = Number(input.value);
    setRange(id, fx[key]);
    if (onInput) onInput(fx[key]);
    syncFxUniforms();
    scheduleVisualSettingsSave(180);
  });
  input.addEventListener('change', saveVisualSettings);
}

function bindRetainedToggle(id, key) {
  var button = retainedPulseSettingElement(id);
  if (!button) return;
  button.addEventListener('click', function () {
    fx[key] = !fx[key];
    updateToggleControl(id, fx[key]);
    syncFxUniforms();
    saveVisualSettings();
  });
}

function bindFxPanel() {
  var panel = document.getElementById('fx-panel');
  if (!panel) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindFxPanel, { once: true });
    }
    return;
  }
  if (pulseFxPanelBound) return;
  pulseFxPanelBound = true;
  buildPresetGrid();

  [
    ['fx-intensity', 'intensity'], ['fx-point', 'point'], ['fx-speed', 'speed'],
    ['fx-twist', 'twist'], ['fx-scatter', 'scatter'], ['fx-depth', 'depth'],
    ['fx-bloom', 'bloomStrength'],
    ['fx-shelfsize', 'shelfSize'], ['fx-shelfx', 'shelfOffsetX'], ['fx-shelfy', 'shelfOffsetY'],
    ['fx-shelfangle', 'shelfAngleY'], ['fx-shelfsummonopen', 'shelfSummonOpenDuration'],
    ['fx-shelfsummonclose', 'shelfSummonCloseDuration']
  ].forEach(function (entry) {
    bindRetainedRange(entry[0], entry[1], function () {
      if (entry[1] === 'shelfAngleY') fx.shelfAngleYManual = true;
      if (/^shelf/.test(entry[1]) && shelfManager && shelfManager.refreshTheme) shelfManager.refreshTheme();
    });
  });
  bindRetainedRange('fx-coverres', 'coverResolution', function (value) {
    fx.coverResolution = normalizeCoverResolution(value);
    applyCoverParticleResolution(fx.coverResolution, { reload: true });
  });
  bindRetainedRange('fx-bgopacity', 'backgroundOpacity', setCustomBackgroundOpacity);
  bindRetainedToggle('t-bloom', 'bloom');
  bindRetainedToggle('t-edge', 'edge');

  var uiAccent = retainedPulseSettingElement('ui-accent-picker');
  if (uiAccent) uiAccent.addEventListener('input', function () { setUiAccentColor(uiAccent.value, true); });
  var visualTint = retainedPulseSettingElement('visual-tint-picker');
  if (visualTint) visualTint.addEventListener('input', function () { setVisualTintCustom(visualTint.value, true); });
  var mistPrimary = retainedPulseSettingElement('mist-primary-picker');
  if (mistPrimary) mistPrimary.addEventListener('input', function () { fx.mistColorMode = 'custom'; setMistPrimaryColor(mistPrimary.value, true); });
  var mistSecondary = retainedPulseSettingElement('mist-secondary-picker');
  if (mistSecondary) mistSecondary.addEventListener('input', function () { fx.mistColorMode = 'custom'; setMistSecondaryColor(mistSecondary.value, true); });
  var mistDensity = retainedPulseSettingElement('fx-mistdensity');
  if (mistDensity) mistDensity.addEventListener('input', function () { setMistDensity(mistDensity.value); var out = mistDensity.parentElement && mistDensity.parentElement.querySelector('output'); if (out) out.textContent = Number(mistDensity.value).toFixed(2); });
  var backgroundColor = retainedPulseSettingElement('bg-color-picker');
  if (backgroundColor) backgroundColor.addEventListener('input', function () { setCustomBackgroundColor(backgroundColor.value, true); });
  var mediaInput = retainedPulseSettingElement('background-media-input');
  if (mediaInput) mediaInput.addEventListener('change', function () {
    readBackgroundMediaFile(mediaInput.files && mediaInput.files[0]);
    mediaInput.value = '';
  });
  var clearMedia = retainedPulseSettingElement('background-media-clear');
  if (clearMedia) clearMedia.addEventListener('click', function () { clearCustomBackgroundImage(false); });

  document.querySelectorAll('#visual-tint-seg [data-visual-tint]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (button.getAttribute('data-visual-tint') === 'auto') setVisualTintAuto(false);
      else setVisualTintCustom(visualTint && visualTint.value, false);
    });
  });
  document.querySelectorAll('#shelf-seg [data-shelf]').forEach(function (button) {
    button.addEventListener('click', function () { setShelfMode(button.getAttribute('data-shelf')); });
  });
  document.querySelectorAll('#shelf-camera-seg [data-shelf-camera]').forEach(function (button) {
    button.addEventListener('click', function () { setShelfCameraMode(button.getAttribute('data-shelf-camera')); });
  });
  document.querySelectorAll('#shelf-presence-seg [data-shelf-presence]').forEach(function (button) {
    button.addEventListener('click', function () { setShelfPresence(button.getAttribute('data-shelf-presence')); });
  });
  document.querySelectorAll('#performance-quality-seg [data-performance-quality]').forEach(function (button) {
    button.addEventListener('click', function () { setPerformanceQualityMode(button.getAttribute('data-performance-quality')); });
  });
  document.querySelectorAll('#foreground-fps-seg [data-foreground-fps]').forEach(function (button) {
    button.addEventListener('click', function () { setForegroundFpsMode(button.getAttribute('data-foreground-fps')); });
  });
  document.querySelectorAll('#fx-panel-tabs [data-fx-tab]').forEach(function (button) {
    button.addEventListener('click', function () { setFxPanelTab(button.getAttribute('data-fx-tab')); });
  });

  var resetButton = document.querySelector('#fx-panel [data-action="reset-fx"]');
  if (resetButton) resetButton.addEventListener('click', resetFx);
  var fab = document.getElementById('fx-fab');
  if (fab) fab.addEventListener('click', function () { toggleFxPanel(); });
  var closeButton = document.getElementById('fx-panel-close');
  if (closeButton) closeButton.addEventListener('click', function () { toggleFxPanel(false); });
  var immersiveButton = document.getElementById('immersive-btn');
  if (immersiveButton) immersiveButton.addEventListener('click', toggleImmersiveMode);
  var immersiveSettingsButton = retainedPulseSettingElement('immersive-settings-btn');
  if (immersiveSettingsButton) immersiveSettingsButton.addEventListener('click', toggleImmersiveMode);

  updateFxInputs();
  syncFxUniforms();
  applyCoverParticleResolution(fx.coverResolution, { reload: true });
  setShelfMode(fx.shelf, { silent: true, noSave: true });
  bindHotkeySettings();
  if (fx.immersive) setTimeout(function () { setImmersiveMode(true, { noSave: true }); }, 0);
}

function setFxPanelTab(tab) {
  var next = /^(field|space|system)$/.test(String(tab || '')) ? tab : 'field';
  document.querySelectorAll('#fx-panel-tabs [data-fx-tab]').forEach(function (button) {
    var active = button.getAttribute('data-fx-tab') === next;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('#fx-panel [data-fx-page]').forEach(function (page) {
    page.classList.toggle('active', page.getAttribute('data-fx-page') === next);
  });
}

function toggleFxPanel(force) {
  var panel = document.getElementById('fx-panel');
  var fab = document.getElementById('fx-fab');
  if (!panel) return;
  var open = force == null ? !panel.classList.contains('show') : !!force;
  panel.classList.remove('peek', 'closing');
  setPulsePanelVisibility(panel, open, 'fx', 'show');
  if (open) {
    var closeButton = document.getElementById('fx-panel-close');
    requestAnimationFrame(function () {
      if (closeButton && panel.classList.contains('show')) closeButton.focus({ preventScroll: true });
    });
  }
}

function resetFx() {
  if (pulseBackgroundObjectUrl) URL.revokeObjectURL(pulseBackgroundObjectUrl);
  pulseBackgroundObjectUrl = '';
  fx = normalizePulseRoomSettings(fxDefaults);
  syncFxUniforms();
  applyCoverParticleResolution(fx.coverResolution, { reload: true });
  setPreset(fx.preset, { silent: true, preserveCamera: true, skipTransition: true, noSave: true });
  setShelfMode(fx.shelf, { silent: true, noSave: true });
  setImmersiveMode(false, { noSave: true });
  updateFxInputs();
  if (typeof applyRendererPowerMode === 'function') applyRendererPowerMode();
  saveVisualSettings();
  if (typeof showToast === 'function') showToast('视觉参数已恢复默认');
}

function updateShelfControlUi() {
  document.querySelectorAll('#shelf-seg [data-shelf]').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-shelf') === fx.shelf);
  });
  document.querySelectorAll('#shelf-camera-seg [data-shelf-camera]').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-shelf-camera') === fx.shelfCameraMode);
  });
  document.querySelectorAll('#shelf-presence-seg [data-shelf-presence]').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-shelf-presence') === fx.shelfPresence);
  });
}

function setShelfMode(mode, options) {
  options = options || {};
  fx.shelf = /^(off|side|stage)$/.test(String(mode || '')) ? String(mode) : fxDefaults.shelf;
  if (fx.shelf !== 'side') {
    fx.shelfPinnedOpen = false;
    if (typeof setShelfPinnedOpen === 'function') setShelfPinnedOpen(false, true, false);
  }
  if (shelfManager && shelfManager.setMode) shelfManager.setMode(fx.shelf);
  if (shelfManager && shelfManager.rebuild) shelfManager.rebuild(true);
  updateShelfControlUi();
  if (!options.noSave) saveVisualSettings();
  if (!options.silent && typeof showToast === 'function') {
    var shelfLabel = fx.shelf === 'side' ? '侧边' : (fx.shelf === 'stage' ? '舞台' : '隐藏');
    showToast('唱片架：' + shelfLabel);
  }
}

function setShelfCameraMode(mode) {
  fx.shelfCameraMode = normalizeShelfCameraMode(mode);
  applyShelfCameraDefaultAngle(true);
  updateShelfControlUi();
  setRange('fx-shelfangle', fx.shelfAngleY);
  if (typeof showToast === 'function') showToast('唱片架姿态：' + (fx.shelfCameraMode === 'static' ? '固定角度' : '跟随声场'));
  saveVisualSettings();
}

function setShelfPresence(mode) {
  fx.shelfPresence = normalizeShelfPresence(mode);
  if (fx.shelfPresence === 'auto' && typeof setShelfPinnedOpen === 'function') setShelfPinnedOpen(false, true, false);
  updateShelfControlUi();
  if (typeof showToast === 'function') showToast('唱片架显示：' + (fx.shelfPresence === 'always' ? '常驻显示' : '悬停出现'));
  saveVisualSettings();
}

function setShelfAccentColor(color, silent) {
  fx.shelfAccentColor = normalizeHexColor(color, fxDefaults.shelfAccentColor);
  if (shelfManager && shelfManager.refreshTheme) shelfManager.refreshTheme();
  saveVisualSettings();
  if (!silent && typeof showToast === 'function') showToast('唱片架强调色 ' + fx.shelfAccentColor.toUpperCase());
}

function updateImmersiveButton() {
  var label = immersiveMode ? '退出沉浸画面' : '进入沉浸画面';
  ['immersive-btn', 'immersive-settings-btn'].forEach(function (id) {
    var button = document.getElementById(id);
    if (!button) return;
    button.classList.toggle('active', immersiveMode);
    button.setAttribute('aria-pressed', immersiveMode ? 'true' : 'false');
    button.setAttribute('aria-label', label);
  });
  var status = document.getElementById('immersive-settings-status');
  if (status) status.textContent = immersiveMode ? '已开启' : '就绪';
}

function setImmersiveMode(on, options) {
  options = options || {};
  immersiveMode = !!on;
  fx.immersive = immersiveMode;
  document.body.classList.toggle('immersive-mode', immersiveMode);
  if (immersiveMode) {
    toggleFxPanel(false);
    if (typeof revealBottomControls === 'function') revealBottomControls(900);
  }
  updateImmersiveButton();
  if (typeof syncCursorAutoHideMode === 'function') syncCursorAutoHideMode();
  if (!options.noSave) saveVisualSettings();
}

function toggleImmersiveMode() {
  setImmersiveMode(!immersiveMode);
}

function setCamMode(mode) {
  fx.cam = mode === 'gesture' ? 'gesture' : 'off';
  saveVisualSettings();
}
