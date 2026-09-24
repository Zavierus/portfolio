import * as THREE from "three";

const VERTEX_SHADER = `
  attribute float aPhase;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uLow;
  uniform float uHigh;
  varying float vPhase;

  void main() {
    vec3 point = position;
    float travel = mod(point.z + uTime * (0.45 + uEnergy * 1.8) + 18.0, 24.0) - 12.0;
    point.z = travel;
    point.x += sin(uTime * 0.32 + aPhase * 20.0 + point.z * 0.12) * (0.12 + uLow * 0.42);
    point.y += cos(uTime * 0.41 + aPhase * 13.0 + point.z * 0.16) * (0.08 + uHigh * 0.28);
    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = (1.0 + aPhase * 2.2 + uHigh * 1.4) * (12.0 / max(2.0, -viewPosition.z));
    vPhase = aPhase;
  }
`;

const FRAGMENT_SHADER = `
  uniform float uEnvelope;
  varying float vPhase;

  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    float shape = 1.0 - smoothstep(0.25, 0.5, max(p.x * 0.58, p.y));
    vec3 cyan = vec3(0.267, 0.906, 1.0);
    vec3 acid = vec3(0.851, 1.0, 0.196);
    vec3 warning = vec3(1.0, 0.227, 0.133);
    vec3 color = mix(cyan, acid, smoothstep(0.62, 0.9, vPhase));
    color = mix(color, warning, step(0.975, vPhase));
    gl_FragColor = vec4(color, shape * (0.18 + vPhase * 0.6) * uEnvelope);
  }
`;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.min(1, Math.max(0, finite(value)));

function seeded(index, channel) {
  const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createField(count) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const lane = seeded(index, 3);
    positions[index * 3] = (lane - 0.5) * (3.5 + seeded(index, 5) * 8.5);
    positions[index * 3 + 1] = (seeded(index, 7) - 0.5) * (2.2 + seeded(index, 11) * 5.8);
    positions[index * 3 + 2] = -12 + seeded(index, 13) * 24;
    phases[index] = seeded(index, 17);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uLow: { value: 0 },
      uHigh: { value: 0 },
      uEnvelope: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

export function createSignalFieldPerformance({ stage }) {
  if (!stage?.scene || !stage?.camera) throw new TypeError("SIGNAL FIELD requires a VJ stage");
  const field = createField(stage.quality?.particleBudget ?? 720);
  field.name = "SIGNAL_FIELD";
  let mounted = false;
  let disposed = false;

  return {
    mount() {
      if (mounted || disposed) return false;
      mounted = true;
      stage.scene.add(field);
      stage.camera.position.set(0, 0, 7.8);
      stage.camera.lookAt(0, 0, -3);
      return true;
    },
    setEnvelope(value) {
      field.material.uniforms.uEnvelope.value = clamp01(value);
    },
    update(frame = {}) {
      if (!mounted || disposed) return false;
      const signal = frame.vjSignal ?? frame.signal ?? frame.summary ?? {};
      const uniforms = field.material.uniforms;
      uniforms.uTime.value = Math.max(0, finite(frame.currentTime, signal.time));
      uniforms.uEnergy.value = clamp01(frame.level ?? signal.peak);
      uniforms.uLow.value = clamp01(signal.low ?? frame.summary?.low);
      uniforms.uHigh.value = clamp01(signal.high ?? frame.summary?.high);
      field.rotation.z = Math.sin(uniforms.uTime.value * 0.045) * 0.025;
      return true;
    },
    pause() {},
    resume() {},
    seek() { return true; },
    dispose() {
      if (disposed) return false;
      disposed = true;
      stage.scene.remove(field);
      field.geometry.dispose();
      field.material.dispose();
      return true;
    },
  };
}

export async function loadSignalFieldModule({ stage } = {}) {
  return Object.freeze({ createPerformance: () => createSignalFieldPerformance({ stage }) });
}
