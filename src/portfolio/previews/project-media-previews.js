import * as THREE from "../../../assets/vendor/three.module.js";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
const seeded = (index, seed) => {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const FRAME_COLOR = 0xd9ff32;
const PULSE_A = 0x8effca;
const PULSE_B = 0x44e7ff;
const FLOW_GOLD = 0xd9b85d;
const PLAYER_A = 0x8ea8ff;
const PLAYER_B = 0xd88aff;

function baseRenderer(record) {
  const renderer = new THREE.WebGLRenderer({ canvas: record.canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  record.renderer = renderer;
  record.scene = new THREE.Scene();
  record.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  record.group = new THREE.Group();
  record.scene.add(record.group);
  record.time = 0;
  record.previous = null;
}

function applyStudioEnvironment(record, tint) {
  // Procedural studio environment (no HDR file needed): PMREM gives metals real reflections.
  const envScene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(24, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x0a0f11, side: THREE.BackSide }),
  );
  envScene.add(room);
  for (let index = 0; index < 6; index += 1) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 2.2),
      new THREE.MeshBasicMaterial({ color: tint, side: THREE.DoubleSide }),
    );
    const angle = (index / 6) * Math.PI * 2;
    strip.position.set(Math.cos(angle) * 14, 4 + (index % 2) * 3, Math.sin(angle) * 14);
    strip.lookAt(0, 0, 0);
    envScene.add(strip);
  }
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 24),
    new THREE.MeshBasicMaterial({ color: 0x141c1e, side: THREE.DoubleSide }),
  );
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -2.4;
  envScene.add(floor);
  const pmrem = new THREE.PMREMGenerator(record.renderer);
  const texture = pmrem.fromScene(envScene, 0.06).texture;
  record.scene.environment = texture;
  pmrem.dispose();
}

function applyLights(record, accent) {
  record.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(3.2, 5.2, 4.2);
  record.scene.add(key);
  const warm = new THREE.PointLight(accent, 26, 32, 1.8);
  warm.position.set(-2.6, 2.2, -2);
  record.scene.add(warm);
  const cool = new THREE.PointLight(0xbfe8ff, 10, 24, 1.9);
  cool.position.set(2.6, 0.6, 2.8);
  record.scene.add(cool);
}

function buildFrameZero(record) {
  applyStudioEnvironment(record, 0x2c4a38);
  // Metal platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.18, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x1b2426, roughness: 0.42, metalness: 0.82 }),
  );
  platform.position.y = -0.78;
  platform.receiveShadow = true;
  record.group.add(platform);
  const grid = new THREE.GridHelper(6.4, 14, 0x2f5547, 0x1a2a25);
  grid.position.y = -0.685;
  record.group.add(grid);
  // Structure: portal frame + posts with hazard accents
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x39464a, roughness: 0.32, metalness: 0.9 });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.6, 0.09), frameMat);
    pillar.position.set(side * 1.65, 0.5, -1.15);
    record.group.add(pillar);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 0.1), frameMat);
  beam.position.set(0, 1.82, -1.15);
  record.group.add(beam);
  const hazard = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.055, 1.9),
    new THREE.MeshBasicMaterial({ color: 0xffb327, transparent: true, opacity: 0.85 }),
  );
  hazard.position.set(0, 1.78, -1.15);
  record.group.add(hazard);
  // Acid sign glow (distant marker)
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.42, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0a110c, emissive: FRAME_COLOR, emissiveIntensity: 1.7, roughness: 0.3, metalness: 0.1 }),
  );
  sign.position.set(-0.4, 1.1, -2.9);
  record.group.add(sign);
  const signHalo = new THREE.PointLight(FRAME_COLOR, 7, 6, 2);
  signHalo.position.copy(sign.position);
  signHalo.position.z -= 0.2;
  record.group.add(signHalo);
  // Sparse rain (fewer, longer streaks)
  const rain = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute((() => {
      const positions = new Float32Array(150 * 3);
      for (let index = 0; index < 150; index += 1) {
        positions[index * 3] = (seeded(index, 2) - 0.5) * 4.6;
        positions[index * 3 + 1] = (seeded(index, 5) - 0.5) * 3.8;
        positions[index * 3 + 2] = (seeded(index, 8) - 0.5) * 2.4;
      }
      return positions;
    })(), 3)),
    new THREE.PointsMaterial({ color: FRAME_COLOR, size: 0.05, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  record.group.add(rain);
  record.rain = rain;
  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 0.3),
    new THREE.MeshBasicMaterial({ color: FRAME_COLOR, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  scan.rotation.x = -Math.PI / 2;
  record.group.add(scan);
  record.scan = scan;
  record.camera.position.set(0, 1.05, 4.6);
  record.camera.lookAt(0, 0.05, 0);
}

function buildPulseRoom(record) {
  applyStudioEnvironment(record, 0x1f4d40);
  // Metallic liquid core with emissive surface
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 28, 20),
    new THREE.MeshStandardMaterial({ color: 0x0e2a24, roughness: 0.16, metalness: 0.94, emissive: PULSE_A, emissiveIntensity: 0.55, envMapIntensity: 1.4 }),
  );
  record.group.add(core);
  record.core = core;
  const membrane = new THREE.Mesh(
    new THREE.SphereGeometry(0.66, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0x123a31, roughness: 0.24, metalness: 0.86, transparent: true, opacity: 0.34, envMapIntensity: 1.1 }),
  );
  record.group.add(membrane);
  // Wavy acoustic shells (thin rings with vertex wave)
  const rings = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const ringGeo = new THREE.RingGeometry(0.86 + index * 0.34, 0.9 + index * 0.34, 96, 1);
    const wave = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: index % 2 ? PULSE_B : PULSE_A, transparent: true, opacity: 0.5 - index * 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    wave.rotation.x = Math.PI / 2 + index * 0.42;
    rings.add(wave);
  }
  record.group.add(rings);
  record.rings = rings;
  // Orbiting signal satellites
  const satellites = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x0a1a17, metalness: 0.9, roughness: 0.18, emissive: index % 2 ? PULSE_A : PULSE_B, emissiveIntensity: 2.4 }),
    );
    sat.userData.orbit = 1.65 + index * 0.28;
    sat.userData.phase = (index / 3) * Math.PI * 2;
    satellites.add(sat);
  }
  record.group.add(satellites);
  record.satellites = satellites;
  // Sparse atmosphere dust (reduced from 1500)
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute((() => {
      const positions = new Float32Array(420 * 3);
      for (let index = 0; index < 420; index += 1) {
        const theta = seeded(index, 3) * Math.PI * 2;
        const phi = Math.acos(seeded(index, 7) * 2 - 1);
        const radius = 1.35 + seeded(index, 11) * 1.6;
        positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
        positions[index * 3 + 2] = radius * Math.cos(phi);
      }
      return positions;
    })(), 3)),
    new THREE.PointsMaterial({ color: PULSE_A, size: 0.028, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  record.group.add(dust);
  record.dust = dust;
  record.camera.position.set(0, 0.85, 5.0);
  record.camera.lookAt(0, 0, 0);
}

function buildSetFlow(record) {
  applyStudioEnvironment(record, 0x4a3d1a);
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.12, 5.2),
    new THREE.MeshStandardMaterial({ color: 0x161d20, roughness: 0.5, metalness: 0.55 }),
  );
  floor.position.y = -1.06;
  record.group.add(floor);
  const grid = new THREE.GridHelper(7.4, 15, 0x6f5824, 0x2c2312);
  grid.position.y = -0.995;
  record.group.add(grid);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x232c30, roughness: 0.3, metalness: 0.78 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.7, 0.14), wallMat);
  wall.position.set(0, 0.35, -2.35);
  record.group.add(wall);
  const wallTrim = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.05, 0.05),
    new THREE.MeshBasicMaterial({ color: FLOW_GOLD, transparent: true, opacity: 0.7 }),
  );
  wallTrim.position.set(0, 1.72, -2.27);
  record.group.add(wallTrim);
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.13, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x5d6d72, roughness: 0.28, metalness: 0.85 }),
  );
  table.position.set(0.5, -0.28, 0.55);
  record.group.add(table);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x39464a, roughness: 0.3, metalness: 0.88 });
  for (const [tx, tz] of [[0.05, 0.32], [0.95, 0.32], [0.05, 0.78], [0.95, 0.78]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), legMat);
    leg.position.set(tx, -0.71, tz);
    record.group.add(leg);
  }
  const presenter = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.92, 16),
    new THREE.MeshStandardMaterial({ color: 0x9c4536, roughness: 0.45, metalness: 0.5 }),
  );
  body.position.y = 0.1;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xd6bd9b, roughness: 0.65, metalness: 0.2 }),
  );
  head.position.y = 0.74;
  presenter.add(body, head);
  presenter.position.set(-1.2, -0.58, 0.3);
  record.group.add(presenter);
  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.1, 0.42),
    new THREE.MeshBasicMaterial({ color: FLOW_GOLD, transparent: true, opacity: 0.6, wireframe: true }),
  );
  rack.position.set(1.05, 0.3, -1.05);
  rack.rotation.y = 0.4;
  record.group.add(rack);
  record.rack = rack;
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.06, 1.55, 12),
    new THREE.MeshStandardMaterial({ color: 0x5a6766, roughness: 0.25, metalness: 0.9 }),
  );
  stand.position.set(-1.2, -0.36, 0.0);
  record.group.add(stand);
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.34, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x8a6b2f, roughness: 0.32, metalness: 0.85 }),
  );
  box.position.set(-2.2, -0.85, 0.9);
  box.rotation.y = 0.6;
  record.group.add(box);
  record.camera.position.set(3.7, 2.7, 4.9);
  record.camera.lookAt(0, -0.25, 0);
}

function buildPlayerSignal(record) {
  applyStudioEnvironment(record, 0x2a2f55);
  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(1.08, 26, 16),
    new THREE.MeshBasicMaterial({ color: PLAYER_A, transparent: true, opacity: 0.2, wireframe: true }),
  );
  record.group.add(hub);
  record.hub = hub;
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 14),
    new THREE.MeshStandardMaterial({ color: 0x121a34, roughness: 0.14, metalness: 0.92, emissive: PLAYER_A, emissiveIntensity: 1.4, envMapIntensity: 1.5 }),
  );
  record.group.add(core);
  const nodes = new THREE.Group();
  const nodeMeshes = [];
  for (let index = 0; index < 6; index += 1) {
    const theta = seeded(index, 21) * Math.PI * 2;
    const phi = Math.acos(seeded(index, 23) * 2 - 1);
    const radius = 1.5 + seeded(index, 29) * 0.8;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14 + seeded(index, 31) * 0.1, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x18203c, roughness: 0.18, metalness: 0.9, emissive: index % 2 ? PLAYER_A : PLAYER_B, emissiveIntensity: 1.1, envMapIntensity: 1.3 }),
    );
    mesh.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta) * 0.7, radius * Math.cos(phi));
    nodes.add(mesh);
    nodeMeshes.push(mesh);
  }
  record.group.add(nodes);
  const links = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute((() => {
      const positions = new Float32Array(nodeMeshes.length * 6);
      for (let index = 0; index < nodeMeshes.length; index += 1) {
        const next = nodeMeshes[(index + 1) % nodeMeshes.length];
        positions[index * 6] = nodeMeshes[index].position.x;
        positions[index * 6 + 1] = nodeMeshes[index].position.y;
        positions[index * 6 + 2] = nodeMeshes[index].position.z;
        positions[index * 6 + 3] = next.position.x;
        positions[index * 6 + 4] = next.position.y;
        positions[index * 6 + 5] = next.position.z;
      }
      return positions;
    })(), 3)),
    new THREE.LineBasicMaterial({ color: 0x7f9dff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending }),
  );
  record.group.add(links);
  record.links = links;
  // Orbit ring for depth
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.014, 10, 72),
    new THREE.MeshStandardMaterial({ color: 0x9fb4ff, roughness: 0.3, metalness: 0.9, transparent: true, opacity: 0.5 }),
  );
  orbit.rotation.x = Math.PI / 2.4;
  record.group.add(orbit);
  record.orbit = orbit;
  record.camera.position.set(0, 0.8, 5.2);
  record.camera.lookAt(0, 0, 0);
}

const BUILDERS = Object.freeze({
  "frame-zero": buildFrameZero,
  "pulse-room": buildPulseRoom,
  "set-flow": buildSetFlow,
  "player-signal": buildPlayerSignal,
  "relic-01": buildPulseRoom,
});

function resize(record) {
  const bounds = record.media.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const ratio = Math.min(1.5, Math.max(1, record.windowRef.devicePixelRatio || 1));
  if (Math.abs(width - record.width) < 0.5 && Math.abs(height - record.height) < 0.5) return;
  record.width = width;
  record.height = height;
  record.canvas.width = Math.round(width * ratio);
  record.canvas.height = Math.round(height * ratio);
  record.renderer.setSize(width, height, false);
  record.camera.aspect = width / height;
  record.camera.updateProjectionMatrix();
}

function tick(record, timestamp) {
  if (!record.running) return;
  const delta = record.previous === null ? 0 : Math.min(0.05, (timestamp - record.previous) / 1000);
  record.previous = timestamp;
  record.time += delta;
  const t = record.time;
  const group = record.group;
  if (record.type === "frame-zero") {
    group.rotation.y = t * 0.05;
    const rain = record.rain.geometry.attributes.position;
    for (let index = 0; index < rain.count; index += 1) {
      const y = rain.getY(index);
      rain.setY(index, y - (1.1 + seeded(index, 5) * 0.8) * delta);
      if (rain.getY(index) < -2.1) rain.setY(index, 2.0 + seeded(index, 5) * 0.1);
    }
    rain.needsUpdate = true;
    record.scan.position.z = ((t % 2.1) / 2.1) * 5 - 2.5;
  } else if (record.type === "pulse-room") {
    group.rotation.y = t * 0.13;
    record.rings.rotation.z = t * 0.3;
    record.core.material.emissiveIntensity = 0.42 + Math.sin(t * 0.7) * 0.22;
    record.satellites.children.forEach((sat, index) => {
      const angle = t * (0.5 + index * 0.14) + sat.userData.phase;
      sat.position.set(Math.cos(angle) * sat.userData.orbit, Math.sin(angle * 1.4) * 0.35, Math.sin(angle) * sat.userData.orbit);
    });
    record.dust.rotation.y = -t * 0.07;
  } else if (record.type === "set-flow") {
    group.rotation.y = t * 0.07;
    if (record.rack) record.rack.rotation.y = 0.4 + Math.sin(t * 0.5) * 0.05;
  } else if (record.type === "player-signal") {
    group.rotation.y = t * 0.12;
    record.hub.rotation.y = -t * 0.28;
    record.hub.rotation.x = Math.sin(t * 0.4) * 0.3;
    record.links.material.opacity = 0.3 + Math.sin(t * 0.6) * 0.1;
    record.orbit.rotation.z = t * 0.1;
  }
  try {
    record.renderer.render(record.scene, record.camera);
  } catch (error) {
    console.error(`[project-preview:${record.type}] render failed`, error);
    record.running = false;
    return;
  }
  record.frameId = record.windowRef.requestAnimationFrame((next) => tick(record, next));
}

function createRecord(media, type, documentRef, windowRef) {
  const builder = BUILDERS[type];
  if (!builder) return null;
  const canvas = documentRef.createElement("canvas");
  canvas.className = "project-media__canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("data-project-preview-canvas", type);
  const record = {
    media, type, canvas, windowRef,
    width: 1, height: 1, time: 0, previous: null, frameId: 0,
    running: false, visible: false,
  };
  try {
    baseRenderer(record);
    applyLights(record, type === "pulse-room" ? PULSE_A : type === "set-flow" ? FLOW_GOLD : type === "player-signal" ? PLAYER_A : FRAME_COLOR);
    builder(record);
  } catch (error) {
    console.warn(`Project preview ${type} could not start`, error);
    return null;
  }
  (media.querySelector("[data-project-preview-surface]") || media).prepend(canvas);
  return record;
}

export function mountProjectMediaPreviews({
  elements,
  enabled,
  documentRef = document,
  windowRef = window,
} = {}) {
  if (!enabled || !("IntersectionObserver" in windowRef)) return () => {};
  const records = [...(elements || [])]
    .filter((media) => Object.hasOwn(BUILDERS, media.dataset.projectPreview))
    .map((media) => createRecord(media, media.dataset.projectPreview, documentRef, windowRef))
    .filter(Boolean);
  if (!records.length) return () => {};

  const start = (record) => {
    if (!record.visible || record.running) return;
    record.running = true;
    record.previous = null;
    record.media.classList.add("is-project-preview-live");
    record.frameId = record.windowRef.requestAnimationFrame((next) => tick(record, next));
  };
  const stop = (record) => {
    record.running = false;
    if (record.frameId) record.windowRef.cancelAnimationFrame(record.frameId);
    record.frameId = 0;
    record.media.classList.remove("is-project-preview-live");
  };

  const observer = new windowRef.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const record = records.find((candidate) => candidate.media === entry.target);
      if (!record) return;
      record.visible = entry.isIntersecting && entry.intersectionRatio >= 0.08 && !documentRef.hidden;
      if (record.visible) start(record);
      else stop(record);
    });
  }, { rootMargin: "12% 0px -12%", threshold: [0, 0.08, 0.35] });

  const resizeAll = () => records.forEach(resize);
  records.forEach((record) => {
    observer.observe(record.media);
    resize(record);
  });
  windowRef.addEventListener("resize", resizeAll, { passive: true });

  return () => {
    observer.disconnect();
    windowRef.removeEventListener("resize", resizeAll);
    records.forEach((record) => {
      stop(record);
      record.renderer.dispose();
      record.canvas.remove();
    });
  };
}
