import * as THREE from "three";

const SENSOR_HEIGHT_MM = 24;
const SAFE_ZONES = new Set(["frame", "head", "product", "subtitle", "platform"]);

export function normalizeMonitorEmphasis(cameraId, safeZone) {
  return {
    cameraId: cameraId ? String(cameraId) : null,
    safeZone: SAFE_ZONES.has(safeZone) ? safeZone : null,
  };
}

export function focalLengthToVerticalFov(focalLength) {
  const focal = Math.max(12, Math.min(200, Number(focalLength) || 35));
  return THREE.MathUtils.radToDeg(2 * Math.atan(SENSOR_HEIGHT_MM / (2 * focal)));
}

function createCameraMonitor({ canvas, scene, cameraData, policy = {} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(policy.pixelRatio || window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x070a0b, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const camera = new THREE.PerspectiveCamera(42, 9 / 16, 0.05, 40);
  camera.layers.enable(2);
  let data = cameraData;
  let animationFrame = 0;
  let lastFrame = 0;

  function update(nextCameraData) {
    data = nextCameraData;
    if (!data) return;
    camera.fov = focalLengthToVerticalFov(data.focalLength);
    camera.position.set(data.position.x, data.position.y, data.position.z);
    camera.lookAt(data.target.x, data.target.y, data.target.z);
    const program = canvas.closest("[data-monitor-program]");
    if (program) program.dataset.aspect = data.aspect;
  }

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const pixelRatio = renderer.getPixelRatio();
    if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
      renderer.setSize(width, height, false);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    animationFrame = requestAnimationFrame(render);
    if (document.hidden || now - lastFrame < 1000 / (policy.monitorFps || 30)) return;
    lastFrame = now;
    resize();
    renderer.render(scene, camera);
  }

  update(data);
  animationFrame = requestAnimationFrame(render);

  return {
    update,
    resize,
    capture() {
      resize();
      renderer.render(scene, camera);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      cancelAnimationFrame(animationFrame);
      renderer.dispose();
    },
  };
}

export function createCameraMonitors({ root, scene, cameras = [], policy } = {}) {
  if (!root || !scene) throw new TypeError("Camera monitors require a DOM root and Three.js scene");
  const monitors = new Map();

  for (const canvas of root.querySelectorAll("canvas[data-camera-monitor]")) {
    const cameraId = canvas.dataset.cameraMonitor;
    const cameraData = cameras.find((entry) => entry.id === cameraId);
    if (!cameraData) continue;
    monitors.set(cameraId, createCameraMonitor({ canvas, scene, cameraData, policy }));
  }

  return {
    update(nextCameras) {
      for (const [cameraId, monitor] of monitors) {
        monitor.update(nextCameras.find((entry) => entry.id === cameraId));
      }
    },
    capture() {
      return Object.fromEntries([...monitors].map(([cameraId, monitor]) => [cameraId, monitor.capture()]));
    },
    setActive(cameraId) {
      const emphasis = normalizeMonitorEmphasis(cameraId, null);
      for (const program of root.querySelectorAll("[data-monitor-program]")) {
        const active = Boolean(emphasis.cameraId) && program.dataset.monitorProgram === emphasis.cameraId;
        program.closest(".monitor")?.classList.toggle("is-active", active);
        program.setAttribute("aria-current", active ? "true" : "false");
      }
    },
    highlightSafeZone(kind) {
      const emphasis = normalizeMonitorEmphasis(null, kind);
      for (const zone of root.querySelectorAll("[data-safe-zone]")) {
        zone.classList.toggle("is-highlighted", Boolean(emphasis.safeZone) && zone.dataset.safeZone === emphasis.safeZone);
      }
    },
    dispose() {
      monitors.forEach((monitor) => monitor.dispose());
      monitors.clear();
    },
  };
}
