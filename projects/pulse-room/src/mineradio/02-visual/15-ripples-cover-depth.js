/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/02-visual/15-ripples-cover-depth.js */
/* Modified for PULSE ROOM on 2026-08-02. */

var musicSpaceHandoff = {
  duration: 0.8,
  serial: -1,
  progress: 1,
  previous: { low: 0, mid: 0, high: 0, energy: 0 },
  target: { low: 0, mid: 0, high: 0, energy: 0 }
};
var unifiedMusicSpaceState = {
  low: 0,
  mid: 0,
  high: 0,
  energy: 0,
  onset: 0,
  peak: 0,
  lastImpulseAt: -1,
  disposed: false
};
var musicSpaceAlphaTween = null;
var FLUID_RIPPLE_COUNT = 5;
var fluidRippleSlots = [];
var fluidRippleCursor = 0;
var fluidRippleSequence = 0;
var fluidSoundstage = null;
var fluidSoundstageHealthy = true;
var fluidPointerState = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};
var fluidPointerMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(pointer: coarse)')
  : null;

function pulseFogStepCount() {
  if (PulseRuntime.quality.reducedMotion || PulseRuntime.quality.id === 'mobile') return 5;
  if (PulseRuntime.quality.id === 'balanced') return 8;
  return 12;
}

function pulseFogEventUnit(seed) {
  var value = Math.sin((Number(seed) || 0) * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function fluidPointerIsEnabled(reducedMotion) {
  return !reducedMotion && !(fluidPointerMedia && fluidPointerMedia.matches);
}

var fluidPointerHalo = null;
var fluidPointerHaloFrame = 0;
var fluidPointerHaloPending = null;
function ensureFluidPointerHalo() {
  if (fluidPointerHalo || typeof document === 'undefined' || !document.documentElement) return fluidPointerHalo;
  fluidPointerHalo = document.createElement('div');
  fluidPointerHalo.id = 'fluid-pointer-halo';
  fluidPointerHalo.setAttribute('aria-hidden', 'true');
  fluidPointerHalo.style.cssText = 'position:fixed;left:0;top:0;width:160px;height:160px;margin:-80px 0 0 -80px;border-radius:50%;pointer-events:none;z-index:24;opacity:0;mix-blend-mode:screen;filter:blur(10px);background:radial-gradient(circle,rgba(var(--pulse-cover-contrast-rgb,255,255,255),.16) 0%,rgba(var(--pulse-cover-secondary-rgb,120,160,255),.06) 24%,transparent 62%);transition:opacity .22s ease;';
  document.documentElement.appendChild(fluidPointerHalo);
  return fluidPointerHalo;
}
function updateFluidPointerHalo(event) {
  if (!fluidPointerIsEnabled(false)) return;
  fluidPointerHaloPending = event;
  if (fluidPointerHaloFrame) return;
  fluidPointerHaloFrame = requestAnimationFrame(function () {
    fluidPointerHaloFrame = 0;
    var pointer = fluidPointerHaloPending;
    fluidPointerHaloPending = null;
    var halo = ensureFluidPointerHalo();
    if (!halo || !pointer) return;
    var strength = Math.min(0.16, 0.06 + Math.hypot(pointer.movementX || 0, pointer.movementY || 0) / 1200);
    halo.style.transform = 'translate3d(' + pointer.clientX + 'px,' + pointer.clientY + 'px,0)';
    halo.style.opacity = String(strength);
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', updateFluidPointerHalo, { passive: true });
  window.addEventListener('pointerleave', function () {
    if (fluidPointerHalo) fluidPointerHalo.style.opacity = '0';
  }, { passive: true });
}

// Directional, anisotropic event data keeps each audio impulse moving through
// the volume instead of expanding as a fixed circular surface ripple.

// Cover art is sampled once at a small resolution and eased into the shared
// uniforms. The fallback palettes keep bundled/demo tracks visually distinct
// even when a remote cover is unavailable or tainted by CORS.
var musicSpacePaletteState = {
  current: {
    primary: new THREE.Color(0x159b80),
    secondary: new THREE.Color(0x6de7b0),
    contrast: new THREE.Color(0xffbf69)
  },
  target: {
    primary: new THREE.Color(0x159b80),
    secondary: new THREE.Color(0x6de7b0),
    contrast: new THREE.Color(0xffbf69)
  },
  transitionMs: 800,
  transitionElapsed: 800,
  source: 'default',
  lastCss: { primary: '', secondary: '', contrast: '', source: '' }
};

var musicSpaceFallbackPalettes = {
  'kai-engel-anxiety': { primary: '#0f8f91', secondary: '#58e6c1', contrast: '#b8f36c' },
  'epsilon-not-other-side-of-the-wave': { primary: '#4d55c7', secondary: '#a18cff', contrast: '#f0a7ff' },
  'graham-bole-kirigami': { primary: '#c15b45', secondary: '#ffad69', contrast: '#ff6f9f' },
  'revolution-void-effects-of-elevation': { primary: '#3d8a62', secondary: '#b4d95e', contrast: '#5ea8ff' }
};

function musicSpacePaletteTrackKey(trackId) {
  return String(trackId || (typeof currentTrack !== 'undefined' && currentTrack && currentTrack.id) || 'pulse-room')
    .trim().toLowerCase();
}

function musicSpacePaletteFallback(trackId) {
  var key = musicSpacePaletteTrackKey(trackId);
  if (musicSpaceFallbackPalettes[key]) return musicSpaceFallbackPalettes[key];
  var keys = Object.keys(musicSpaceFallbackPalettes);
  var hash = 0;
  for (var i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return musicSpaceFallbackPalettes[keys[hash % keys.length]];
}

function musicSpacePaletteRgbFromHex(hex) {
  var normalized = typeof normalizeHexColor === 'function' ? normalizeHexColor(hex, '#159b80') : String(hex || '#159b80');
  var value = normalized.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16) || 0,
    g: parseInt(value.slice(2, 4), 16) || 0,
    b: parseInt(value.slice(4, 6), 16) || 0
  };
}

function musicSpacePaletteHex(color) {
  if (color && typeof color.getHexString === 'function') return '#' + color.getHexString();
  var r = Math.round(clampMusicSpaceValue(color.r, 0, 1) * 255);
  var g = Math.round(clampMusicSpaceValue(color.g, 0, 1) * 255);
  var b = Math.round(clampMusicSpaceValue(color.b, 0, 1) * 255);
  return typeof rgbToHexColor === 'function' ? rgbToHexColor(r, g, b) : '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
}

function musicSpacePaletteWriteCss() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  var root = document.documentElement;
  var current = musicSpacePaletteState.current;
  var primary = musicSpacePaletteHex(current.primary);
  var secondary = musicSpacePaletteHex(current.secondary);
  var contrast = musicSpacePaletteHex(current.contrast);
  if (musicSpacePaletteState.lastCss.primary === primary
    && musicSpacePaletteState.lastCss.secondary === secondary
    && musicSpacePaletteState.lastCss.contrast === contrast
    && musicSpacePaletteState.lastCss.source === musicSpacePaletteState.source) return;
  root.style.setProperty('--pulse-cover-primary', primary);
  root.style.setProperty('--pulse-cover-secondary', secondary);
  root.style.setProperty('--pulse-cover-contrast', contrast);
  var p = musicSpacePaletteRgbFromHex(primary);
  var s = musicSpacePaletteRgbFromHex(secondary);
  var c = musicSpacePaletteRgbFromHex(contrast);
  root.style.setProperty('--pulse-cover-primary-rgb', p.r + ',' + p.g + ',' + p.b);
  root.style.setProperty('--pulse-cover-secondary-rgb', s.r + ',' + s.g + ',' + s.b);
  root.style.setProperty('--pulse-cover-contrast-rgb', c.r + ',' + c.g + ',' + c.b);
  // Existing cover-picker code can consume this without taking ownership of
  // the renderer or starting another palette animation.
  window.currentCoverPalette = { primary: primary, secondary: secondary, contrast: contrast, accent: primary, source: musicSpacePaletteState.source };
  musicSpacePaletteState.lastCss.primary = primary;
  musicSpacePaletteState.lastCss.secondary = secondary;
  musicSpacePaletteState.lastCss.contrast = contrast;
  musicSpacePaletteState.lastCss.source = musicSpacePaletteState.source;
}

function musicSpacePaletteTone(rgb, lightnessMin, lightnessMax, saturationMin, saturationMax) {
  var hsl = typeof rgbToHsl === 'function' ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0.6, l: 0.5 };
  var saturation = Math.max(saturationMin, Math.min(saturationMax, Math.max(hsl.s, 0.36)));
  var lightness = Math.max(lightnessMin, Math.min(lightnessMax, hsl.l * 0.86 + 0.08));
  var tuned = typeof hslToRgb === 'function' ? hslToRgb(hsl.h, saturation, lightness) : rgb;
  return new THREE.Color(tuned.r / 255, tuned.g / 255, tuned.b / 255);
}

function musicSpacePaletteFromCanvas(canvas, trackId) {
  var fallback = musicSpacePaletteFallback(trackId);
  if (!canvas || typeof canvas.getContext !== 'function') return fallback;
  try {
    var context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context || !canvas.width || !canvas.height) return fallback;
    var image = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = image.data;
    var bins = [];
    for (var binIndex = 0; binIndex < 12; binIndex++) bins.push({ weight: 0, r: 0, g: 0, b: 0, h: binIndex / 12 });
    var step = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / 900)));
    for (var y = 0; y < canvas.height; y += step) {
      for (var x = 0; x < canvas.width; x += step) {
        var offset = (y * canvas.width + x) * 4;
        var alpha = data[offset + 3] / 255;
        if (alpha < 0.08) continue;
        var r = data[offset]; var g = data[offset + 1]; var b = data[offset + 2];
        var hsl = typeof rgbToHsl === 'function' ? rgbToHsl(r, g, b) : { h: 0, s: 0, l: (r + g + b) / 765 };
        if (hsl.l < 0.055 || hsl.s < 0.16) continue;
        var bin = bins[Math.min(11, Math.floor(hsl.h * 12))];
        var weight = alpha * hsl.s * (0.32 + hsl.l);
        bin.weight += weight;
        bin.r += r * weight; bin.g += g * weight; bin.b += b * weight;
      }
    }
    bins.sort(function (a, b) { return b.weight - a.weight; });
    if (!bins[0].weight) return fallback;
    var primaryRgb = { r: bins[0].r / bins[0].weight, g: bins[0].g / bins[0].weight, b: bins[0].b / bins[0].weight };
    var secondaryBin = bins.slice(1).find(function (entry) { return entry.weight > bins[0].weight * 0.12 && Math.abs(entry.h - bins[0].h) > 0.16; }) || bins[1];
    var secondaryRgb = secondaryBin && secondaryBin.weight
      ? { r: secondaryBin.r / secondaryBin.weight, g: secondaryBin.g / secondaryBin.weight, b: secondaryBin.b / secondaryBin.weight }
      : primaryRgb;
    var primaryHsl = typeof rgbToHsl === 'function' ? rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b) : { h: 0.48 };
    var contrastRgb = typeof hslToRgb === 'function' ? hslToRgb((primaryHsl.h + 0.48) % 1, 0.68, 0.66) : { r: 255, g: 191, b: 105 };
    var sampledPalette = {
      primary: musicSpacePaletteHex(musicSpacePaletteTone(primaryRgb, 0.24, 0.52, 0.42, 0.82)),
      secondary: musicSpacePaletteHex(musicSpacePaletteTone(secondaryRgb, 0.34, 0.66, 0.42, 0.86)),
      contrast: musicSpacePaletteHex(new THREE.Color(contrastRgb.r / 255, contrastRgb.g / 255, contrastRgb.b / 255))
    };
    var trackKey = musicSpacePaletteTrackKey(trackId);
    var trackPalette = musicSpaceFallbackPalettes[trackKey];
    if (trackPalette) {
      // The bundled art is intentionally restrained and often shares a dark
      // cyan base. Blend in the track signature only enough to keep adjacent
      // selections legible while the sampled cover still leads the result.
      var signatureMix = 0.52;
      sampledPalette.primary = musicSpacePaletteHex(new THREE.Color(sampledPalette.primary).lerp(new THREE.Color(trackPalette.primary), signatureMix));
      sampledPalette.secondary = musicSpacePaletteHex(new THREE.Color(sampledPalette.secondary).lerp(new THREE.Color(trackPalette.secondary), signatureMix));
      sampledPalette.contrast = musicSpacePaletteHex(new THREE.Color(sampledPalette.contrast).lerp(new THREE.Color(trackPalette.contrast), 0.44));
    }
    return sampledPalette;
  } catch (error) {
    if (window.PulseRuntime && PulseRuntime.status) PulseRuntime.status.report('cover-palette', { error: error });
    return fallback;
  }
}

function updateMusicSpacePaletteFromCanvas(canvas, trackId) {
  var palette = musicSpacePaletteFromCanvas(canvas, trackId);
  if (typeof fx !== 'undefined' && fx && fx.mistColorMode === 'custom') {
    musicSpacePaletteState.target.primary.set(normalizeHexColor(fx.mistPrimaryColor, '#159b80'));
    musicSpacePaletteState.target.secondary.set(normalizeHexColor(fx.mistSecondaryColor, '#6de7b0'));
  } else {
    musicSpacePaletteState.target.primary.set(palette.primary);
    musicSpacePaletteState.target.secondary.set(palette.secondary);
  }
  musicSpacePaletteState.target.contrast.set(palette.contrast);
  musicSpacePaletteState.transitionElapsed = 0;
  musicSpacePaletteState.source = canvas ? 'cover' : 'track-fallback';
  musicSpacePaletteWriteCss();
  return palette;
}
function _unused_updateMusicSpacePaletteFromCanvas(canvas, trackId) {
  var palette = musicSpacePaletteFromCanvas(canvas, trackId);
  musicSpacePaletteState.target.primary.set(palette.primary);
  musicSpacePaletteState.target.secondary.set(palette.secondary);
  musicSpacePaletteState.target.contrast.set(palette.contrast);
  musicSpacePaletteState.transitionElapsed = 0;
  musicSpacePaletteState.source = canvas ? 'cover' : 'track-fallback';
  musicSpacePaletteWriteCss();
  return palette;
}

function updateMusicSpacePalette(dt) {
  if (typeof fx !== 'undefined' && fx && fx.mistColorMode === 'custom') {
    musicSpacePaletteState.target.primary.set(normalizeHexColor(fx.mistPrimaryColor, '#159b80'));
    musicSpacePaletteState.target.secondary.set(normalizeHexColor(fx.mistSecondaryColor, '#6de7b0'));
  }
  var seconds = Math.max(0, Number(dt) || 0);
  var blend = 1 - Math.exp(-seconds / 0.24);
  if (fx && fx.mistColorMode === 'custom') { musicSpacePaletteState.current.primary.copy(musicSpacePaletteState.target.primary); musicSpacePaletteState.current.secondary.copy(musicSpacePaletteState.target.secondary); } else { musicSpacePaletteState.current.primary.lerp(musicSpacePaletteState.target.primary, blend); musicSpacePaletteState.current.secondary.lerp(musicSpacePaletteState.target.secondary, blend); }
  musicSpacePaletteState.current.secondary.lerp(musicSpacePaletteState.target.secondary, blend);
  musicSpacePaletteState.current.contrast.lerp(musicSpacePaletteState.target.contrast, blend);
  musicSpacePaletteState.transitionElapsed = Math.min(musicSpacePaletteState.transitionMs, musicSpacePaletteState.transitionElapsed + seconds * 1000);
  if (typeof spaceUniforms !== 'undefined' && spaceUniforms && spaceUniforms.uFluidPrimary) {
    spaceUniforms.uFluidPrimary.value.copy(musicSpacePaletteState.current.primary);
    spaceUniforms.uFluidSecondary.value.copy(musicSpacePaletteState.current.secondary);
    spaceUniforms.uFluidContrast.value.copy(musicSpacePaletteState.current.contrast);
    if (typeof fx !== 'undefined' && fx.visualTintMode !== 'custom' && spaceUniforms.uTintColor) {
      spaceUniforms.uTintColor.value.copy(musicSpacePaletteState.current.primary);
      spaceUniforms.uTintStrength.value = 0.16;
    }
  }
  musicSpacePaletteWriteCss();
  return musicSpacePaletteState.current;
}

musicSpacePaletteWriteCss();

for (var fluidRippleIndex = 0; fluidRippleIndex < FLUID_RIPPLE_COUNT; fluidRippleIndex++) {
  fluidRippleSlots.push({
    x: 0.5,
    y: 0.5,
    life: 0,
    radius: 0,
    strength: 0,
    directionX: 1,
    directionY: 0,
    stretch: 1,
    seed: fluidRippleIndex / FLUID_RIPPLE_COUNT
  });
}

function createFluidSoundstage(sharedUniforms) {
  var fogSteps = pulseFogStepCount();
  var geometry = registerMusicSpaceResource(new THREE.PlaneGeometry(2, 2, 1, 1));
  geometry.userData.layer = 'fluidSoundstage';
  geometry.userData.count = 4;
  var material = registerMusicSpaceResource(new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    defines: { PULSE_FOG_STEPS: fogSteps },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    vertexShader: [
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = uv;',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'precision highp float;',
      'uniform float uTime;',
      'uniform float uBass;',
      'uniform float uMid;',
      'uniform float uTreble;',
      'uniform float uBeat;',
      'uniform float uEnergy;',
      'uniform float uFlow;',
      'uniform float uShear;',
      'uniform float uShimmer;',
      'uniform float uFluidOpacity;',
      'uniform float uReducedMotion;',
      'uniform vec3 uFluidPrimary;',
      'uniform vec3 uFluidSecondary;',
      'uniform vec3 uFluidContrast;',
      'uniform vec2 uFluidResolution;',
      'uniform vec2 uFluidPointer;',
      'uniform vec4 uRippleData[5];',
      'uniform vec4 uRippleFlowData[5];',
      'varying vec2 vUv;',
      'float hash31(vec3 p){',
      '  p = fract(p * 0.1031);',
      '  p += dot(p, p.yzx + 33.33);',
      '  return fract((p.x + p.y) * p.z);',
      '}',
      'float noise3(vec3 p){',
      '  vec3 i = floor(p);',
      '  vec3 f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  float n000 = hash31(i);',
      '  float n100 = hash31(i + vec3(1.0, 0.0, 0.0));',
      '  float n010 = hash31(i + vec3(0.0, 1.0, 0.0));',
      '  float n110 = hash31(i + vec3(1.0, 1.0, 0.0));',
      '  float n001 = hash31(i + vec3(0.0, 0.0, 1.0));',
      '  float n101 = hash31(i + vec3(1.0, 0.0, 1.0));',
      '  float n011 = hash31(i + vec3(0.0, 1.0, 1.0));',
      '  float n111 = hash31(i + vec3(1.0, 1.0, 1.0));',
      '  float nx00 = mix(n000, n100, f.x);',
      '  float nx10 = mix(n010, n110, f.x);',
      '  float nx01 = mix(n001, n101, f.x);',
      '  float nx11 = mix(n011, n111, f.x);',
      '  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);',
      '}',
      'float fogFbm(vec3 p){',
      '  float value = noise3(p) * 0.56;',
      '  value += noise3(p * 2.03 + vec3(7.1, -3.4, 1.8)) * 0.29;',
      '  value += noise3(p * 4.11 + vec3(-2.7, 6.3, 4.5)) * 0.15;',
      '  return value;',
      '}',
      'vec2 curlFlow(vec3 p, float t){',
      '  float a = noise3(p + vec3(0.0, 0.0, t));',
      '  float b = noise3(p.yzx * 1.17 + vec3(5.2, 1.7, -t * 0.83));',
      '  return vec2(a - b, b - (a * 0.72 + 0.14));',
      '}',
      'float densityErosion(float density, float detail){',
      '  float porousEdge = smoothstep(0.22, 0.76, detail);',
      '  return smoothstep(0.07, 0.58, density - (1.0 - porousEdge) * 0.13);',
      '}',
      'float fogDensity(vec3 p, float t){',
      '  vec2 current = curlFlow(p * 0.72, t * 0.18);',
      '  p.xy += current * (0.72 + uFlow * 0.5);',
      '  p.x += t * (0.075 + uMid * 0.025);',
      '  p.y -= t * 0.031;',
      '  float broad = noise3(p * 0.62 + vec3(1.7, 4.1, 0.2));',
      '  float body = noise3(p * 1.31 + vec3(-3.4, 0.8, t * 0.08));',
      '  float detail = noise3(p * 2.83 + vec3(current * 1.6, -t * 0.13));',
      '  float density = broad * 0.62 + body * 0.38 + uBass * 0.12 - 0.25;',
      '  density += smoothstep(0.58, 0.88, detail) * (0.16 + uMid * 0.11);',
      '  return densityErosion(density, detail);',
      '}',
      'float pulseEventDensity(vec2 uv, float depth){',
      '  float eventDensity = 0.0;',
      '  for (int i = 0; i < 5; i++){',
      '    vec4 ripple = uRippleData[i];',
      '    vec4 flowData = uRippleFlowData[i];',
      '    vec2 direction = normalize(flowData.xy + vec2(0.0001, 0.0));',
      '    vec2 center = ripple.xy + direction * ripple.z * (0.09 + flowData.w * 0.05);',
      '    vec2 delta = uv - center;',
      '    float along = dot(delta, direction);',
      '    float across = dot(delta, vec2(-direction.y, direction.x));',
      '    float spread = 0.045 + ripple.z * (0.22 + flowData.z * 0.04);',
      '    float filament = exp(-(along * along / max(0.006, spread * spread * flowData.z) + across * across / max(0.002, spread * spread * 0.32)));',
      '    float ragged = 0.62 + 0.38 * noise3(vec3(delta * (9.0 + flowData.w * 5.0), depth * 3.4 + flowData.w * 7.0));',
      '    float depthSlice = exp(-abs(depth - (0.22 + flowData.w * 0.58)) * 4.4);',
      '    float pairGate = smoothstep(0.52, 0.84, ripple.w);',
      '    vec2 pairedCenter = vec2(1.0 - center.x + direction.y * 0.025, center.y + direction.x * 0.018);',
      '    vec2 pairedDelta = uv - pairedCenter;',
      '    float pairedAlong = dot(pairedDelta, vec2(-direction.x, direction.y));',
      '    float pairedAcross = dot(pairedDelta, vec2(direction.y, direction.x));',
      '    float paired = exp(-(pairedAlong * pairedAlong / max(0.007, spread * spread * (flowData.z + 0.35)) + pairedAcross * pairedAcross / max(0.002, spread * spread * 0.38)));',
      '    eventDensity += (filament * ragged + paired * pairGate * 0.58) * depthSlice * ripple.w;',
      '  }',
      '  return clamp(eventDensity, 0.0, 1.35);',
      '}',
      'void main(){',
      '  float motion = mix(1.0, 0.24, uReducedMotion);',
      '  float t = uTime * (0.34 + uFlow * 0.36) * motion;',
      '  float aspect = uFluidResolution.x / max(1.0, uFluidResolution.y);',
      '  vec2 screen = (vUv - 0.5) * vec2(aspect, 1.0);',
      '  screen += uFluidPointer * 0.022;',
      '  float pointerMagnitude = length(uFluidPointer);',
      '  vec2 pointerDirection = uFluidPointer / max(pointerMagnitude, 0.001);',
      '  float macroTime = t * 0.18;',
      '  vec2 macroFlow = curlFlow(vec3(screen * 0.72, 1.7), macroTime);',
      '  float pointerWake = exp(-length((screen - uFluidPointer * 0.40) * vec2(1.08, 1.28)) * 7.4) * pointerMagnitude;',
      '  macroFlow += pointerDirection.yx * pointerWake * 0.06;',
      '  float pointerBloom = exp(-length((screen - uFluidPointer * 0.46) * vec2(0.92, 1.10)) * 6.6) * smoothstep(0.018, 0.12, pointerMagnitude);',
      '  vec2 macroUvA = screen * 2.65 + macroFlow * 0.58 + vec2(macroTime * 0.42, -macroTime * 0.31);',
      '  vec2 macroUvB = screen * 4.10 - macroFlow.yx * 0.44 + vec2(-macroTime * 0.27, macroTime * 0.36);',
      '  float islandA = smoothstep(0.47, 0.69, fogFbm(vec3(macroUvA, 1.3 + macroTime * 0.22)));',
      '  float islandB = smoothstep(0.54, 0.74, fogFbm(vec3(macroUvB + vec2(4.2, -2.1), 4.1 - macroTime * 0.18)));',
      '  float macroCloud = clamp(islandA * 0.86 + islandB * 0.52, 0.0, 1.0);',
      '  float veilDetail = fogFbm(vec3(screen * 6.2 + macroFlow * 1.35, 6.4 + macroTime * 0.45));',
      '  vec2 wispUv = screen * vec2(3.3, 8.4) + macroFlow * vec2(1.8, 3.0) + vec2(-macroTime * 0.45, macroTime * 0.72);',
      '  float wispNoise = fogFbm(vec3(wispUv, 8.7 + macroTime * 0.60));',
      '  float filament = 1.0 - smoothstep(0.10, 0.34, abs(wispNoise - 0.5));',
      '  float edgeBreakup = smoothstep(0.28, 0.72, veilDetail + filament * 0.16);',
      '  float wispyMask = macroCloud * edgeBreakup * (0.46 + filament * 0.54);',
      '  vec3 primary = clamp(uFluidPrimary, vec3(0.0), vec3(1.0));',
      '  vec3 secondary = clamp(uFluidSecondary, vec3(0.0), vec3(1.0));',
      '  vec3 contrast = clamp(uFluidContrast, vec3(0.0), vec3(1.0));',
      '  vec3 radiance = vec3(0.0);',
      '  float transmittance = 1.0;',
      '  float accumulated = 0.0;',
      '  for (int i = 0; i < PULSE_FOG_STEPS; i++){',
      '    float depth = (float(i) + 0.5) / float(PULSE_FOG_STEPS);',
      '    vec3 point = vec3(screen * mix(0.78, 1.58, depth), depth * 3.8);',
      '    point.xy += curlFlow(point * 0.58 + vec3(2.4, -1.7, 0.0), t * 0.11) * (0.18 + depth * 0.38);',
      '    float naturalDensity = fogDensity(point, t);',
      '    float injectedDensity = pulseEventDensity(vUv, depth);',
      '    float depthBreakup = noise3(vec3(screen * (4.8 + depth * 1.7) + macroFlow, depth * 4.6 + t * 0.04));',
      '    float cloudGate = macroCloud * mix(0.42, 1.0, smoothstep(0.26, 0.79, depthBreakup));',
      '    float density = clamp(naturalDensity * (0.78 + uEnergy * 0.22) * cloudGate + injectedDensity * (0.84 + uBeat * 0.34), 0.0, 1.25);',
      '    float absorption = 1.0 - exp(-density * (0.42 + depth * 0.22) * (12.0 / float(PULSE_FOG_STEPS)));',
      '    float colorNoise = noise3(point * 0.78 + vec3(t * 0.06, 0.0, 3.2));',
      '    vec3 layerColor = mix(primary * 1.15, secondary * 1.25, clamp(depth * 0.68 + colorNoise * 0.34, 0.0, 1.0));',
      '    layerColor = mix(layerColor, contrast * 0.66, clamp(injectedDensity * 0.26 + uTreble * 0.08, 0.0, 0.3));',
      '    float lightEdge = smoothstep(0.46, 0.78, naturalDensity) * (0.08 + uShimmer * 0.12);',
      '    layerColor += secondary * lightEdge;',
      '    radiance += transmittance * absorption * layerColor;',
      '    accumulated += transmittance * absorption;',
      '    transmittance *= 1.0 - absorption;',
      '  }',
      '  vec3 volumeColor = radiance / max(0.08, accumulated);',
      '  vec3 veilColor = mix(primary * 1.05, secondary * 1.15, clamp(veilDetail * 0.74 + islandB * 0.22, 0.0, 1.0));',
      '  float volumeWeight = smoothstep(0.018, 0.18, accumulated);',
      '  vec3 color = mix(veilColor, volumeColor, volumeWeight);',
      '  color += mix(secondary, contrast, 0.65) * pointerWake * (0.26 + uEnergy * 0.14);',
      '  color += mix(contrast, vec3(1.0), 0.18) * pointerBloom * (0.74 + uEnergy * 0.20);',
      '  float grain = hash31(vec3(gl_FragCoord.xy, floor(uTime * 12.0))) - 0.5;',
      '  color += grain * (0.012 + uTreble * 0.012);',
      '  float vignette = smoothstep(1.18, 0.22, length((vUv - 0.5) * vec2(1.12, 1.0)));',
      '  float volumeAlpha = (1.0 - transmittance) * uFluidOpacity * (0.72 + vignette * 0.28);',
      '  volumeAlpha *= mix(0.32, 1.0, edgeBreakup) * mix(0.72, 1.08, filament);',
      '  float veilAlpha = wispyMask * uFluidOpacity * (0.105 + uEnergy * 0.055 + uBeat * 0.025);',
      '  veilAlpha += pointerWake * uFluidOpacity * (0.055 + uEnergy * 0.028);',
      '  veilAlpha += pointerBloom * uFluidOpacity * (0.105 + uEnergy * 0.04);',
      '  float alpha = max(volumeAlpha, veilAlpha) * mix(0.78, 1.0, vignette);',
      '  gl_FragColor = vec4(max(color, vec3(0.0)), clamp(alpha, 0.0, 0.68));',
      '}'
    ].join('\n')
  }));
  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'fluidSoundstage';
  mesh.renderOrder = -20;
  mesh.frustumCulled = false;
  return mesh;
}

try {
  fluidSoundstage = createFluidSoundstage(spaceUniforms);
  musicSpace.add(fluidSoundstage);
} catch (error) {
  fluidSoundstageHealthy = false;
  if (window.PulseRuntime && PulseRuntime.status) PulseRuntime.status.report('shader', { error: error, layer: 'fluidSoundstage' });
}

function fluidSoundstageState() {
  var rippleCount = 0;
  for (var i = 0; i < fluidRippleSlots.length; i++) if (fluidRippleSlots[i].life > 0.01) rippleCount += 1;
  return {
    visible: !!(fluidSoundstage && fluidSoundstage.visible && fluidSoundstageHealthy),
    healthy: fluidSoundstageHealthy,
    screenSpace: true,
    projection: 'clip-space',
    fogSteps: pulseFogStepCount(),
    rippleCount: rippleCount,
    opacity: Number(spaceUniforms.uFluidOpacity.value) || 0,
    pointer: {
      x: Number(fluidPointerState.x) || 0,
      y: Number(fluidPointerState.y) || 0,
      strength: Math.min(0.38, Math.hypot(fluidPointerState.x, fluidPointerState.y))
    },
    palette: {
      primary: musicSpacePaletteHex(musicSpacePaletteState.current.primary),
      secondary: musicSpacePaletteHex(musicSpacePaletteState.current.secondary),
      contrast: musicSpacePaletteHex(musicSpacePaletteState.current.contrast),
      source: musicSpacePaletteState.source,
      transitionProgress: Math.min(1, musicSpacePaletteState.transitionElapsed / musicSpacePaletteState.transitionMs)
    }
  };
}

function triggerFluidRipple(strength, x, y) {
  if (!fluidSoundstageHealthy || PulseRuntime.quality.reducedMotion) return false;
  var slot = fluidRippleSlots[fluidRippleCursor];
  fluidRippleCursor = (fluidRippleCursor + 1) % fluidRippleSlots.length;
  fluidRippleSequence += 1;
  var positionSeed = pulseFogEventUnit(fluidRippleSequence * 3.17);
  var heightSeed = pulseFogEventUnit(fluidRippleSequence * 5.73);
  var directionSeed = pulseFogEventUnit(fluidRippleSequence * 9.41);
  var suppliedX = Number(x);
  var suppliedY = Number(y);
  slot.x = clampMusicSpaceValue(isFinite(suppliedX) ? suppliedX : 0.12 + positionSeed * 0.76, 0.08, 0.92);
  slot.y = clampMusicSpaceValue(isFinite(suppliedY) ? suppliedY : 0.12 + heightSeed * 0.76, 0.08, 0.92);
  slot.life = 1;
  slot.radius = 0.025;
  slot.strength = clampMusicSpaceValue(strength, 0.22, 1);
  var directionAngle = directionSeed * Math.PI * 2;
  slot.directionX = Math.cos(directionAngle);
  slot.directionY = Math.sin(directionAngle);
  slot.stretch = 1.8 + pulseFogEventUnit(fluidRippleSequence * 11.19) * 2.4;
  slot.seed = pulseFogEventUnit(fluidRippleSequence * 17.03);
  return true;
}

function updateFluidSoundstage(dt, frame, options) {
  if (!fluidSoundstage || !fluidSoundstageHealthy) return false;
  options = options || {};
  var reducedMotion = !!options.reducedMotion;
  var playingNow = !!options.playing;
  var energy = clampMusicSpaceValue(frame && frame.energy, 0, 1);
  var targetOpacity = reducedMotion ? 0.58 : (playingNow ? 0.86 + energy * 0.1 : 0.66);
  spaceUniforms.uFluidOpacity.value += (targetOpacity - spaceUniforms.uFluidOpacity.value) * Math.min(1, dt * 3.4);
  if (spaceUniforms.uFluidResolution && spaceUniforms.uFluidResolution.value) {
    spaceUniforms.uFluidResolution.value.set(Math.max(1, innerWidth), Math.max(1, innerHeight));
  }
  var pointerEnabled = fluidPointerIsEnabled(reducedMotion);
  fluidPointerState.targetX = 0;
  fluidPointerState.targetY = 0;
  if (pointerEnabled && typeof mouseWorld !== 'undefined' && mouseWorld && isFinite(mouseWorld.x) && isFinite(mouseWorld.y)
    && Math.abs(mouseWorld.x) < 100 && Math.abs(mouseWorld.y) < 100) {
    fluidPointerState.targetX = clampMusicSpaceValue(mouseWorld.x / 15, -1, 1) * 0.38;
    fluidPointerState.targetY = clampMusicSpaceValue(mouseWorld.y / 10, -1, 1) * 0.38;
  }
  var pointerBlend = 1 - Math.exp(-Math.max(0, dt) * 5.4);
  fluidPointerState.x += (fluidPointerState.targetX - fluidPointerState.x) * pointerBlend;
  fluidPointerState.y += (fluidPointerState.targetY - fluidPointerState.y) * pointerBlend;
  spaceUniforms.uFluidPointer.value.set(fluidPointerState.x, fluidPointerState.y);
  var rippleData = spaceUniforms.uRippleData.value;
  var rippleFlowData = spaceUniforms.uRippleFlowData.value;
  for (var i = 0; i < fluidRippleSlots.length; i++) {
    var slot = fluidRippleSlots[i];
    if (reducedMotion) {
      slot.life = 0;
      slot.strength = 0;
    } else if (slot.life > 0) {
      slot.life = Math.max(0, slot.life - dt * (0.27 + energy * 0.06));
      slot.radius += dt * (0.09 + energy * 0.08);
    }
    rippleData[i].set(slot.x, slot.y, slot.radius, slot.strength * Math.pow(slot.life, 1.35));
    rippleFlowData[i].set(slot.directionX, slot.directionY, slot.stretch, slot.seed);
  }
  fluidSoundstage.visible = true;
  return true;
}

function clampMusicSpaceValue(value, min, max) {
  value = Number(value);
  if (!isFinite(value)) value = 0;
  return Math.max(min, Math.min(max, value));
}

function smoothMusicSpaceValue(current, target, dt, speed) {
  var blend = 1 - Math.exp(-Math.max(0, dt) * speed);
  return current + (target - current) * blend;
}

function normalizedMusicSpaceFrame(frame, playing) {
  frame = frame || {};
  var influence = playing ? 1 : 0;
  return {
    low: clampMusicSpaceValue(frame.low, 0, 1) * influence,
    mid: clampMusicSpaceValue(frame.mid, 0, 1) * influence,
    high: clampMusicSpaceValue(frame.high, 0, 1) * influence,
    energy: clampMusicSpaceValue(frame.energy, 0, 1) * influence,
    onset: clampMusicSpaceValue(frame.onset, 0, 1) * influence,
    peak: clampMusicSpaceValue(frame.peak, 0, 1) * influence
  };
}

function beginMusicSpaceHandoff(serial, target) {
  musicSpaceHandoff.serial = serial;
  musicSpaceHandoff.progress = 0;
  musicSpaceHandoff.previous.low = unifiedMusicSpaceState.low;
  musicSpaceHandoff.previous.mid = unifiedMusicSpaceState.mid;
  musicSpaceHandoff.previous.high = unifiedMusicSpaceState.high;
  musicSpaceHandoff.previous.energy = unifiedMusicSpaceState.energy;
  musicSpaceHandoff.target.low = target.low;
  musicSpaceHandoff.target.mid = target.mid;
  musicSpaceHandoff.target.high = target.high;
  musicSpaceHandoff.target.energy = target.energy;
}

function updateUnifiedMusicSpace(dt, pulseAnalysisFrame, options) {
  options = options || {};
  dt = clampMusicSpaceValue(dt, 0, 0.1);
  var reducedMotion = !!options.reducedMotion;
  var frame = normalizedMusicSpaceFrame(pulseAnalysisFrame, !!options.playing);
  var analysisSerial = Number(options.analysisSerial) || 0;
  if (musicSpaceHandoff.serial !== analysisSerial) beginMusicSpaceHandoff(analysisSerial, frame);
  musicSpaceHandoff.progress = Math.min(1, musicSpaceHandoff.progress + dt / musicSpaceHandoff.duration);
  var handoffEase = musicSpaceHandoff.progress * musicSpaceHandoff.progress * (3 - 2 * musicSpaceHandoff.progress);
  var targetLow = musicSpaceHandoff.previous.low + (frame.low - musicSpaceHandoff.previous.low) * handoffEase;
  var targetMid = musicSpaceHandoff.previous.mid + (frame.mid - musicSpaceHandoff.previous.mid) * handoffEase;
  var targetHigh = musicSpaceHandoff.previous.high + (frame.high - musicSpaceHandoff.previous.high) * handoffEase;
  var targetEnergy = musicSpaceHandoff.previous.energy + (frame.energy - musicSpaceHandoff.previous.energy) * handoffEase;

  unifiedMusicSpaceState.low = smoothMusicSpaceValue(unifiedMusicSpaceState.low, targetLow, dt, 4.2);
  unifiedMusicSpaceState.mid = smoothMusicSpaceValue(unifiedMusicSpaceState.mid, targetMid, dt, 5.1);
  unifiedMusicSpaceState.high = smoothMusicSpaceValue(unifiedMusicSpaceState.high, targetHigh, dt, 6.4);
  unifiedMusicSpaceState.energy = smoothMusicSpaceValue(unifiedMusicSpaceState.energy, targetEnergy, dt, 3.8);
  unifiedMusicSpaceState.onset = frame.onset;
  unifiedMusicSpaceState.peak = frame.peak;

  spaceUniforms.uBass.value = unifiedMusicSpaceState.low;
  spaceUniforms.uMid.value = unifiedMusicSpaceState.mid;
  spaceUniforms.uTreble.value = unifiedMusicSpaceState.high;
  spaceUniforms.uEnergy.value = unifiedMusicSpaceState.energy;
  spaceUniforms.uBeat.value = Math.max(frame.onset, frame.peak);
  spaceUniforms.uBreath.value = 0.12 + unifiedMusicSpaceState.low * (reducedMotion ? 0.18 : 0.48);
  spaceUniforms.uDepth.value = clampMusicSpaceValue(0.48 - unifiedMusicSpaceState.low * 0.16, 0.28, 0.62);
  spaceUniforms.uShear.value = 0.08 + unifiedMusicSpaceState.mid * (reducedMotion ? 0.24 : 0.74);
  spaceUniforms.uCurvature.value = 0.16 + unifiedMusicSpaceState.mid * (reducedMotion ? 0.32 : 0.92);
  spaceUniforms.uFlow.value = 0.12 + unifiedMusicSpaceState.mid * 0.42;
  spaceUniforms.uShimmer.value = 0.08 + unifiedMusicSpaceState.high * (reducedMotion ? 0.14 : 0.72);
  spaceUniforms.uSpeed.value = clampMusicSpaceValue(0.72 + unifiedMusicSpaceState.energy * 0.78, 0.72, 1.5);
  spaceUniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
  spaceUniforms.uHandoff.value = handoffEase;
  updateMusicSpacePalette(dt);
  var particleAccent = clampMusicSpaceValue(0.28 + unifiedMusicSpaceState.high * 0.24 + Math.max(frame.onset, frame.peak) * 0.38, 0.24, 1);
  spaceUniforms.uParticleDim.value = reducedMotion ? 0.46 : particleAccent;
  updateFluidSoundstage(dt, frame, { playing: !!options.playing, reducedMotion: reducedMotion });

  var impulse = Math.max(frame.onset, frame.peak * 0.86);
  var now = spaceUniforms.uTime.value;
  if (!reducedMotion && impulse > 0.58 && now - unifiedMusicSpaceState.lastImpulseAt > 0.12) {
    unifiedMusicSpaceState.lastImpulseAt = now;
    triggerTransientGlint(impulse, unifiedMusicSpaceState.high);
    var hasPointerPosition = typeof mouseWorld !== 'undefined' && isFinite(mouseWorld.x) && isFinite(mouseWorld.y)
      && Math.abs(mouseWorld.x) < 100 && Math.abs(mouseWorld.y) < 100;
    var rippleX = hasPointerPosition
      ? 0.5 + clampMusicSpaceValue(mouseWorld.x / 30, -0.34, 0.34)
      : undefined;
    var rippleY = hasPointerPosition
      ? 0.5 + clampMusicSpaceValue(mouseWorld.y / 20, -0.3, 0.3)
      : undefined;
    triggerFluidRipple(impulse, rippleX, rippleY);
  }
  updateTransientGlints(dt);
  spatialHaze.visible = true;
  spectralRibbons.visible = true;
  driftingFlow.visible = true;
  transientGlints.visible = true;
  musicSpace.visible = true;
}

function pulseVisualMotionIsReduced() {
  return !!(PulseRuntime.quality && PulseRuntime.quality.reducedMotion);
}

function pulseVisualMotionDuration(durationMs) {
  return pulseVisualMotionIsReduced() ? 1 : Math.max(1, Number(durationMs) || 1);
}

function tweenParticleAlpha(from, to, durationMs) {
  if (musicSpaceAlphaTween && musicSpaceAlphaTween.raf) cancelAnimationFrame(musicSpaceAlphaTween.raf);
  var start = performance.now();
  var duration = pulseVisualMotionDuration(durationMs);
  var startValue = clampMusicSpaceValue(from, 0, 1);
  var targetValue = clampMusicSpaceValue(to, 0, 1);
  musicSpaceAlphaTween = { raf: 0 };
  function tick(now) {
    var progress = Math.max(0, Math.min(1, (now - start) / duration));
    spaceUniforms.uAlpha.value = startValue + (targetValue - startValue) * progress;
    if (progress < 1) musicSpaceAlphaTween.raf = requestAnimationFrame(tick);
    else musicSpaceAlphaTween = null;
  }
  if (pulseVisualMotionIsReduced()) {
    spaceUniforms.uAlpha.value = targetValue;
    musicSpaceAlphaTween = null;
  } else {
    musicSpaceAlphaTween.raf = requestAnimationFrame(tick);
  }
}

function revealIdleParticles(target, durationMs) {
  tweenParticleAlpha(spaceUniforms.uAlpha.value, clampMusicSpaceValue(target, 0.2, 1), durationMs);
}

function disposeUnifiedMusicSpace() {
  if (unifiedMusicSpaceState.disposed) return false;
  unifiedMusicSpaceState.disposed = true;
  if (musicSpace.parent) musicSpace.parent.remove(musicSpace);
  for (var i = musicSpaceResources.length - 1; i >= 0; i--) {
    var resource = musicSpaceResources[i];
    if (resource && typeof resource.dispose === 'function') resource.dispose();
  }
  musicSpaceResources.length = 0;
  return true;
}

window.addEventListener('beforeunload', disposeUnifiedMusicSpace);
