/* Derived from Mineradio 2.0.2 (4abaa19), GPL-3.0-only. */
/* Upstream: https://github.com/XxHuberrr/Mineradio/blob/4abaa190de42c632365ae4244e041bad16443224/public/js/modules/02-visual/03-lyrics-star-river.js */
/* Modified for PULSE ROOM on 2026-08-02. */

function createSpatialHaze(count, sharedUniforms) {
  var random = seededMusicSpaceRandom(0xA23E71C9);
  var geometry = registerMusicSpaceResource(new THREE.BufferGeometry());
  var positions = new Float32Array(count * 3);
  var seed = new Float32Array(count);
  var depth = new Float32Array(count);
  for (var i = 0; i < count; i++) {
    var depthBias = Math.pow(random(), 1.45);
    var z = -36 + depthBias * 52;
    var spread = 18 + Math.abs(z) * 0.52;
    positions[i * 3] = (random() - 0.5) * spread;
    positions[i * 3 + 1] = (random() - 0.5) * (spread * 0.58);
    positions[i * 3 + 2] = z;
    seed[i] = random();
    depth[i] = depthBias;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
  geometry.userData.layer = 'spatialHaze';
  geometry.userData.count = count;
  var material = registerMusicSpaceResource(new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aSeed;',
      'attribute float aDepth;',
      'uniform float uTime;',
      'uniform float uBreath;',
      'uniform float uPointScale;',
      'uniform float uPixel;',
      'uniform float uReducedMotion;',
      'varying float vDepth;',
      'varying float vSeed;',
      'void main(){',
      '  vec3 p = position;',
      '  float motion = mix(1.0, 0.25, uReducedMotion);',
      '  float t = uTime * 0.035 * motion + aSeed * 12.0;',
      '  p.x += sin(t + p.z * 0.08) * (0.32 + uBreath * 0.4);',
      '  p.y += cos(t * 0.73 + p.x * 0.05) * (0.2 + uBreath * 0.3);',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = clamp((0.7 + aSeed * 1.4) * uPointScale * uPixel * (24.0 / max(4.0, -mv.z)), 0.65, 4.2);',
      '  vDepth = aDepth;',
      '  vSeed = aSeed;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D uDotTex;',
      'uniform float uAlpha;',
      'uniform float uParticleDim;',
      'uniform float uBgFade;',
      'uniform float uEnergy;',
      'uniform vec3 uFluidPrimary;',
      'uniform vec3 uFluidSecondary;',
      'varying float vDepth;',
      'varying float vSeed;',
      'void main(){',
      '  float alpha = texture2D(uDotTex, gl_PointCoord).a * (0.012 + vDepth * 0.024) * uAlpha * uBgFade * uParticleDim;',
      '  alpha *= 0.72 + uEnergy * 0.12;',
      '  vec3 color = mix(vec3(0.48, 0.53, 0.58), vec3(0.12, 0.42, 0.58), vSeed * 0.56);',
      '  color = mix(color, mix(uFluidPrimary, uFluidSecondary, vSeed), 0.18);',
      '  gl_FragColor = vec4(color, alpha);',
      '}'
    ].join('\n')
  }));
  var points = new THREE.Points(geometry, material);
  points.name = 'spatialHaze';
  points.frustumCulled = false;
  return points;
}

var spatialHaze = createSpatialHaze(PulseRuntime.quality.space.haze, spaceUniforms);
musicSpace.add(spatialHaze);

function updateBackgroundStarRiver() {
  spatialHaze.visible = true;
}

function disposeBackgroundStarRiver() {
  spatialHaze.visible = false;
}
