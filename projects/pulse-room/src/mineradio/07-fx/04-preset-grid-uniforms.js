/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/07-fx/04-preset-grid-uniforms.js */
/* Modified for PULSE ROOM on 2026-07-30. */

function buildPresetGrid() {
  var grid = document.getElementById('preset-grid');
  if (!grid) return;
  grid.innerHTML = presetDisplayOrder.map(function (index) {
    var preset = presetMeta[index];
    return '<button class="preset-card" type="button" data-preset="' + index + '" aria-pressed="false">' +
      '<span class="pc-icon">' + presetIcons[index] + '</span>' +
      '<span class="pc-name">' + preset.name + '</span>' +
      '<span class="pc-desc">' + preset.desc + '</span>' +
      '</button>';
  }).join('');
  grid.querySelectorAll('[data-preset]').forEach(function (button) {
    button.addEventListener('click', function () { setPreset(Number(button.dataset.preset)); });
  });
  refreshPresetGrid();
}

function refreshPresetGrid() {
  document.querySelectorAll('.preset-card[data-preset]').forEach(function (element) {
    var active = Number(element.dataset.preset) === fx.preset;
    element.classList.toggle('active', active);
    element.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function triggerPresetParticleTransition(fromPreset, toPreset) {
  presetTransition.active = true;
  presetTransition.start = uniforms.uTime.value;
  presetTransition.duration = 0.26;
  presetTransition.from = fromPreset;
  presetTransition.to = toPreset;
  uniforms.uScatter.value = Math.max(uniforms.uScatter.value, fx.scatter + 0.12);
  uniforms.uBurstAmt.value = Math.max(uniforms.uBurstAmt.value, 0.15);
  camPunch = Math.max(camPunch, 0.12);
}

function tickPresetTransition() {
  if (!presetTransition.active) return;
  var raw = (uniforms.uTime.value - presetTransition.start) / presetTransition.duration;
  var progress = Math.max(0, Math.min(1, raw));
  var wave = Math.sin(progress * Math.PI);
  uniforms.uScatter.value = Math.max(uniforms.uScatter.value, fx.scatter + wave * 0.16);
  uniforms.uBurstAmt.value = Math.max(uniforms.uBurstAmt.value, wave * 0.15);
  uniforms.uPointScale.value = fx.point * (1 + wave * 0.048);
  if (raw >= 1) {
    presetTransition.active = false;
    syncFxUniforms();
  }
}

function setPreset(value, options) {
  options = options || {};
  var next = Math.max(0, Math.min(3, Math.round(Number(value) || 0)));
  var previous = fx.preset;
  fx.preset = next;
  uniforms.uPreset.value = next;
  refreshPresetGrid();
  if (previous !== next && !options.skipTransition) triggerPresetParticleTransition(previous, next);
  if (previous !== next && !options.preserveCamera && typeof applyPresetOrbitBaseline === 'function') {
    applyPresetOrbitBaseline(next);
  }
  playbackVisualPreset = next;
  if (!options.noSave) saveVisualSettings();
  if (previous !== next && !options.silent && typeof showToast === 'function') showToast('视觉预设 ' + presetMeta[next].name);
}

function syncFxUniforms() {
  uniforms.uPreset.value = fx.preset;
  uniforms.uIntensity.value = clampRange(fx.intensity, 0.5, 1.5);
  uniforms.uDepth.value = clampRange(fx.depth, 0.2, 0.8);
  uniforms.uPointScale.value = clampRange(fx.point, 0.55, 1.8);
  uniforms.uSpeed.value = clampRange(fx.speed, 0.4, 1.8);
  uniforms.uTwist.value = clampRange(fx.twist, 0, 1.4);
  uniforms.uColorBoost.value = clampRange(fx.color, 0.5, 1.6);
  uniforms.uScatter.value = clampRange(fx.scatter, 0, 0.8);
  uniforms.uCoverRes.value = normalizeCoverResolution(fx.coverResolution);
  uniforms.uBgFade.value = fx.bgFade;
  uniforms.uBloomStrength.value = fx.bloom ? fx.bloomStrength : 0;
  uniforms.uEdgeEnabled.value = fx.edge ? 1 : 0;
  if (uniforms.uTintColor) {
    var autoPalette = fx.visualTintMode !== 'custom' && typeof musicSpacePaletteState !== 'undefined' ? musicSpacePaletteState.current.primary : null;
    if (autoPalette) uniforms.uTintColor.value.copy(autoPalette);
    else uniforms.uTintColor.value.set(normalizeHexColor(fx.visualTintColor, fxDefaults.visualTintColor));
  }
  if (uniforms.uTintStrength) uniforms.uTintStrength.value = fx.visualTintMode === 'custom' ? 0.42 : (typeof musicSpacePaletteState !== 'undefined' ? 0.16 : 0);
  spatialHaze.visible = true;
  spectralRibbons.visible = true;
  driftingFlow.visible = true;
  transientGlints.visible = true;
}
