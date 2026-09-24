/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/02-visual/01-float-skull-backcover.js */
/* Modified for PULSE ROOM on 2026-08-02. */

function createDriftingFlow(count, sharedUniforms) {
  var random = seededMusicSpaceRandom(0xD21F10A7);
  var geometry = registerMusicSpaceResource(new THREE.BufferGeometry());
  var positions = new Float32Array(count * 3);
  var seed = new Float32Array(count);
  var depth = new Float32Array(count);
  var accent = new Float32Array(count);
  for (var i = 0; i < count; i++) {
    var z = -18 + random() * 34;
    positions[i * 3] = (random() - 0.5) * (20 + Math.abs(z) * 0.22);
    positions[i * 3 + 1] = (random() - 0.5) * (12 + Math.abs(z) * 0.12);
    positions[i * 3 + 2] = z;
    seed[i] = random();
    depth[i] = (z + 18) / 34;
    accent[i] = random();
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
  geometry.setAttribute('aAccent', new THREE.BufferAttribute(accent, 1));
  geometry.userData.layer = 'driftingFlow';
  geometry.userData.count = count;
  var material = registerMusicSpaceResource(new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aSeed;',
      'attribute float aDepth;',
      'attribute float aAccent;',
      'uniform float uTime;',
      'uniform float uFlow;',
      'uniform float uShear;',
      'uniform float uBreath;',
      'uniform float uEnergy;',
      'uniform float uPointScale;',
      'uniform float uPixel;',
      'uniform float uReducedMotion;',
      'varying float vAccent;',
      'varying float vAlpha;',
      'void main(){',
      '  vec3 p = position;',
      '  float motion = mix(1.0, 0.24, uReducedMotion);',
      '  float t = uTime * (0.08 + uFlow * 0.24) * motion + aSeed * 18.0;',
      '  p.x += sin(t + p.z * 0.18) * (0.42 + uShear * 1.8);',
      '  p.y += cos(t * 0.73 + p.x * 0.16) * (0.3 + uBreath * 1.25);',
      '  p.z += sin(t * 0.41 + aSeed * 6.28) * (0.45 + uFlow);',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = clamp((0.85 + aAccent * 1.7 + uEnergy) * uPointScale * uPixel * (17.0 / max(3.0, -mv.z)), 0.8, 5.5);',
      '  vAccent = aAccent;',
      '  vAlpha = 0.07 + (1.0 - abs(aDepth - 0.5) * 1.25) * 0.15;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uDotTex;',
      'uniform float uAlpha;',
      'uniform float uParticleDim;',
      'uniform vec3 uTintColor;',
      'uniform float uTintStrength;',
      'varying float vAccent;',
      'varying float vAlpha;',
      'void main(){',
      '  float alpha = texture2D(uDotTex, gl_PointCoord).a * vAlpha * uAlpha * uParticleDim * uParticleDim;',
      '  vec3 color = mix(vec3(0.52, 0.61, 0.68), vec3(0.14, 0.58, 0.72), vAccent);',
      '  color = mix(color, uTintColor, uTintStrength * 0.7);',
      '  gl_FragColor = vec4(color, alpha);',
      '}'
    ].join('\n')
  }));
  var points = new THREE.Points(geometry, material);
  points.name = 'driftingFlow';
  points.frustumCulled = false;
  return points;
}

function createTransientGlints(count, sharedUniforms) {
  var geometry = registerMusicSpaceResource(new THREE.BufferGeometry());
  var positions = new Float32Array(count * 3);
  var alpha = new Float32Array(count);
  var size = new Float32Array(count);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geometry.userData.layer = 'transientGlints';
  geometry.userData.count = count;
  var material = registerMusicSpaceResource(new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aAlpha;',
      'attribute float aSize;',
      'uniform float uPixel;',
      'varying float vAlpha;',
      'void main(){',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = clamp(aSize * uPixel * (22.0 / max(3.0, -mv.z)), 1.0, 11.0);',
      '  vAlpha = aAlpha;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uDotTex;',
      'varying float vAlpha;',
      'void main(){',
      '  float alpha = texture2D(uDotTex, gl_PointCoord).a * vAlpha;',
      '  gl_FragColor = vec4(0.72, 0.93, 1.0, alpha);',
      '}'
    ].join('\n')
  }));
  var points = new THREE.Points(geometry, material);
  points.name = 'transientGlints';
  points.frustumCulled = false;
  return points;
}

var driftingFlow = createDriftingFlow(PulseRuntime.quality.space.flow, spaceUniforms);
var transientGlints = createTransientGlints(PulseRuntime.quality.space.glints, spaceUniforms);
musicSpace.add(driftingFlow);
musicSpace.add(transientGlints);

var glintRandom = seededMusicSpaceRandom(0x61717E5);
var glintSlots = [];
for (var glintIndex = 0; glintIndex < spaceTier.glints; glintIndex++) {
  glintSlots.push({ life: 0, maxLife: 0, intensity: 0, driftX: 0, driftY: 0, driftZ: 0 });
}
var nextGlintSlot = 0;
var activeGlintCount = 0;

function triggerTransientGlint(intensity, highBand) {
  var slotIndex = nextGlintSlot;
  var slot = glintSlots[slotIndex];
  nextGlintSlot = (nextGlintSlot + 1) % glintSlots.length;
  slot.maxLife = Math.min(0.9, 0.24 + highBand * 0.5);
  slot.life = slot.maxLife;
  slot.intensity = Math.min(1, Math.max(0, intensity));
  slot.driftX = (glintRandom() - 0.5) * 1.6;
  slot.driftY = (glintRandom() - 0.5) * 1.1;
  slot.driftZ = (glintRandom() - 0.5) * 0.7;
  var position = transientGlints.geometry.attributes.position.array;
  position[slotIndex * 3] = (glintRandom() - 0.5) * 17;
  position[slotIndex * 3 + 1] = (glintRandom() - 0.5) * 8;
  position[slotIndex * 3 + 2] = -7 + glintRandom() * 14;
}

function updateTransientGlints(dt) {
  var geometry = transientGlints.geometry;
  var positions = geometry.attributes.position.array;
  var alpha = geometry.attributes.aAlpha.array;
  var size = geometry.attributes.aSize.array;
  var active = 0;
  for (var i = 0; i < glintSlots.length; i++) {
    var slot = glintSlots[i];
    if (slot.life <= 0) {
      alpha[i] = 0;
      size[i] = 0;
      continue;
    }
    slot.life = Math.max(0, slot.life - dt);
    var progress = slot.maxLife > 0 ? slot.life / slot.maxLife : 0;
    alpha[i] = progress * progress * slot.intensity;
    size[i] = 2.2 + slot.intensity * 5.4;
    positions[i * 3] += slot.driftX * dt;
    positions[i * 3 + 1] += slot.driftY * dt;
    positions[i * 3 + 2] += slot.driftZ * dt;
    if (slot.life > 0) active++;
  }
  activeGlintCount = active;
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.aAlpha.needsUpdate = true;
  geometry.attributes.aSize.needsUpdate = true;
}

function updateFloatLayer(dt) {
  updateTransientGlints(Math.max(0, Number(dt) || 0));
}
