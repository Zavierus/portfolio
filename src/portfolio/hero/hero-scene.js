import * as THREE from "../../../assets/vendor/three.module.js";

import { HERO_QUALITY_PRESETS } from "./hero-quality-policy.js";

const VERTEX_SHADER = `
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uScroll;
  varying float vPhase;

  void main() {
    vec3 transformed = position;
    transformed.y += sin(uTime * aSpeed + aPhase * 6.28318) * 0.16;
    transformed.x += cos(uTime * aSpeed * 0.55 + aPhase * 9.0) * 0.08;
    transformed.xy += uPointer * (0.08 + aPhase * 0.12);
    transformed.y += uScroll * 0.35;
    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = (1.4 + aPhase * 2.4) * (9.0 / max(2.0, -viewPosition.z));
    vPhase = aPhase;
  }
`;

const FRAGMENT_SHADER = `
  varying float vPhase;

  void main() {
    vec2 centered = abs(gl_PointCoord - 0.5);
    float diamond = centered.x + centered.y;
    float alpha = 1.0 - smoothstep(0.22, 0.5, diamond);
    vec3 cyan = vec3(0.267, 0.906, 1.0);
    vec3 acid = vec3(0.851, 1.0, 0.196);
    vec3 color = mix(cyan, acid, step(0.78, vPhase));
    gl_FragColor = vec4(color, alpha * (0.18 + vPhase * 0.28));
  }
`;

function seeded(index, channel = 1) {
  const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createSignalDust(count) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (seeded(index, 2) - 0.5) * 13;
    positions[index * 3 + 1] = (seeded(index, 5) - 0.5) * 7.2;
    positions[index * 3 + 2] = -1.5 + seeded(index, 8) * 4.5;
    phases[index] = seeded(index, 11);
    speeds[index] = 0.14 + seeded(index, 17) * 0.42;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

export class HeroScene {
  constructor({ canvas, quality = "high", devicePixelRatio = globalThis.devicePixelRatio ?? 1 } = {}) {
    if (!canvas) throw new TypeError("HeroScene requires a canvas");
    this.canvas = canvas;
    this.devicePixelRatio = devicePixelRatio;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    this.camera.position.set(0, 0, 8);
    this.dust = createSignalDust(520);
    this.scene.add(this.dust);
    this.setQuality(quality);
  }

  render({ time = 0, pointer = [0, 0], scrollProgress = 0 } = {}) {
    const uniforms = this.dust.material.uniforms;
    uniforms.uTime.value = time;
    uniforms.uPointer.value.set(pointer[0], pointer[1]);
    uniforms.uScroll.value = scrollProgress;
    this.dust.rotation.z = Math.sin(time * 0.08) * 0.012;
    this.canvas.dataset.heroShot = "KEYART_SIGNAL_FIELD";
    this.canvas.dataset.heroFrame = String(Math.floor((time % 20) * 50));
    this.renderer.render(this.scene, this.camera);
    return { shotId: "KEYART_SIGNAL_FIELD", loopProgress: (time % 20) / 20 };
  }

  resize(width, height) {
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    this.renderer.setSize(nextWidth, nextHeight, false);
    this.camera.aspect = nextWidth / nextHeight;
    this.camera.updateProjectionMatrix();
  }

  setQuality(level) {
    if (!Object.hasOwn(HERO_QUALITY_PRESETS, level)) return false;
    this.quality = level;
    const preset = HERO_QUALITY_PRESETS[level];
    this.renderer.setPixelRatio(Math.min(this.devicePixelRatio, preset.pixelRatioCap));
    this.dust.geometry.setDrawRange(0, level === "high" ? 520 : 180);
    return true;
  }

  dispose() {
    this.dust.geometry.dispose();
    this.dust.material.dispose();
    this.renderer.dispose();
  }
}
