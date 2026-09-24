/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/02-visual/00-pointer-cover-particles.js */
/* Modified for PULSE ROOM on 2026-08-02. */

var mouseWorld = new THREE.Vector3(-999, -999, 0);
var mouseActive = false;
var mouseDownAt = { x: 0, y: 0, t: 0, hadDrag: false };
var particlePointerSpin = { active: false, lastT: 0 };
var particlePointerRay = new THREE.Raycaster();
var particlePointerNdc = new THREE.Vector2();
var particlePointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var particlePointerWorldHit = new THREE.Vector3();
var particlePointerLocalHit = new THREE.Vector3();
var particlePointerFrame = { dirty: false, ndcX: 0, ndcY: 0 };
var CLICK_THRESHOLD = 6;
var UI_HIT_SELECTOR = '#search-area,#upload-panel,#top-right,#fullscreen-diy-zone,#fx-panel,#fx-fab,#fx-fab-hide-btn,#playlist-panel,#bottom-bar,#thumb-wrap,#empty-home,#visual-guide,#trial-banner,#source-fallback-notice,.modal-mask,#toast,#ai-depth-chip,#beat-chip,#drop-overlay';

function isPointerOverUi(event) {
  if (!event) return false;
  var element = document.elementFromPoint(event.clientX, event.clientY);
  return !!(element && element.closest && element.closest(UI_HIT_SELECTOR));
}

function particleLocalPointFromNdc(ndcX, ndcY, out) {
  particlePointerNdc.set(ndcX, ndcY);
  particlePointerRay.setFromCamera(particlePointerNdc, camera);
  musicSpace.updateMatrixWorld(true);
  var normal = new THREE.Vector3(0, 0, 1).applyQuaternion(musicSpace.quaternion).normalize();
  particlePointerPlane.setFromNormalAndCoplanarPoint(normal, musicSpace.position);
  if (!particlePointerRay.ray.intersectPlane(particlePointerPlane, particlePointerWorldHit)) return false;
  out.copy(particlePointerWorldHit);
  musicSpace.worldToLocal(out);
  return isFinite(out.x) && isFinite(out.y) && Math.abs(out.x) < 15 && Math.abs(out.y) < 10;
}

function queueParticlePointerFrame(clientX, clientY) {
  var mx = (clientX / innerWidth) * 2 - 1;
  var my = -(clientY / innerHeight) * 2 + 1;
  pointerTarget.x = mx;
  pointerTarget.y = my;
  particlePointerFrame.ndcX = mx;
  particlePointerFrame.ndcY = my;
  particlePointerFrame.dirty = true;
}

function updateParticlePointerFrame() {
  if (!particlePointerFrame.dirty) return;
  particlePointerFrame.dirty = false;
  if (particleLocalPointFromNdc(particlePointerFrame.ndcX, particlePointerFrame.ndcY, particlePointerLocalHit)) {
    mouseWorld.copy(particlePointerLocalHit);
    mouseActive = true;
  } else {
    mouseWorld.set(-999, -999, 0);
    mouseActive = false;
  }
}

function beginParticlePointerDrag(event) {
  if (event.button === 2 || isPointerOverUi(event)) return;
  markRenderInteraction('canvas-drag', 1200);
  idleGuidePointerDown(event);
  orbit.rotating = true;
  orbit.last.x = event.clientX;
  orbit.last.y = event.clientY;
  particlePointerSpin.active = true;
  particlePointerSpin.lastT = performance.now();
  particleSpin.vx = particleSpin.vy = 0;
  mouseDownAt.x = event.clientX;
  mouseDownAt.y = event.clientY;
  mouseDownAt.t = performance.now();
  mouseDownAt.hadDrag = false;
}

renderer.domElement.addEventListener('mousedown', function (event) {
  if (freeCamera && freeCamera.active) {
    if (typeof requestFreeCameraPointerLock === 'function') requestFreeCameraPointerLock('canvas-mousedown');
    event.preventDefault();
    return;
  }
  beginParticlePointerDrag(event);
});

window.addEventListener('mousemove', function (event) {
  updateControlsAutoHideFromPointer(event.clientX, event.clientY);
  idleGuidePointerMove(event);
  if (freeCamera && freeCamera.active) return;
  if (isPointerOverUi(event) && !orbit.rotating) {
    mouseActive = false;
    return;
  }
  if (orbit.rotating) {
    markRenderInteraction('canvas-drag', 900);
    unlockCenteredView();
    var dx = event.clientX - orbit.last.x;
    var dy = event.clientY - orbit.last.y;
    var now = performance.now();
    var dt = Math.max(1 / 120, Math.min(0.08, (now - particlePointerSpin.lastT) / 1000 || 1 / 60));
    applyParticleSpinDrag(dx, dy, dt);
    particlePointerSpin.lastT = now;
    orbit.last.x = event.clientX;
    orbit.last.y = event.clientY;
    var totalDx = event.clientX - mouseDownAt.x;
    var totalDy = event.clientY - mouseDownAt.y;
    mouseDownAt.hadDrag = Math.hypot(totalDx, totalDy) > CLICK_THRESHOLD;
    orbit.recentering = false;
  }
  queueParticlePointerFrame(event.clientX, event.clientY);
});

window.addEventListener('mouseup', function () {
  orbit.rotating = false;
  particlePointerSpin.active = false;
  idleGuidePointerUp();
});

renderer.domElement.addEventListener('mouseleave', function () {
  particlePointerFrame.dirty = false;
  mouseWorld.set(-999, -999, 0);
  mouseActive = false;
  idleGuidePointerLeave();
});

renderer.domElement.addEventListener('wheel', function (event) {
  if (isPointerOverUi(event)) return;
  event.preventDefault();
  markRenderInteraction('canvas-wheel', 900);
  if (freeCamera && freeCamera.active) {
    freeCamera.fov = clampRange((freeCamera.fov || BASE_FOV) + event.deltaY * 0.018, 26, 72);
    saveFreeCameraState();
    return;
  }
  idleGuideWheel(event);
  unlockCenteredView();
  orbit.userRadius = Math.max(orbit.minRadius, Math.min(orbit.maxRadius, orbit.userRadius + event.deltaY * 0.005));
  orbit.recentering = false;
}, { passive: false });

renderer.domElement.addEventListener('dblclick', function (event) {
  if (isPointerOverUi(event)) return;
  if (freeCamera && freeCamera.locked) resetFreeCameraToDefault();
  else recenterCamera();
});

function seededMusicSpaceRandom(seed) {
  var state = seed >>> 0;
  return function () {
    state += 0x6D2B79F5;
    var value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function makeDotTexture() {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  var context = canvas.getContext('2d');
  var gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
  gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.38, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(0.76, 'rgba(255,255,255,0.16)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  var texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

var musicSpaceResources = [];
function registerMusicSpaceResource(resource) {
  if (resource && musicSpaceResources.indexOf(resource) < 0) musicSpaceResources.push(resource);
  return resource;
}

var dotTexture = registerMusicSpaceResource(makeDotTexture());
var spaceTier = PulseRuntime.quality.space;

function createMusicSpaceUniforms() {
  return {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 },
    uEnergy: { value: 0 },
    uAlpha: { value: 0.94 },
    uPointScale: { value: 1 },
    uSpeed: { value: 1 },
    uDepth: { value: 0.55 },
    uIntensity: { value: 1 },
    uTwist: { value: 0.4 },
    uScatter: { value: 0.18 },
    uColorBoost: { value: 1 },
    uBgFade: { value: 0.75 },
    uBloomStrength: { value: 0.35 },
    uEdgeEnabled: { value: 0 },
    uPreset: { value: 0 },
    uReducedMotion: { value: PulseRuntime.quality.reducedMotion ? 1 : 0 },
    uTintColor: { value: new THREE.Color(0x35d9ee) },
    uTintStrength: { value: 0 },
    // The fluid layer and particle field share these cover-derived colors. Keeping
    // them in the shared uniform bank avoids a second renderer or texture upload.
    uFluidPrimary: { value: new THREE.Color(0x159b80) },
    uFluidSecondary: { value: new THREE.Color(0x6de7b0) },
    uFluidContrast: { value: new THREE.Color(0xffbf69) },
    uPixel: { value: renderer.getPixelRatio ? renderer.getPixelRatio() : 1 },
    uDotTex: { value: dotTexture },
    uMouseXY: { value: new THREE.Vector2(-999, -999) },
    uMouseActive: { value: 0 },
    uParticleDim: { value: 1 },
    uBurstAmt: { value: 0 },
    uVinylSpin: { value: 0 },
    uCoverRes: { value: 1 },
    uHandActive: { value: 0 },
    uHandXY: { value: new THREE.Vector2(-999, -999) },
    uGestureGrip: { value: 0 },
    uBreath: { value: 0.12 },
    uShear: { value: 0.08 },
    uCurvature: { value: 0.16 },
    uFlow: { value: 0.12 },
    uShimmer: { value: 0.08 },
    uHandoff: { value: 1 },
    uFluidOpacity: { value: 0.72 },
    uFluidResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uFluidPointer: { value: new THREE.Vector2(0, 0) },
    uRippleData: { value: [
      new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()
    ] },
    uRippleFlowData: { value: [
      new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()
    ] }
  };
}

var spaceUniforms = createMusicSpaceUniforms();
var uniforms = spaceUniforms;

function createSpectralRibbons(count, sharedUniforms) {
  var random = seededMusicSpaceRandom(0x51A7B00D);
  var geometry = registerMusicSpaceResource(new THREE.BufferGeometry());
  var positions = new Float32Array(count * 3);
  var lane = new Float32Array(count);
  var phase = new Float32Array(count);
  var depth = new Float32Array(count);
  var accent = new Float32Array(count);
  var interruption = new Float32Array(count);
  var laneCount = Math.max(10, Math.round(Math.sqrt(count) * 0.14));
  for (var i = 0; i < count; i++) {
    var laneId = i % laneCount;
    var lanePhase = laneId / Math.max(1, laneCount) * Math.PI * 2;
    var radius = Math.pow(random(), 0.68) * 12.8;
    var theta = random() * Math.PI * 2 + lanePhase;
    var twist = theta + radius * 0.18 + Math.sin(lanePhase * 2.7) * 0.24;
    var z = -13 + random() * 26 + Math.sin(theta * 1.7 + lanePhase) * 0.75;
    var depthSpread = 0.86 + (z + 13) / 26 * 0.32;
    positions[i * 3] = Math.cos(twist) * radius * depthSpread + Math.sin(theta * 2.4 + lanePhase) * 0.9 + (random() - 0.5) * 0.7;
    positions[i * 3 + 1] = Math.sin(twist) * radius * 0.46 + Math.cos(theta * 1.8 - lanePhase) * 0.72 + (random() - 0.5) * 0.55;
    positions[i * 3 + 2] = z;
    lane[i] = laneId / laneCount;
    phase[i] = random() * Math.PI * 2 + lanePhase * 0.35;
    depth[i] = (z + 13) / 26;
    accent[i] = random();
    interruption[i] = random() > 0.14 ? 1 : 0;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aLane', new THREE.BufferAttribute(lane, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
  geometry.setAttribute('aAccent', new THREE.BufferAttribute(accent, 1));
  geometry.setAttribute('aInterrupt', new THREE.BufferAttribute(interruption, 1));
  geometry.userData.layer = 'spectralRibbons';
  geometry.userData.count = count;
  var material = registerMusicSpaceResource(new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aLane;',
      'attribute float aPhase;',
      'attribute float aDepth;',
      'attribute float aAccent;',
      'attribute float aInterrupt;',
      'uniform float uTime;',
      'uniform float uBass;',
      'uniform float uMid;',
      'uniform float uEnergy;',
      'uniform float uBreath;',
      'uniform float uShear;',
      'uniform float uCurvature;',
      'uniform float uFlow;',
      'uniform float uPointScale;',
      'uniform float uPixel;',
      'uniform float uReducedMotion;',
      'varying float vAccent;',
      'varying float vAlpha;',
      'void main(){',
      '  vec3 p = position;',
      '  float motion = mix(1.0, 0.28, uReducedMotion);',
      '  float t = uTime * (0.28 + uFlow * 0.54) * motion;',
      '  float streamPhase = aLane * 6.28318 + aPhase * 0.42;',
      '  float radial = length(p.xy * vec2(0.72, 1.08));',
      '  float theta = atan(p.y, p.x);',
      '  float fieldA = sin(p.x * 0.22 + p.z * 0.16 + streamPhase + t);',
      '  float fieldB = cos(p.z * 0.24 - p.y * 0.28 + streamPhase * 0.7 - t * 0.82);',
      '  float eddyA = sin(aPhase * 3.7 + t * 0.9 + p.z * 0.11 + radial * 0.34);',
      '  float eddyB = cos(aPhase * 2.9 - t * 0.72 + p.x * 0.08 - radial * 0.22);',
      '  float curl = sin(theta * 2.0 + radial * 0.46 + streamPhase + t * 0.62);',
      '  float curlAngle = theta + 1.5708 + curl * (0.34 + uCurvature * 0.90);',
      '  p.xy += vec2(cos(curlAngle), sin(curlAngle)) * (0.34 + uFlow * 0.90);',
      '  p.y += fieldA * (0.40 + uCurvature * 1.08) + eddyA * (0.24 + uBreath * 0.84) + sin(streamPhase + radial * 0.22 + t) * uShear * 0.46;',
      '  p.x += fieldB * (0.30 + uShear * 0.94) + eddyB * (0.22 + uFlow * 0.56);',
      '  p.z += sin(t * 0.88 + aPhase * 1.4 + radial * 0.28) * (0.30 + uBreath * 1.05) + curl * 0.32 - uBass * 0.28;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  float shimmer = 0.82 + 0.18 * sin(aPhase * 2.4 + t * 1.7 + radial * 0.3);',
      '  gl_PointSize = clamp((1.42 + aAccent * 1.72 + uEnergy * 1.45) * shimmer * uPointScale * uPixel * (19.0 / max(3.0, -mv.z)), 1.2, 8.0);',
      '  vAccent = aAccent;',
      '  vAlpha = aInterrupt * (0.40 + (1.0 - aDepth) * 0.30 + aAccent * 0.18) * shimmer;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uDotTex;',
      'uniform vec3 uTintColor;',
      'uniform float uTintStrength;',
      'uniform float uAlpha;',
      'uniform float uParticleDim;',
      'varying float vAccent;',
      'varying float vAlpha;',
      'void main(){',
      '  float dotAlpha = texture2D(uDotTex, gl_PointCoord).a;',
      '  vec3 neutral = vec3(0.76, 0.84, 0.88);',
      '  vec3 cyan = vec3(0.08, 0.72, 0.92);',
      '  vec3 magenta = vec3(0.94, 0.18, 0.62);',
      '  vec3 color = mix(neutral, cyan, smoothstep(0.08, 0.62, vAccent));',
      '  color = mix(color, magenta, smoothstep(0.72, 1.0, vAccent) * 0.88);',
      '  color = mix(color, uTintColor, uTintStrength);',
      '  gl_FragColor = vec4(color, dotAlpha * vAlpha * uAlpha * uParticleDim * uParticleDim);',
      '}'
    ].join('\n')
  }));
  var points = new THREE.Points(geometry, material);
  points.name = 'spectralRibbons';
  points.frustumCulled = false;
  return points;
}

var musicSpace = new THREE.Group();
musicSpace.name = 'pulse-unified-music-space';
scene.add(musicSpace);
var spectralRibbons = createSpectralRibbons(PulseRuntime.quality.space.ribbons, spaceUniforms);
musicSpace.add(spectralRibbons);

var particles = spectralRibbons;
var geo = spectralRibbons.geometry;
var bloomParticles = null;
var particleSpin = { vx: 0, vy: 0 };

function applyParticleSpinDrag(dx, dy, dt) {
  particleSpin.vy = (Number(dx) || 0) * 0.0018 / Math.max(1 / 120, dt || 1 / 60);
  particleSpin.vx = (Number(dy) || 0) * 0.0013 / Math.max(1 / 120, dt || 1 / 60);
}

function applyCoverParticleResolution(value) {
  uniforms.uCoverRes.value = Math.max(0.5, Math.min(2, Number(value) || 1));
}
