import * as THREE from "three";

function seeded(index, salt) {
  const value = Math.sin(index * 91.37 + salt * 13.17) * 43758.5453;
  return value - Math.floor(value);
}

function bodyPoint(index) {
  const selector = seeded(index, 2);
  const angle = seeded(index, 3) * Math.PI * 2;
  const radial = 0.62 + seeded(index, 4) * 0.38;
  let center = [0, 0, 0];
  let radii = [1, 1, 1];
  if (selector < 0.13) { center = [0, 2.35, 0]; radii = [0.44, 0.55, 0.4]; }
  else if (selector < 0.5) { center = [0, 0.93, 0]; radii = [0.73, 1.25, 0.42]; }
  else if (selector < 0.63) { center = [-0.94, 0.72, 0]; radii = [0.23, 1.28, 0.23]; }
  else if (selector < 0.76) { center = [0.94, 0.72, 0]; radii = [0.23, 1.28, 0.23]; }
  else if (selector < 0.88) { center = [-0.34, -1.24, 0]; radii = [0.31, 1.62, 0.28]; }
  else { center = [0.34, -1.24, 0]; radii = [0.31, 1.62, 0.28]; }
  const y = (seeded(index, 6) * 2 - 1) * radii[1];
  const width = Math.sqrt(Math.max(0, 1 - (y / radii[1]) ** 2));
  return [
    center[0] + Math.cos(angle) * radial * radii[0] * width,
    center[1] + y,
    center[2] + Math.sin(angle) * radial * radii[2] * width,
  ];
}

const fragmentVertexShader = `
  uniform float uTime;
  uniform float uKind;
  varying vec2 vUv;
  varying float vRelief;
  void main() {
    vUv = uv;
    vec3 p = position;
    float sea = sin(uv.x * 20.0 + uTime * 0.7) * 0.025;
    sea += sin(uv.x * 43.0 - uTime * 0.46) * 0.012;
    p.z += sea * (1.0 - step(0.5, uKind));
    vRelief = sea;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uKind;
  varying vec2 vUv;
  varying float vRelief;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float edge = smoothstep(0.0, 0.035, uv.x) * smoothstep(0.0, 0.035, uv.y)
      * smoothstep(0.0, 0.035, 1.0 - uv.x) * smoothstep(0.0, 0.035, 1.0 - uv.y);
    vec3 color;
    float alpha;

    if (uKind < 0.5) {
      float horizon = smoothstep(0.38, 0.68, uv.y);
      float waveA = sin(uv.y * 76.0 + uv.x * 11.0 + uTime * 0.7);
      float waveB = sin(uv.y * 131.0 - uv.x * 24.0 - uTime * 0.4);
      float foam = smoothstep(0.88, 1.0, waveA * 0.55 + waveB * 0.25 + 0.35);
      color = mix(vec3(0.008, 0.035, 0.045), vec3(0.04, 0.43, 0.52), horizon);
      color += vec3(0.28, 0.9, 1.0) * foam * 0.52;
      color += abs(vRelief) * vec3(0.1, 0.55, 0.68) * 2.0;
      alpha = 0.72 + horizon * 0.2;
    } else if (uKind < 1.5) {
      float pores = noise(uv * vec2(92.0, 58.0));
      float grain = noise(uv * vec2(210.0, 120.0));
      float ridge = abs(sin((uv.x * 0.72 + uv.y) * 74.0 + noise(uv * 12.0) * 5.0));
      float capillary = smoothstep(0.965, 1.0, sin(uv.x * 38.0 + sin(uv.y * 21.0) * 4.0) * 0.5 + 0.5);
      color = mix(vec3(0.18, 0.055, 0.045), vec3(0.84, 0.48, 0.38), pores * 0.72);
      color += vec3(0.95, 0.75, 0.63) * smoothstep(0.86, 1.0, ridge) * 0.22;
      color -= vec3(0.22, 0.06, 0.04) * grain * 0.18;
      color += vec3(0.35, 0.01, 0.02) * capillary * 0.34;
      alpha = 0.84;
    } else {
      vec2 panes = fract(uv * vec2(3.0, 2.0));
      float mullion = min(min(panes.x, 1.0 - panes.x), min(panes.y, 1.0 - panes.y));
      float frame = 1.0 - smoothstep(0.035, 0.065, mullion);
      float verticalLight = pow(smoothstep(0.0, 1.0, 1.0 - abs(uv.x - 0.68) * 2.8), 3.0);
      float dust = smoothstep(0.975, 1.0, noise(uv * 170.0 + uTime * 0.01));
      vec3 night = mix(vec3(0.01, 0.012, 0.03), vec3(0.12, 0.08, 0.31), uv.y);
      color = night + vec3(0.31, 0.23, 0.82) * verticalLight * 1.2;
      color = mix(color, vec3(0.015, 0.018, 0.022), frame * 0.88);
      color += vec3(0.75, 0.82, 1.0) * dust * verticalLight;
      alpha = 0.88;
    }

    gl_FragColor = vec4(color, alpha * edge * uOpacity);
  }
`;

function memoryMaterial(kind) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uKind: { value: kind },
    },
    vertexShader: fragmentVertexShader,
    fragmentShader,
  });
}

function makeFragment(kind, index) {
  const group = new THREE.Group();
  const material = memoryMaterial(index);
  const image = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.65, 44, 28), material);
  const frameMaterial = new THREE.MeshBasicMaterial({
    color: index === 0 ? 0x44e7ff : index === 1 ? 0xff725d : 0x7557ff,
    transparent: true,
    opacity: 0,
  });
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.72, 1.82)), frameMaterial);
  frame.position.z = 0.025;
  group.add(image, frame);
  group.name = `memory-fragment-${kind}`;
  group.userData = { material, frameMaterial, basePosition: new THREE.Vector3() };
  return group;
}

function earthMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vPositionView;
      varying vec3 vObjectPosition;
      void main() {
        vObjectPosition = position;
        vNormalView = normalize(normalMatrix * normal);
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vPositionView = viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vNormalView;
      varying vec3 vPositionView;
      varying vec3 vObjectPosition;

      float hash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      void main() {
        vec3 normal = normalize(vNormalView);
        vec3 viewDirection = normalize(-vPositionView);
        vec3 lightDirection = normalize(vec3(-0.86, 0.3, 0.44));
        float diffuse = max(0.0, dot(normal, lightDirection));
        float crescent = pow(diffuse, 1.65);
        float rim = pow(1.0 - max(0.0, dot(normal, viewDirection)), 3.2);
        vec3 p = normalize(vObjectPosition);
        float continental = sin(p.x * 13.0 + sin(p.y * 8.0) * 2.4)
          + sin(p.y * 17.0 - p.z * 11.0) * 0.56
          + sin((p.x + p.z) * 31.0) * 0.2;
        float ash = smoothstep(-0.25, 0.58, continental);
        float fracture = smoothstep(0.91, 1.0, sin(continental * 8.0 + p.y * 54.0) * 0.5 + 0.5);
        float cinder = hash(floor(p * 84.0));
        vec3 ocean = vec3(0.006, 0.012, 0.014);
        vec3 land = mix(vec3(0.038, 0.042, 0.04), vec3(0.115, 0.085, 0.07), cinder);
        vec3 color = mix(ocean, land, ash) * (0.08 + crescent * 1.35);
        color += vec3(0.31, 0.055, 0.025) * fracture * crescent * 0.62;
        color += vec3(0.09, 0.46, 0.52) * rim * (0.28 + crescent * 0.72);
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
  });
}

function atmosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: `varying vec3 vNormalView; varying vec3 vViewPosition; void main(){vNormalView=normalize(normalMatrix*normal); vec4 v=modelViewMatrix*vec4(position,1.0); vViewPosition=v.xyz; gl_Position=projectionMatrix*v;}`,
    fragmentShader: `uniform float uOpacity; varying vec3 vNormalView; varying vec3 vViewPosition; void main(){vec3 normal=normalize(vNormalView); vec3 viewDirection=normalize(-vViewPosition); float rim=pow(1.0-max(0.0,dot(normal,viewDirection)),4.4); float crescent=.12+max(0.0,dot(normal,normalize(vec3(-.86,.3,.44))))*.88; gl_FragColor=vec4(vec3(.06,.34,.38)*rim*crescent,uOpacity*rim*crescent*.46);}`,
  });
}

export class MemoryReconstruction {
  constructor({ scene }) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "memory-reconstruction";
    scene.add(this.group);

    const placements = [
      [-2.75, 0.35, -3.4, -0.08, 0.2, -0.05],
      [0, 1.15, -3.7, 0.04, -0.08, 0.03],
      [2.7, 0.15, -4.05, -0.04, -0.24, -0.04],
    ];
    this.fragments = ["sea", "skin", "window"].map((kind, index) => {
      const fragment = makeFragment(kind, index);
      const [x, y, z, rx, ry, rz] = placements[index];
      fragment.position.set(x, y, z);
      fragment.rotation.set(rx, ry, rz);
      fragment.userData.basePosition.copy(fragment.position);
      fragment.visible = false;
      this.group.add(fragment);
      return fragment;
    });

    this.earthMaterial = earthMaterial();
    this.earth = new THREE.Mesh(new THREE.SphereGeometry(2.15, 96, 64), this.earthMaterial);
    this.earth.position.set(0.4, -0.05, -4.4);
    this.earth.rotation.z = -0.28;
    this.earth.visible = false;
    this.group.add(this.earth);
    this.atmosphereMaterial = atmosphereMaterial();
    this.atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.24, 72, 48), this.atmosphereMaterial);
    this.earth.add(this.atmosphere);

    const count = 5200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const white = new THREE.Color(0xebeae4);
    const cyan = new THREE.Color(0x44e7ff);
    const acid = new THREE.Color(0xd9ff32);
    for (let index = 0; index < count; index += 1) {
      const point = bodyPoint(index);
      positions.set(point, index * 3);
      const vertical = Math.min(1, Math.max(0, (point[1] + 2.8) / 5.7));
      const color = white.clone().lerp(vertical > 0.43 && vertical < 0.7 ? cyan : acid, seeded(index, 9) * 0.22);
      colors.set(color.toArray(), index * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0);
    this.bodyMaterial = new THREE.PointsMaterial({
      size: 0.034,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.body = new THREE.Points(geometry, this.bodyMaterial);
    this.body.position.set(0.75, 0.05, -2.7);
    this.body.visible = false;
    this.group.add(this.body);
    this.count = count;
  }

  update(state) {
    this.fragments.forEach((fragment, index) => {
      fragment.visible = state.mode === "fragments";
      fragment.userData.material.uniforms.uTime.value = state.time + index * 2.3;
      fragment.userData.material.uniforms.uOpacity.value = state.fragmentMix * (0.92 - index * 0.05);
      fragment.userData.frameMaterial.opacity = state.fragmentMix * 0.42;
      fragment.position.copy(fragment.userData.basePosition);
      fragment.position.y += Math.sin(state.time * 0.16 + index * 1.8) * 0.055;
    });

    this.earth.visible = state.earthReveal > 0.01;
    this.earthMaterial.uniforms.uTime.value = state.time;
    this.earthMaterial.uniforms.uOpacity.value = state.earthReveal;
    this.atmosphereMaterial.uniforms.uOpacity.value = state.earthReveal;
    this.earth.rotation.y = -0.35 + state.time * 0.012;

    this.body.visible = state.bodyCompletion > 0.01;
    this.body.geometry.setDrawRange(0, Math.floor(this.count * state.bodyCompletion));
    this.body.rotation.y = -0.22 + state.bodyCompletion * 0.16;
    this.bodyMaterial.opacity = 0.22 + state.bodyCompletion * 0.76;
  }

  setQuality(level) {
    this.bodyMaterial.size = level === "low" ? 0.042 : 0.034;
  }

  dispose() {
    this.fragments.forEach((fragment) => {
      fragment.traverse((object) => object.geometry?.dispose?.());
      fragment.userData.material.dispose();
      fragment.userData.frameMaterial.dispose();
    });
    this.earth.geometry.dispose();
    this.earthMaterial.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphereMaterial.dispose();
    this.body.geometry.dispose();
    this.bodyMaterial.dispose();
    this.scene.remove(this.group);
  }
}
