/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/05-fx-panel-performance.js */
/* Modified for PULSE ROOM on 2026-07-30. */

function setRange(id, value) {
  var input = document.getElementById(id);
  if (!input) return;
  input.value = value;
  var output = input.parentElement && input.parentElement.querySelector('output');
  if (!output) return;
  if (id === 'fx-coverres') output.textContent = coverParticleCountLabel(value);
  else if (/angle/.test(id)) output.textContent = Math.round(Number(value) || 0) + '°';
  else output.textContent = Number(value).toFixed(2);
}
function updateToggleControl(id, active) {
  var button = document.getElementById(id);
  if (!button) return;
  button.classList.toggle('on', !!active);
  button.setAttribute('aria-pressed', active ? 'true' : 'false');
}

function updatePerformanceControls() {
  document.querySelectorAll('#performance-quality-seg [data-performance-quality]').forEach(function (button) {
    var active = button.getAttribute('data-performance-quality') === fx.performanceQuality;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  document.querySelectorAll('#foreground-fps-seg [data-foreground-fps]').forEach(function (button) {
    var active = normalizeForegroundFpsMode(button.getAttribute('data-foreground-fps')) === fx.foregroundFpsMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setPerformanceQualityMode(mode, silent) {
  fx.performanceQuality = normalizePerformanceQuality(mode);
  updatePerformanceControls();
  if (typeof updateMistColorControls === 'function') updateMistColorControls();
  if (typeof applyRendererPowerMode === 'function') applyRendererPowerMode();
  saveVisualSettings();
  if (!silent && typeof showToast === 'function') {
    var qualityLabel = { eco: '省电', balanced: '均衡', high: '高质', ultra: '极致' }[fx.performanceQuality] || fx.performanceQuality;
    showToast('渲染预算：' + qualityLabel);
  }
}

function setForegroundFpsMode(mode, silent) {
  fx.foregroundFpsMode = normalizeForegroundFpsMode(mode);
  updatePerformanceControls();
  if (typeof updateMistColorControls === 'function') updateMistColorControls();
  saveVisualSettings();
  if (typeof wakeMainLoopFromBackground === 'function') wakeMainLoopFromBackground();
  if (!silent && typeof showToast === 'function') {
    var fpsLabel = fx.foregroundFpsMode === 'vsync' ? '跟随显示器' : (fx.foregroundFpsMode === 'adaptive' ? '自动' : fx.foregroundFpsMode + ' 帧');
    showToast('前台帧率：' + fpsLabel);
  }
}

function updateFxInputs() {
  [
    ['fx-intensity', fx.intensity], ['fx-point', fx.point], ['fx-speed', fx.speed],
    ['fx-twist', fx.twist], ['fx-scatter', fx.scatter], ['fx-coverres', fx.coverResolution],
    ['fx-depth', fx.depth], ['fx-bloom', fx.bloomStrength],
    ['fx-shelfsize', fx.shelfSize], ['fx-shelfx', fx.shelfOffsetX], ['fx-shelfy', fx.shelfOffsetY],
    ['fx-shelfangle', fx.shelfAngleY], ['fx-shelfsummonopen', fx.shelfSummonOpenDuration],
    ['fx-shelfsummonclose', fx.shelfSummonCloseDuration], ['fx-bgopacity', fx.backgroundOpacity]
  ].forEach(function (entry) { setRange(entry[0], entry[1]); });
  updateToggleControl('t-bloom', fx.bloom);
  updateToggleControl('t-edge', fx.edge);
  refreshPresetGrid();
  updateUiAccentControls();
  updateVisualTintControls();
  updateCustomBackgroundControls();
  updatePerformanceControls();
  if (typeof updateMistColorControls === 'function') updateMistColorControls();
  if (typeof updateShelfControlUi === 'function') updateShelfControlUi();
  if (typeof updateImmersiveButton === 'function') updateImmersiveButton();
}

function updateHomeAudioVisual() {
  var wave = document.getElementById('home-wave-track');
  if (!wave || typeof emptyHomeActive === 'undefined' || !emptyHomeActive) return;
}
