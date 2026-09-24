import * as THREE from "three";
import * as CANNON from "cannon-es";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  WAVE_LAYOUT,
  WAVE_POWER_STATES,
  createTaskScheduler,
  isProjectileOutOfBounds,
  resolvePlayerMovement,
  segmentIntersectsAabb,
} from "./core.js";
import { buildBlacksiteWorld } from "./world/blacksite-world.js";
import { createAdaptiveResolution, selectRenderQuality } from "./render/render-quality.js";
import { derivePowerRail } from "./ui/power-rail.js";
import { createGameAudio } from "./audio/game-audio.js";
import { createLookController } from "./input/look-controller.js";
import { createLookSettings } from "./input/look-settings.js";
import {
  RELOAD_DURATION,
  crossedReloadCue,
  sampleReloadTimeline,
} from "./game/reload-timeline.js";
import {
  isDeathFragmentIndex,
  MAX_COMBAT_FRAGMENTS,
} from "./game/combat-effects.js";

const canvas = document.getElementById("gameCanvas");
const $ = (id) => document.getElementById(id);
const qaEnabled = new URLSearchParams(window.location.search).has("qa");
if (qaEnabled && !window.__FRAME_ZERO_QA__) window.__FRAME_ZERO_QA__ = {};
const isCoarse = window.matchMedia("(pointer: coarse)").matches;
const renderQuality = selectRenderQuality({
  devicePixelRatio: window.devicePixelRatio,
  isCoarse,
  hardwareConcurrency: navigator.hardwareConcurrency,
  deviceMemory: navigator.deviceMemory,
});

const palette = {
  void: 0x070808,
  paper: 0xebeae4,
  cyan: 0x44e7ff,
  amber: 0xd9ff32,
  danger: 0xff3a22,
  charcoal: 0x151b1d,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e11);
scene.fog = new THREE.FogExp2(0x10171a, 0.016);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.05, 180);
camera.position.set(0, 1.7, 8.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(renderQuality.initialPixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.72, 0.55, 0.7);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());
const adaptiveResolution = createAdaptiveResolution({
  ...renderQuality,
  onChange(pixelRatio, fps) {
    renderer.setPixelRatio(pixelRatio);
    composer.setPixelRatio(pixelRatio);
    document.body.dataset.renderScale = pixelRatio.toFixed(2);
    document.body.dataset.renderFps = String(Math.round(fps));
  },
});
document.body.dataset.renderScale = adaptiveResolution.pixelRatio().toFixed(2);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -16, 0) });
world.allowSleep = true;
world.defaultContactMaterial.friction = 0.35;
world.defaultContactMaterial.restitution = 0.2;
const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floorBody);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const keys = new Set();
const enemies = [];
const enemyTargets = [];
const bullets = [];
const fragments = [];
const trails = [];
const glassPanels = [];
const bursts = [];
const obstacles = [];
const occlusionTargets = [];
const scheduler = createTaskScheduler();
let blacksiteWorld = null;

let mode = "intro";
let wave = 0;
let yaw = 0;
let pitch = -0.02;
const lookSettings = createLookSettings();
const lookController = createLookController({ level: lookSettings.load() });
lookController.reset({ yaw, pitch });
let mouseEnergy = 0;
let timeScale = 0.02;
let hitStop = 0;
let shake = 0;
let ammo = 6;
let reloading = false;
let reloadElapsed = 0;
let hasWeapon = true;
let thrownWeapon = null;
let shots = 0;
let hits = 0;
let combo = 0;
let bestCombo = 0;
let kills = 0;
let dodges = 0;
let elapsed = 0;
let wavePending = false;
let audioContext = null;
let audioEngine = null;
let impactEnergy = 0;
let navigationHudTimer = 0;
let checkpoint = null;

const player = {
  position: new THREE.Vector3(0, 1.7, 8.2),
  velocity: new THREE.Vector3(),
};

const waves = WAVE_LAYOUT.map((layout) => layout.map(([x, z]) => new THREE.Vector3(x, 0, z)));

const waveInfo = [
  { name: "OUTER GANTRY", flash: "01 // OUTER GANTRY", light: 5.5, fire: 1 },
  { name: "RED BREACH", flash: "02 // RED BREACH", light: 7.5, fire: 0.9 },
  { name: "TURBINE HALL", flash: "03 // TURBINE HALL", light: 9.5, fire: 0.82 },
  { name: "EXTRACTION", flash: "04 // EXTRACTION", light: 13, fire: 0.68 },
];

function material(color, emissive = 0x000000, metalness = 0.25, roughness = 0.6) {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 1.25, metalness, roughness });
}

const structureMaterial = material(0xc9d0ce, 0x071111, 0.72, 0.32);
const darkMaterial = material(palette.charcoal, 0x030909, 0.8, 0.25);
const enemyClothMaterial = material(0x202628, 0x030505, 0.08, 0.82);
const enemyArmorMaterial = material(0x66563d, 0x180d03, 0.56, 0.34);
const enemyHelmetMaterial = material(0x343c3e, 0x050708, 0.68, 0.28);
const enemySignalMaterial = material(0xd98b2b, 0x8a2c05, 0.34, 0.22);
const cyanMaterial = material(palette.cyan, 0x146a70, 0.45, 0.2);
const bulletMaterial = material(palette.danger, 0x5a160d, 0.42, 0.26);
const weaponFrameMaterial = material(0x30383a, 0x050707, 0.78, 0.27);
const weaponSlideMaterial = material(0x687274, 0x0a0d0d, 0.76, 0.23);
const weaponDetailMaterial = material(0xa17d49, 0x1a1005, 0.58, 0.27);
const gloveMaterial = material(0x353b3a, 0x030404, 0.02, 0.76);
const enemyGeometries = Object.freeze({
  torso: new THREE.BoxGeometry(0.64, 0.9, 0.34),
  armor: new THREE.BoxGeometry(0.76, 0.58, 0.16),
  head: new THREE.IcosahedronGeometry(0.32, 1),
  visor: new THREE.BoxGeometry(0.36, 0.09, 0.055),
  arm: new THREE.CapsuleGeometry(0.11, 0.56, 4, 8),
  leg: new THREE.CapsuleGeometry(0.14, 0.66, 4, 8),
  weapon: new THREE.BoxGeometry(0.16, 0.16, 0.56),
  barrel: new THREE.CylinderGeometry(0.038, 0.038, 0.48, 8),
  signal: new THREE.BoxGeometry(0.1, 0.1, 0.045),
  muzzle: new THREE.SphereGeometry(0.075, 8, 6),
});
const enemyBulletGeometry = new THREE.CapsuleGeometry(0.045, 0.16, 5, 10);
const trailGeometry = new THREE.CylinderGeometry(0.018, 0.04, 1, 6);
const sparkGeometry = new THREE.TetrahedronGeometry(1, 0);
const sparkBaseMaterial = new THREE.MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 1 });
const pistolGeometries = Object.freeze({
  frame: new RoundedBoxGeometry(0.18, 0.15, 0.62, 3, 0.025),
  slide: new RoundedBoxGeometry(0.17, 0.12, 0.72, 3, 0.022),
  grip: new RoundedBoxGeometry(0.16, 0.34, 0.21, 3, 0.025),
  barrel: new THREE.CylinderGeometry(0.042, 0.042, 0.56, 12),
  muzzle: new THREE.CylinderGeometry(0.066, 0.066, 0.035, 12),
  sight: new THREE.BoxGeometry(0.035, 0.045, 0.06),
  port: new THREE.BoxGeometry(0.09, 0.018, 0.16),
  indicator: new THREE.BoxGeometry(0.018, 0.022, 0.12),
  serration: new THREE.BoxGeometry(0.012, 0.07, 0.022),
  gripPanel: new THREE.BoxGeometry(0.012, 0.2, 0.14),
  magazine: new RoundedBoxGeometry(0.13, 0.29, 0.16, 3, 0.018),
  magazinePlate: new RoundedBoxGeometry(0.15, 0.035, 0.18, 2, 0.012),
  hand: new RoundedBoxGeometry(0.24, 0.22, 0.25, 3, 0.04),
  wrist: new RoundedBoxGeometry(0.2, 0.3, 0.21, 3, 0.035),
  cuff: new RoundedBoxGeometry(0.24, 0.09, 0.24, 3, 0.025),
  finger: new THREE.CapsuleGeometry(0.035, 0.12, 3, 6),
});
const weaponRestPosition = new THREE.Vector3(0.38, -0.33, -1.03);
const weaponRestRotation = new THREE.Euler(-0.08, -0.12, 0.02);
const magazineSocket = new THREE.Vector3(0, -0.43, 0.17);
const magazineStart = new THREE.Vector3(-0.22, -0.78, 0.3);
const magazineEjected = new THREE.Vector3(-0.12, -0.76, 0.24);
const supportHandStart = new THREE.Vector3(-0.48, -0.78, 0.48);
const supportHandCatch = new THREE.Vector3(-0.18, -0.54, 0.34);
const supportHandOffset = new THREE.Vector3(-0.17, 0.06, 0.15);
const reloadHandTarget = new THREE.Vector3();

function registerObstacle(position, size, rotationY = 0, type = "solid", owner = null) {
  const cosine = Math.abs(Math.cos(rotationY));
  const sine = Math.abs(Math.sin(rotationY));
  const halfX = (size.x * cosine + size.z * sine) / 2;
  const halfZ = (size.x * sine + size.z * cosine) / 2;
  const obstacle = {
    minX: position.x - halfX,
    maxX: position.x + halfX,
    minZ: position.z - halfZ,
    maxZ: position.z + halfZ,
    minY: position.y - size.y / 2,
    maxY: position.y + size.y / 2,
    type,
    owner,
    active: true,
  };
  obstacles.push(obstacle);
  return obstacle;
}

function addBox({ position, size, mat = structureMaterial, rotationY = 0, cast = true, collider = false }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat);
  mesh.position.copy(position);
  mesh.rotation.y = rotationY;
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collider) {
    mesh.userData.obstacle = registerObstacle(position, size, rotationY);
    occlusionTargets.push(mesh);
  }
  return mesh;
}

function buildGallery() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(45, 52), darkMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -8;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(44, 44, palette.cyan, 0x213033);
  grid.position.set(0, 0.012, -8);
  grid.material.transparent = true;
  grid.material.opacity = 0.19;
  scene.add(grid);

  addBox({ position: new THREE.Vector3(-11.5, 3.5, -8), size: new THREE.Vector3(0.5, 7, 34), mat: darkMaterial, collider: true });
  addBox({ position: new THREE.Vector3(11.5, 3.5, -8), size: new THREE.Vector3(0.5, 7, 34), mat: darkMaterial, collider: true });
  addBox({ position: new THREE.Vector3(0, 5.8, -24.5), size: new THREE.Vector3(23, 0.4, 0.8), mat: structureMaterial });

  [-7.5, 7.5].forEach((x) => {
    [-1.5, -11.5, -21].forEach((z) => {
      addBox({ position: new THREE.Vector3(x, 2.6, z), size: new THREE.Vector3(0.75, 5.2, 0.75), mat: structureMaterial, collider: true });
      const cap = new THREE.PointLight(palette.cyan, 4.5, 7.5, 2);
      cap.position.set(x, 4.8, z);
      scene.add(cap);
    });
  });

  addBox({ position: new THREE.Vector3(-7.8, 0.65, -15.4), size: new THREE.Vector3(6.4, 1.3, 3), mat: darkMaterial, rotationY: -0.22, collider: true });
  addBox({ position: new THREE.Vector3(7.8, 0.45, -10.5), size: new THREE.Vector3(5, 0.9, 3), mat: darkMaterial, rotationY: 0.3, collider: true });

  const ringMaterial = new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.78 });
  for (let index = 0; index < 4; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.8 + index * 0.28, 0.025, 8, 96), ringMaterial);
    ring.position.set(0, 3.2, -23.7 + index * 0.1);
    scene.add(ring);
  }

  createGlass(new THREE.Vector3(-2.8, 2, -4.4), new THREE.Vector3(3.7, 4, 0.08), -0.18);
  createGlass(new THREE.Vector3(3.4, 2, -13.2), new THREE.Vector3(4.4, 4, 0.08), 0.24);

  const hemi = new THREE.HemisphereLight(0x9cc6c9, 0x020303, 1.75);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xf4fff8, 3.1);
  key.position.set(-5, 9, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  scene.add(key);
  const dangerLight = new THREE.PointLight(palette.danger, 5.5, 13, 2);
  dangerLight.position.set(0, 2, 5.5);
  dangerLight.name = "dangerLight";
  scene.add(dangerLight);

  const leftSpot = new THREE.SpotLight(palette.cyan, 22, 34, 0.34, 0.6, 1.4);
  leftSpot.position.set(-8, 8, 5);
  leftSpot.target.position.set(-1.5, 0, -11);
  leftSpot.castShadow = true;
  scene.add(leftSpot, leftSpot.target);
  const rightSpot = new THREE.SpotLight(0xffe4c0, 18, 30, 0.3, 0.65, 1.5);
  rightSpot.position.set(8, 7, 1);
  rightSpot.target.position.set(2, 0, -12);
  scene.add(rightSpot, rightSpot.target);

  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: palette.cyan,
    emissive: 0x0b3c40,
    transparent: true,
    opacity: 0.52,
    metalness: 0.15,
    roughness: 0.08,
    side: THREE.DoubleSide,
  });
  for (let index = 0; index < 22; index += 1) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.16, 0), shardMaterial);
    const angle = index * 1.9;
    shard.position.set(
      0.45 + Math.sin(angle) * (0.35 + Math.random() * 1.5),
      1.72 + Math.cos(angle * 0.7) * (0.25 + Math.random() * 0.85),
      5.3 - Math.random() * 2.8,
    );
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(shard);
  }
}

function createGlass(position, size, rotationY) {
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: palette.cyan,
    emissive: 0x0c3235,
    transparent: true,
    opacity: 0.25,
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.18,
    side: THREE.DoubleSide,
  });
  const mesh = addBox({ position, size, mat: glassMaterial, rotationY, cast: false });
  mesh.userData.glass = true;
  const panel = { mesh, broken: false, size: size.clone(), obstacle: null };
  panel.obstacle = registerObstacle(position, size, rotationY, "glass", panel);
  glassPanels.push(panel);
}

function createEnemy(position, index) {
  const root = new THREE.Group();
  root.position.copy(position);
  root.rotation.y = Math.atan2(player.position.x - position.x, player.position.z - position.z);
  scene.add(root);

  const parts = [];
  const addPart = (geometry, offset, partMaterial, rotation = new THREE.Euler(), hitZone = "torso") => {
    const mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.position.copy(offset);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.userData.enemyRoot = root;
    mesh.userData.hitZone = hitZone;
    root.add(mesh);
    parts.push(mesh);
    enemyTargets.push(mesh);
    return mesh;
  };

  addPart(enemyGeometries.torso, new THREE.Vector3(0, 1.55, 0), enemyClothMaterial);
  addPart(enemyGeometries.armor, new THREE.Vector3(0, 1.64, 0.24), enemyArmorMaterial);
  addPart(enemyGeometries.head, new THREE.Vector3(0, 2.33, 0), enemyHelmetMaterial, new THREE.Euler(), "head");
  addPart(enemyGeometries.visor, new THREE.Vector3(0, 2.35, 0.3), enemySignalMaterial, new THREE.Euler(), "head");
  addPart(enemyGeometries.arm, new THREE.Vector3(-0.47, 1.58, 0.13), enemyClothMaterial, new THREE.Euler(0.18, 0, -0.38), "limb");
  addPart(enemyGeometries.arm, new THREE.Vector3(0.47, 1.58, 0.13), enemyClothMaterial, new THREE.Euler(-0.18, 0, 0.38), "limb");
  addPart(enemyGeometries.leg, new THREE.Vector3(-0.22, 0.55, 0), enemyClothMaterial, new THREE.Euler(), "limb");
  addPart(enemyGeometries.leg, new THREE.Vector3(0.22, 0.55, 0), enemyClothMaterial, new THREE.Euler(), "limb");
  addPart(enemyGeometries.weapon, new THREE.Vector3(0.3, 1.63, 0.47), enemyHelmetMaterial, new THREE.Euler(-0.08, 0, 0), "limb");
  addPart(enemyGeometries.barrel, new THREE.Vector3(0.3, 1.66, 0.83), enemyHelmetMaterial, new THREE.Euler(Math.PI / 2, 0, 0), "limb");
  const signal = addPart(enemyGeometries.signal, new THREE.Vector3(0, 1.66, 0.34), enemySignalMaterial);
  const muzzle = new THREE.Mesh(enemyGeometries.muzzle, enemySignalMaterial);
  muzzle.position.set(0.3, 1.66, 1.08);
  muzzle.visible = false;
  root.add(muzzle);
  const muzzleLight = new THREE.PointLight(0xffb64c, 0, 3.4, 2);
  muzzleLight.position.copy(muzzle.position);
  root.add(muzzleLight);

  const enemy = {
    root,
    parts,
    alive: true,
    shotTimer: (1.25 + index * 0.55 + Math.random() * 0.45) * waveInfo[wave].fire,
    pulse: Math.random() * Math.PI * 2,
    signal,
    muzzle,
    muzzleLight,
    muzzleEnergy: 0,
    warningTriggered: false,
  };
  root.userData.enemy = enemy;
  enemies.push(enemy);
  return enemy;
}

function removeAllEnemies() {
  while (enemies.length) {
    const enemy = enemies.pop();
    scene.remove(enemy.root);
  }
  enemyTargets.length = 0;
}

function spawnWave(index, initial = false) {
  wave = index;
  applyWavePower(index);
  removeAllEnemies();
  waves[index].forEach((position, enemyIndex) => createEnemy(position, enemyIndex));
  wavePending = false;
  checkpoint = {
    wave: index,
    position: player.position.clone(),
    yaw,
    pitch,
    kills,
    shots,
    hits,
    dodges,
    elapsed,
  };
  const dangerLight = scene.getObjectByName("dangerLight");
  if (dangerLight) dangerLight.intensity = waveInfo[index].light;
  updateHud();
  if (!initial) {
    $("waveFlashLabel").textContent = waveInfo[index].flash;
    $("waveFlash").classList.remove("hidden");
    window.setTimeout(() => $("waveFlash").classList.add("hidden"), 1050);
    playTone("wave");
  }
}

function applyWavePower(index) {
  const circuits = WAVE_POWER_STATES[index] ?? WAVE_POWER_STATES[0];
  blacksiteWorld?.setCircuitState(circuits);
  const rail = derivePowerRail(circuits);
  document.querySelectorAll("[data-power-stage]").forEach((element) => {
    const state = rail[element.dataset.powerStage] ?? "off";
    const marker = element.querySelector("i");
    marker?.classList.toggle("is-live", state === "live");
    marker?.classList.toggle("is-partial", state === "partial");
  });
}

function buildPistolModel(withHand = false) {
  const weapon = new THREE.Group();
  const parts = { slideParts: [] };
  const addPart = (geometry, partMaterial, position, rotation = new THREE.Euler(), name = "") => {
    const mesh = new THREE.Mesh(geometry, partMaterial);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.name = name;
    weapon.add(mesh);
    return mesh;
  };
  const addMagazine = (name) => {
    const magazine = new THREE.Group();
    magazine.name = name;
    const body = new THREE.Mesh(pistolGeometries.magazine, weaponFrameMaterial);
    const plate = new THREE.Mesh(pistolGeometries.magazinePlate, weaponDetailMaterial);
    plate.position.y = -0.16;
    body.castShadow = true;
    plate.castShadow = true;
    magazine.add(body, plate);
    weapon.add(magazine);
    return magazine;
  };
  addPart(pistolGeometries.frame, weaponFrameMaterial, new THREE.Vector3(0, 0, -0.08));
  parts.slideParts.push(addPart(pistolGeometries.slide, weaponSlideMaterial, new THREE.Vector3(0, 0.13, -0.13), new THREE.Euler(), "slide"));
  addPart(pistolGeometries.grip, weaponFrameMaterial, new THREE.Vector3(0, -0.23, 0.13), new THREE.Euler(-0.18, 0, 0));
  addPart(pistolGeometries.barrel, weaponFrameMaterial, new THREE.Vector3(0, 0.105, -0.22), new THREE.Euler(Math.PI / 2, 0, 0));
  addPart(pistolGeometries.muzzle, weaponDetailMaterial, new THREE.Vector3(0, 0.105, -0.505), new THREE.Euler(Math.PI / 2, 0, 0));
  parts.slideParts.push(addPart(pistolGeometries.sight, weaponFrameMaterial, new THREE.Vector3(0, 0.215, -0.42)));
  parts.slideParts.push(addPart(pistolGeometries.sight, weaponFrameMaterial, new THREE.Vector3(0, 0.215, 0.12)));
  parts.slideParts.push(addPart(pistolGeometries.port, weaponFrameMaterial, new THREE.Vector3(0.075, 0.19, -0.12), new THREE.Euler(0, 0, Math.PI / 2)));
  addPart(pistolGeometries.indicator, weaponDetailMaterial, new THREE.Vector3(0.092, 0.06, 0.02));
  for (let index = 0; index < 4; index += 1) {
    parts.slideParts.push(addPart(pistolGeometries.serration, weaponFrameMaterial, new THREE.Vector3(0.091, 0.13, 0.08 + index * 0.045)));
  }
  addPart(pistolGeometries.gripPanel, weaponDetailMaterial, new THREE.Vector3(0.086, -0.23, 0.13), new THREE.Euler(-0.18, 0, 0));
  parts.oldMagazine = addMagazine("oldMagazine");
  parts.oldMagazine.position.copy(magazineSocket);
  parts.oldMagazine.rotation.x = -0.18;
  if (withHand) {
    parts.primaryHand = addPart(pistolGeometries.hand, gloveMaterial, new THREE.Vector3(0.015, -0.38, 0.13), new THREE.Euler(-0.18, 0, 0));
    addPart(pistolGeometries.finger, gloveMaterial, new THREE.Vector3(-0.12, -0.13, -0.03), new THREE.Euler(Math.PI / 2, 0, 0.28));
    addPart(pistolGeometries.wrist, gloveMaterial, new THREE.Vector3(0.04, -0.58, 0.22), new THREE.Euler(-0.38, 0, 0.02));
    addPart(pistolGeometries.cuff, weaponFrameMaterial, new THREE.Vector3(0.05, -0.7, 0.27), new THREE.Euler(-0.38, 0, 0.02));
    parts.newMagazine = addMagazine("newMagazine");
    parts.newMagazine.position.copy(magazineStart);
    parts.newMagazine.rotation.x = -0.18;
    parts.newMagazine.visible = false;
    parts.supportHand = new THREE.Group();
    parts.supportHand.name = "supportHand";
    const supportPalm = new THREE.Mesh(pistolGeometries.hand, gloveMaterial);
    const supportWrist = new THREE.Mesh(pistolGeometries.wrist, gloveMaterial);
    const supportCuff = new THREE.Mesh(pistolGeometries.cuff, weaponFrameMaterial);
    supportWrist.position.set(-0.02, -0.21, 0.05);
    supportCuff.position.set(-0.025, -0.37, 0.07);
    parts.supportHand.add(supportPalm, supportWrist, supportCuff);
    for (let index = 0; index < 3; index += 1) {
      const finger = new THREE.Mesh(pistolGeometries.finger, gloveMaterial);
      finger.position.set(0.1, 0.01 - index * 0.052, -0.03 + index * 0.035);
      finger.rotation.set(Math.PI / 2, 0, -0.12);
      parts.supportHand.add(finger);
    }
    parts.supportHand.traverse((part) => { if (part.isMesh) part.castShadow = true; });
    parts.supportHand.position.set(-0.38, -0.75, 0.38);
    parts.supportHand.rotation.set(-0.25, 0.1, 0.24);
    weapon.add(parts.supportHand);
    parts.supportHand.visible = false;
  }
  parts.slideParts.forEach((part) => { part.userData.restZ = part.position.z; });
  weapon.userData.parts = parts;
  return weapon;
}

function buildWeapon() {
  const weapon = buildPistolModel(true);
  const weaponFill = new THREE.PointLight(0xd5ded9, 0.62, 1.8, 2);
  weaponFill.position.set(-0.18, 0.34, 0.38);
  weapon.add(weaponFill);
  weapon.position.copy(weaponRestPosition);
  weapon.rotation.copy(weaponRestRotation);
  camera.add(weapon);
  scene.add(camera);
  return weapon;
}

const weaponMesh = buildWeapon();

function resetReloadPose() {
  const parts = weaponMesh.userData.parts;
  weaponMesh.position.copy(weaponRestPosition);
  weaponMesh.rotation.copy(weaponRestRotation);
  parts.oldMagazine.position.copy(magazineSocket);
  parts.oldMagazine.rotation.x = -0.18;
  parts.oldMagazine.visible = true;
  if (parts.newMagazine) {
    parts.newMagazine.position.copy(magazineStart);
    parts.newMagazine.rotation.x = -0.18;
    parts.newMagazine.visible = false;
  }
  if (parts.supportHand) parts.supportHand.visible = false;
  parts.slideParts.forEach((part) => { part.position.z = part.userData.restZ; });
  reloading = false;
  reloadElapsed = 0;
  document.body.dataset.reloadPhase = "ready";
  document.body.dataset.reloadRemaining = "";
}

function applyReloadPose(sample) {
  const parts = weaponMesh.userData.parts;
  weaponMesh.position.set(
    weaponRestPosition.x - sample.weaponTilt * 0.055,
    weaponRestPosition.y - sample.weaponLower,
    weaponRestPosition.z + sample.weaponTilt * 0.035,
  );
  weaponMesh.rotation.set(
    weaponRestRotation.x + sample.weaponTilt * 0.38,
    weaponRestRotation.y - sample.weaponTilt * 0.16,
    weaponRestRotation.z - sample.weaponTilt * 0.72,
  );

  parts.oldMagazine.visible = sample.oldMagazineVisible;
  parts.oldMagazine.position.lerpVectors(magazineSocket, magazineEjected, sample.magazineOut);
  if (parts.newMagazine) {
    parts.newMagazine.visible = sample.newMagazineVisible;
    parts.newMagazine.position.lerpVectors(magazineStart, magazineSocket, sample.magazineIn);
  }
  if (parts.supportHand) {
    parts.supportHand.visible = sample.supportHandVisible;
    const handTarget = sample.progress < 0.34
      ? supportHandCatch
      : reloadHandTarget.copy(parts.newMagazine.position).add(supportHandOffset);
    parts.supportHand.position.lerpVectors(supportHandStart, handTarget, sample.supportHandReach);
    parts.supportHand.rotation.set(-0.25, 0.1, 0.24 - sample.magazineIn * 0.28);
  }
  parts.slideParts.forEach((part) => {
    part.position.z = part.userData.restZ + sample.slideOffset;
  });
}

function cancelReload() {
  if (!reloading) return false;
  resetReloadPose();
  return true;
}

function updateReload(realDelta) {
  if (!reloading) return;
  const previousElapsed = reloadElapsed;
  reloadElapsed = Math.min(RELOAD_DURATION, reloadElapsed + realDelta);
  const sample = sampleReloadTimeline(reloadElapsed);
  applyReloadPose(sample);
  document.body.dataset.reloadPhase = sample.phase;
  document.body.dataset.reloadRemaining = (RELOAD_DURATION - reloadElapsed).toFixed(2);

  if (crossedReloadCue(previousElapsed, reloadElapsed, 0.18)) playTone("magOut");
  if (crossedReloadCue(previousElapsed, reloadElapsed, 0.58)) playTone("magIn");
  if (crossedReloadCue(previousElapsed, reloadElapsed, 0.72)) playTone("slide");

  if (sample.complete) {
    ammo = 6;
    resetReloadPose();
    updateHud();
  }
}

resetReloadPose();

function createIntroBullet() {
  const direction = new THREE.Vector3(0.16, -0.01, 1).normalize();
  const bullet = createEnemyBullet(new THREE.Vector3(0.34, 1.72, 5.9), direction, true);
  bullet.mesh.scale.setScalar(1.18);
}

function createEnemyBullet(position, direction, decorative = false) {
  const mesh = new THREE.Mesh(enemyBulletGeometry, bulletMaterial);
  mesh.position.copy(position);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  mesh.castShadow = true;
  scene.add(mesh);
  const halo = new THREE.PointLight(palette.danger, decorative ? 0.65 : 1.15, decorative ? 0.9 : 1.35, 2);
  mesh.add(halo);
  const bullet = {
    mesh,
    direction: direction.clone().normalize(),
    speed: decorative ? 3.8 : 7.2,
    life: 8,
    decorative,
    nearMiss: false,
    dodged: false,
    previousDistance: Infinity,
  };
  bullets.push(bullet);
  return bullet;
}

function updateHud() {
  $("hostileCount").textContent = String(enemies.filter((enemy) => enemy.alive).length).padStart(2, "0");
  updateNavigationHud();
  $("ammoSlots").innerHTML = Array.from({ length: 6 }, (_, index) => `<i class="${index < ammo ? "" : "empty"}"></i>`).join("");
}

function updateNavigationHud() {
  const nearest = enemies
    .filter((enemy) => enemy.alive)
    .reduce((distance, enemy) => Math.min(distance, enemy.root.position.distanceTo(player.position)), Infinity);
  const distanceLabel = Number.isFinite(nearest) ? ` / ${String(Math.ceil(nearest)).padStart(2, "0")}M` : "";
  $("waveLabel").textContent = `${waveInfo[wave].name} / 0${wave + 1} OF 04${distanceLabel}`;
}

function requestPlay() {
  if (isCoarse) return;
  initAudio();
  const lockRequest = canvas.requestPointerLock();
  if (lockRequest && typeof lockRequest.then === "function") {
    lockRequest.then(() => {
      if (document.pointerLockElement === canvas) beginPlay();
    }).catch(() => showToast("POINTER LOCK REQUIRED"));
  }
}

function beginPlay() {
  if (mode === "intro" || mode === "paused") {
    const firstStart = mode === "intro";
    if (firstStart) {
      blacksiteWorld?.setIntroMode(false);
      weaponMesh.visible = hasWeapon;
      if (enemies.length === 0) spawnWave(0, true);
    }
    mode = "playing";
    $("startOverlay").classList.add("hidden");
    if (firstStart) elapsed = 0;
    playTone(firstStart ? "start" : "wave");
  }
}

function clearTransientCombat({ repairGlass = false } = {}) {
  bullets.forEach((bullet) => scene.remove(bullet.mesh));
  bullets.length = 0;
  fragments.forEach((fragment) => {
    scene.remove(fragment.mesh);
    world.removeBody(fragment.body);
    fragment.dispose?.();
  });
  fragments.length = 0;
  trails.forEach((trail) => {
    scene.remove(trail.mesh);
    trail.mesh.material.dispose();
  });
  trails.length = 0;
  bursts.forEach((spark) => {
    scene.remove(spark.mesh);
    if (!spark.light) spark.mesh.material.dispose();
  });
  bursts.length = 0;
  if (repairGlass) {
    glassPanels.forEach((panel) => {
      panel.broken = false;
      panel.mesh.visible = true;
      panel.obstacle.active = true;
    });
  }
  if (thrownWeapon) {
    scene.remove(thrownWeapon.mesh);
    world.removeBody(thrownWeapon.body);
    thrownWeapon = null;
  }
  scheduler.clear();
}

function addCombatFragment(fragment) {
  while (fragments.length >= MAX_COMBAT_FRAGMENTS) {
    const oldest = fragments.shift();
    scene.remove(oldest.mesh);
    world.removeBody(oldest.body);
    oldest.dispose?.();
  }
  world.addBody(fragment.body);
  fragments.push(fragment);
}

function resetGame() {
  clearTransientCombat({ repairGlass: true });

  player.position.set(0, 1.7, 8.2);
  yaw = 0;
  pitch = -0.02;
  lookController.reset({ yaw, pitch });
  camera.position.copy(player.position);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
  ammo = 6;
  shots = 0;
  hits = 0;
  combo = 0;
  bestCombo = 0;
  kills = 0;
  dodges = 0;
  elapsed = 0;
  impactEnergy = 0;
  hasWeapon = true;
  resetReloadPose();
  weaponMesh.visible = false;
  wavePending = false;
  checkpoint = null;
  $("messageLayer").classList.add("hidden");
  document.querySelector(".intro-copy h1").textContent = "BLACKSITE";
  $("startButton").querySelector("span").textContent = "进入设施";
  removeAllEnemies();
  blacksiteWorld?.setIntroMode(true);
  applyWavePower(0);
  mode = "intro";
  $("startOverlay").classList.remove("hidden");
  updateHud();
}

function restartFromCheckpoint() {
  if (!checkpoint) {
    resetGame();
    return;
  }
  const snapshot = checkpoint;
  clearTransientCombat({ repairGlass: true });
  removeAllEnemies();
  player.position.copy(snapshot.position);
  player.velocity.set(0, 0, 0);
  yaw = snapshot.yaw;
  pitch = snapshot.pitch;
  lookController.reset({ yaw, pitch });
  camera.position.copy(player.position);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
  ammo = 6;
  kills = snapshot.kills;
  shots = snapshot.shots;
  hits = snapshot.hits;
  dodges = snapshot.dodges;
  elapsed = snapshot.elapsed;
  combo = 0;
  impactEnergy = 0;
  hasWeapon = true;
  resetReloadPose();
  weaponMesh.visible = true;
  wavePending = false;
  blacksiteWorld?.setIntroMode(false);
  $("messageLayer").classList.add("hidden");
  $("startOverlay").classList.add("hidden");
  mode = "paused";
  spawnWave(snapshot.wave, true);
  updateHud();
}

function shoot() {
  if (mode !== "playing" || document.pointerLockElement !== canvas || reloading || !hasWeapon) return;
  if (ammo <= 0) {
    reload();
    return;
  }
  ammo -= 1;
  shots += 1;
  updateHud();
  playTone("shot");
  weaponMesh.position.z += 0.11;
  window.setTimeout(() => { weaponMesh.position.z = weaponRestPosition.z; }, 55);
  shake = Math.max(shake, 0.035);

  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const targets = [...enemyTargets, ...glassPanels.filter((panel) => !panel.broken).map((panel) => panel.mesh), ...occlusionTargets];
  const intersections = raycaster.intersectObjects(targets, false);
  const start = new THREE.Vector3();
  camera.getWorldPosition(start);
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  let end = start.clone().add(direction.multiplyScalar(32));

  if (intersections.length) {
    const intersection = intersections[0];
    end = intersection.point.clone();
    if (intersection.object.userData.enemyRoot) {
      const enemy = intersection.object.userData.enemyRoot.userData.enemy;
      if (enemy?.alive) killEnemy(enemy, intersection.point, direction, "shot", intersection.object.userData.hitZone);
    } else if (intersection.object.userData.glass) {
      const panel = glassPanels.find((item) => item.mesh === intersection.object);
      if (panel) shatterGlass(panel, intersection.point, direction);
    }
  } else {
    combo = 0;
  }
  createTrail(start, end, palette.cyan);
}

function reload() {
  if (reloading || ammo === 6 || !hasWeapon || mode !== "playing") return;
  reloading = true;
  reloadElapsed = 0;
  showToast(`RELOADING / ${RELOAD_DURATION.toFixed(2)} SEC`);
  playTone("reload");
  applyReloadPose(sampleReloadTimeline(0));
}

function throwWeapon() {
  if (mode !== "playing" || !hasWeapon || document.pointerLockElement !== canvas) return;
  cancelReload();
  hasWeapon = false;
  weaponMesh.visible = false;
  showToast("SIDEARM THROWN");
  playTone("throw");

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const mesh = buildPistolModel(false);
  mesh.position.copy(camera.position).add(forward.clone().multiplyScalar(0.75));
  mesh.castShadow = true;
  scene.add(mesh);
  const body = new CANNON.Body({ mass: 1.2, shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.15, 0.41)) });
  body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  body.velocity.set(forward.x * 18, forward.y * 18 + 2, forward.z * 18);
  body.angularVelocity.set(10, 4, 7);
  world.addBody(body);
  thrownWeapon = { mesh, body, life: 2.2, struck: new Set() };
}

function createTrail(start, end, color) {
  const distance = start.distanceTo(end);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 });
  const mesh = new THREE.Mesh(trailGeometry, mat);
  mesh.scale.y = distance;
  mesh.position.copy(start).lerp(end, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  scene.add(mesh);
  trails.push({ mesh, life: 0.12 });
}

function killEnemy(enemy, point, forceDirection, source = "shot", hitZone = "torso") {
  if (!enemy.alive) return;
  enemy.alive = false;
  if (source === "shot") hits += 1;
  kills += 1;
  combo += 1;
  bestCombo = Math.max(bestCombo, combo);
  const headshot = source === "shot" && hitZone === "head";
  hitStop = headshot ? 0.15 : 0.105;
  impactEnergy = 1;
  shake = Math.max(shake, headshot ? 0.2 : 0.16);
  playTone("shatter");
  audioEngine?.playKill({ combo, headshot, source });
  triggerKillFeedback(source, hitZone);
  createSparkBurst(point);
  $("crosshair").classList.add("hit");
  $("crosshair").classList.toggle("headshot", headshot);
  window.setTimeout(() => $("crosshair").classList.remove("hit", "headshot"), 150);

  enemy.parts.forEach((part, index) => {
    part.userData.enemyRoot = null;
    if (!isDeathFragmentIndex(index)) {
      enemy.root.remove(part);
      return;
    }
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    part.getWorldPosition(position);
    part.getWorldQuaternion(quaternion);
    enemy.root.remove(part);
    scene.add(part);
    part.position.copy(position);
    part.quaternion.copy(quaternion);

    const size = index === 0 ? new CANNON.Vec3(0.4, 0.5, 0.22) : new CANNON.Vec3(0.16, 0.24, 0.16);
    const body = new CANNON.Body({ mass: index === 0 ? 1.1 : 0.42, shape: new CANNON.Box(size) });
    body.position.set(position.x, position.y, position.z);
    body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    body.velocity.set(
      forceDirection.x * 4 + (Math.random() - 0.5) * 4,
      2.5 + Math.random() * 4,
      forceDirection.z * 4 + (Math.random() - 0.5) * 4,
    );
    body.angularVelocity.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
    addCombatFragment({ mesh: part, body, life: 5.5 + Math.random() * 2 });
  });
  scene.remove(enemy.root);
  enemyTargets.splice(0, enemyTargets.length, ...enemyTargets.filter((mesh) => mesh.userData.enemyRoot));
  updateHud();

  if (!enemies.some((item) => item.alive) && !wavePending) {
    wavePending = true;
    scheduler.schedule(0.9, () => {
      if (wave < waves.length - 1) spawnWave(wave + 1);
      else completeGame();
    }, "wave-transition");
  }
}

function triggerKillFeedback(source, hitZone = "torso") {
  const headshot = source === "shot" && hitZone === "head";
  const word = source === "throw"
    ? "IMPACT"
    : headshot
      ? "HEADSHOT"
      : combo >= 4
        ? "QUAD"
        : combo === 3
          ? "TRIPLE"
          : combo === 2
            ? "DOUBLE"
            : "CONFIRMED";
  const detail = source === "throw" ? "KINETIC STRIKE" : headshot ? "CRANIAL HIT" : hitZone === "limb" ? "LIMB HIT" : "CENTER MASS";
  const feedback = $("killFeedback");
  feedback.classList.toggle("headshot", headshot);
  feedback.dataset.streak = String(Math.min(combo, 5));
  $("impactRing").classList.toggle("headshot", headshot);
  $("killWord").textContent = word;
  $("killMeta").textContent = `TARGET ${String(kills).padStart(2, "0")} // ${detail}`;
  $("comboValue").textContent = `×${combo}`;
  ["killFeedback", "impactRing"].forEach((id) => {
    $(id).classList.remove("show");
    void $(id).offsetWidth;
    $(id).classList.add("show");
  });
  if (combo > 1) {
    $("comboReadout").classList.remove("show");
    void $("comboReadout").offsetWidth;
    $("comboReadout").classList.add("show");
  }
}

function createSparkBurst(point) {
  for (let index = 0; index < 14; index += 1) {
    const mesh = new THREE.Mesh(sparkGeometry, sparkBaseMaterial.clone());
    mesh.scale.setScalar(0.025 + Math.random() * 0.055);
    mesh.position.copy(point);
    scene.add(mesh);
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.25) * 6,
      (Math.random() - 0.5) * 7,
    );
    bursts.push({ mesh, velocity, life: 0.42 + Math.random() * 0.34, maxLife: 0.76 });
  }
  const light = new THREE.PointLight(palette.amber, 10, 4, 2);
  light.position.copy(point);
  scene.add(light);
  bursts.push({ mesh: light, velocity: new THREE.Vector3(), life: 0.16, maxLife: 0.16, light: true });
}

function shatterGlass(panel, point, forceDirection) {
  if (panel.broken) return;
  panel.broken = true;
  panel.obstacle.active = false;
  panel.mesh.visible = false;
  playTone("glass");
  shake = Math.max(shake, 0.08);
  const base = panel.mesh.position;
  for (let x = -2; x <= 2; x += 1) {
    for (let y = -2; y <= 2; y += 1) {
      const geometry = new THREE.BoxGeometry(panel.size.x / 5.6, panel.size.y / 5.6, 0.045);
      const materialInstance = panel.mesh.material.clone();
      const mesh = new THREE.Mesh(geometry, materialInstance);
      mesh.position.set(base.x + x * panel.size.x / 5.3, base.y + y * panel.size.y / 5.3, base.z);
      mesh.rotation.y = panel.mesh.rotation.y;
      scene.add(mesh);
      const body = new CANNON.Body({ mass: 0.08, shape: new CANNON.Box(new CANNON.Vec3(panel.size.x / 11.2, panel.size.y / 11.2, 0.025)) });
      body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
      body.velocity.set(forceDirection.x * 4 + (Math.random() - 0.5) * 3, Math.random() * 3, forceDirection.z * 4 + (Math.random() - 0.5) * 3);
      body.angularVelocity.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
      addCombatFragment({
        mesh,
        body,
        life: 4 + Math.random() * 2,
        dispose() {
          geometry.dispose();
          materialInstance.dispose();
        },
      });
    }
  }
}

function enemyShoot(enemy) {
  const origin = new THREE.Vector3();
  enemy.root.getWorldPosition(origin);
  origin.y += 1.75;
  const prediction = player.position.clone().add(player.velocity.clone().multiplyScalar(0.28));
  const direction = prediction.sub(origin).normalize();
  createEnemyBullet(origin, direction);
  createTrail(origin, origin.clone().add(direction.clone().multiplyScalar(0.9)), palette.danger);
  enemy.muzzleEnergy = 1;
  enemy.muzzle.visible = true;
  playTone("enemy");
}

function updatePlayer(realDelta) {
  ({ yaw, pitch } = lookController.update(realDelta));
  const forwardInput = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
  const sideInput = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  const inputLength = Math.min(1, Math.hypot(forwardInput, sideInput));
  timeScale = THREE.MathUtils.clamp(0.025 + inputLength * 0.88 + mouseEnergy * 0.64, 0.025, 1);
  mouseEnergy = Math.max(0, mouseEnergy - realDelta * 3.2);

  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  player.velocity.set(0, 0, 0).addScaledVector(forward, forwardInput).addScaledVector(right, sideInput);
  if (player.velocity.lengthSq() > 1) player.velocity.normalize();
  const movement = player.velocity.clone().multiplyScalar(realDelta * 4.3);
  const resolved = resolvePlayerMovement(
    { x: player.position.x, z: player.position.z },
    { x: movement.x, z: movement.z },
    0.34,
    obstacles,
  );
  player.position.x = THREE.MathUtils.clamp(resolved.x, -10.2, 10.2);
  player.position.z = THREE.MathUtils.clamp(resolved.z, -124, 15);
  player.position.y = 1.7;
  camera.position.copy(player.position);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
}

function updateEnemies(worldDelta, realTime, realDelta) {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const position = enemy.root.position;
    const targetAngle = Math.atan2(player.position.x - position.x, player.position.z - position.z);
    enemy.root.rotation.y = THREE.MathUtils.lerp(enemy.root.rotation.y, targetAngle, worldDelta * 2.2);
    enemy.root.position.y = Math.sin(realTime * 1.7 + enemy.pulse) * 0.025;
    enemy.shotTimer -= worldDelta;
    const warning = THREE.MathUtils.clamp(1 - enemy.shotTimer / 0.46, 0, 1);
    enemy.signal.scale.setScalar(1 + warning * 0.7);
    if (warning > 0 && !enemy.warningTriggered) {
      enemy.warningTriggered = true;
      playTone("warning");
    }
    if (enemy.muzzleEnergy > 0) {
      enemy.muzzleEnergy = Math.max(0, enemy.muzzleEnergy - realDelta * 12);
      enemy.muzzle.scale.setScalar(0.8 + enemy.muzzleEnergy * 2.4);
      enemy.muzzleLight.intensity = enemy.muzzleEnergy * 8;
      enemy.muzzle.visible = enemy.muzzleEnergy > 0;
    }
    if (enemy.shotTimer <= 0) {
      enemyShoot(enemy);
      enemy.shotTimer = (2.2 + Math.random() * 1.5) * waveInfo[wave].fire;
      enemy.warningTriggered = false;
    }
  });
}

function updateBullets(worldDelta) {
  for (let index = bullets.length - 1; index >= 0; index -= 1) {
    const bullet = bullets[index];
    const previousPosition = bullet.mesh.position.clone();
    bullet.mesh.position.addScaledVector(bullet.direction, bullet.speed * worldDelta);
    bullet.life -= worldDelta;
    if (!bullet.decorative) {
      const obstacle = obstacles.find((candidate) =>
        candidate.active &&
        bullet.mesh.position.y >= candidate.minY &&
        bullet.mesh.position.y <= candidate.maxY &&
        segmentIntersectsAabb(
          { x: previousPosition.x, z: previousPosition.z },
          { x: bullet.mesh.position.x, z: bullet.mesh.position.z },
          candidate,
        ));
      if (obstacle) {
        if (obstacle.type === "glass") {
          shatterGlass(obstacle.owner, bullet.mesh.position, bullet.direction);
        } else {
          playTone("glass");
          createSparkBurst(bullet.mesh.position);
        }
        scene.remove(bullet.mesh);
        bullets.splice(index, 1);
        continue;
      }
    }
    const playerDistance = bullet.mesh.position.distanceTo(player.position);
    if (!bullet.decorative && playerDistance < 0.42) {
      failGame();
      return;
    }
    if (!bullet.decorative && !bullet.dodged) {
      if (playerDistance < 1.15) bullet.nearMiss = true;
      if (bullet.nearMiss && playerDistance > bullet.previousDistance && playerDistance > 0.7) {
        bullet.dodged = true;
        dodges += 1;
        triggerNearMiss(bullet.mesh.position.x < player.position.x ? -0.7 : 0.7);
      }
      bullet.previousDistance = playerDistance;
    }
    if (bullet.life <= 0 || isProjectileOutOfBounds(bullet.mesh.position)) {
      scene.remove(bullet.mesh);
      bullets.splice(index, 1);
    }
  }
}

function updateThrownWeapon(worldDelta, realDelta) {
  if (!thrownWeapon) return;
  const { mesh, body, struck } = thrownWeapon;
  mesh.position.set(body.position.x, body.position.y, body.position.z);
  mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
  thrownWeapon.life -= realDelta;

  enemies.forEach((enemy) => {
    if (enemy.alive && !struck.has(enemy) && mesh.position.distanceTo(enemy.root.position.clone().add(new THREE.Vector3(0, 1.4, 0))) < 0.95) {
      struck.add(enemy);
      killEnemy(enemy, mesh.position, new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z).normalize(), "throw");
    }
  });
  glassPanels.forEach((panel) => {
    if (!panel.broken && mesh.position.distanceTo(panel.mesh.position) < Math.max(panel.size.x, panel.size.y) * 0.56) {
      shatterGlass(panel, mesh.position, new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z).normalize());
    }
  });

  if (thrownWeapon.life <= 0) {
    scene.remove(mesh);
    world.removeBody(body);
    thrownWeapon = null;
    hasWeapon = true;
    weaponMesh.visible = true;
    showToast("SIDEARM RECALLED");
  }
}

function updatePhysics(worldDelta) {
  world.step(1 / 60, Math.min(worldDelta, 0.05), 3);
  for (let index = fragments.length - 1; index >= 0; index -= 1) {
    const fragment = fragments[index];
    fragment.mesh.position.set(fragment.body.position.x, fragment.body.position.y, fragment.body.position.z);
    fragment.mesh.quaternion.set(fragment.body.quaternion.x, fragment.body.quaternion.y, fragment.body.quaternion.z, fragment.body.quaternion.w);
    fragment.life -= worldDelta;
    if (fragment.life <= 0 || fragment.body.position.y < -4) {
      scene.remove(fragment.mesh);
      world.removeBody(fragment.body);
      fragment.dispose?.();
      fragments.splice(index, 1);
    }
  }
}

function updateTrails(realDelta) {
  for (let index = trails.length - 1; index >= 0; index -= 1) {
    const trail = trails[index];
    trail.life -= realDelta;
    trail.mesh.material.opacity = Math.max(0, trail.life / 0.12);
    if (trail.life <= 0) {
      scene.remove(trail.mesh);
      trail.mesh.material.dispose();
      trails.splice(index, 1);
    }
  }
}

function updateBursts(realDelta) {
  for (let index = bursts.length - 1; index >= 0; index -= 1) {
    const spark = bursts[index];
    spark.life -= realDelta;
    if (!spark.light) {
      spark.velocity.y -= realDelta * 4;
      spark.mesh.position.addScaledVector(spark.velocity, realDelta);
      spark.mesh.material.opacity = Math.max(0, spark.life / spark.maxLife);
    } else {
      spark.mesh.intensity = Math.max(0, 10 * spark.life / spark.maxLife);
    }
    if (spark.life <= 0) {
      scene.remove(spark.mesh);
      if (!spark.light) spark.mesh.material.dispose();
      bursts.splice(index, 1);
    }
  }
}

function triggerNearMiss(pan) {
  $("nearMiss").classList.remove("show");
  void $("nearMiss").offsetWidth;
  $("nearMiss").classList.add("show");
  playWhiz(pan);
}

function failGame() {
  if (mode !== "playing") return;
  mode = "failed";
  document.exitPointerLock?.();
  $("damageFlash").classList.remove("active");
  void $("damageFlash").offsetWidth;
  $("damageFlash").classList.add("active");
  $("messageKicker").textContent = "SIGNAL LOST / TIMELINE COLLAPSED";
  $("messageTitle").textContent = "时间击中了你";
  $("messageBody").textContent = `推进到 ${waveInfo[wave].name} · ${kills}/10 击杀 · 命中率 ${shots ? Math.round(hits / shots * 100) : 0}%`;
  $("restartButton").textContent = "从检查点继续";
  window.setTimeout(() => $("messageLayer").classList.remove("hidden"), 260);
  playTone("fail");
}

function completeGame() {
  if (mode !== "playing") return;
  mode = "complete";
  document.exitPointerLock?.();
  const accuracy = shots ? Math.round(hits / shots * 100) : 0;
  const rating = accuracy >= 78 && elapsed < 90 ? "S" : accuracy >= 58 && elapsed < 125 ? "A" : "B";
  $("messageKicker").textContent = "TIMELINE SECURED / ALL SIGNALS CLEAR";
  $("messageTitle").textContent = "零号展厅已清空";
  $("messageBody").textContent = `${elapsed.toFixed(1)} 秒 · ${kills}/10 击杀 · ${accuracy}% 命中率 · ${dodges} 次闪避 · 评级 ${rating}`;
  $("restartButton").textContent = "重新切入时间线";
  $("messageLayer").classList.remove("hidden");
  playTone("complete");
}

function showToast(text) {
  $("toast").textContent = text;
  $("toast").classList.remove("show");
  void $("toast").offsetWidth;
  $("toast").classList.add("show");
}

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioEngine = createGameAudio(audioContext);
  }
  if (audioContext.state === "suspended") audioContext.resume();
}

function playTone(type, options) {
  audioEngine?.play(type, options);
}

function playWhiz(pan) {
  audioEngine?.whiz(pan);
}

function animate() {
  const schedulerDelta = Math.min(clock.getDelta(), 1);
  const realDelta = Math.min(schedulerDelta, 0.05);
  const realTime = clock.elapsedTime;

  if ((mode === "intro" || mode === "paused") && document.pointerLockElement === canvas) {
    beginPlay();
  }

  if (mode === "intro") {
    timeScale = 0.02;
    if (isCoarse) {
      camera.position.set(-2.7 + Math.sin(realTime * 0.1) * 0.18, 1.72, 0.9 + Math.cos(realTime * 0.1) * 0.12);
      camera.lookAt(0.5, 3.35, -14.7);
    } else {
      camera.position.set(-2.85 + Math.sin(realTime * 0.12) * 0.05, 1.62 + Math.cos(realTime * 0.14) * 0.018, -0.25);
      camera.lookAt(0.2, 3.55, -14.7);
    }
  } else if (mode === "playing") {
    elapsed += realDelta;
    updatePlayer(realDelta);
    updateReload(realDelta);
    if (hitStop > 0) {
      hitStop -= realDelta;
      timeScale = 0.004;
    }
    const worldDelta = realDelta * timeScale;
    updateEnemies(worldDelta, realTime, realDelta);
    updateBullets(worldDelta);
    updatePhysics(worldDelta);
    updateThrownWeapon(worldDelta, realDelta);
    scheduler.update(schedulerDelta);
  } else {
    timeScale = 0.008;
    updatePhysics(realDelta * timeScale);
  }

  updateTrails(realDelta);
  updateBursts(realDelta);
  navigationHudTimer -= realDelta;
  if (navigationHudTimer <= 0) {
    navigationHudTimer = 0.2;
    updateNavigationHud();
  }
  blacksiteWorld?.update(realTime, mode === "playing" ? realDelta * timeScale : realDelta * 0.08, player.position, realDelta);
  const restingFov = mode === "intro" ? 58 : 68;
  const restingBloom = mode === "intro" ? 0.9 : 0.72;
  if (impactEnergy > 0) {
    impactEnergy = Math.max(0, impactEnergy - realDelta * 4.4);
    camera.fov = 68 + impactEnergy * 9;
    bloomPass.strength = 0.72 + impactEnergy * 1.4;
    camera.updateProjectionMatrix();
  } else if (camera.fov !== restingFov || bloomPass.strength !== restingBloom) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, restingFov, realDelta * 9);
    bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, restingBloom, realDelta * 8);
    camera.updateProjectionMatrix();
  }
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    shake = Math.max(0, shake - realDelta * 1.7);
  }
  $("timeLabel").textContent = mode === "intro"
    ? "FRACTURE READY"
    : `FRACTURE ${String(Math.round(timeScale * 100)).padStart(2, "0")}%`;
  $("timeDot").style.opacity = String(0.35 + timeScale * 0.65);
  document.body.dataset.gameMode = mode;
  composer.render();
  adaptiveResolution.sample(schedulerDelta);
  requestAnimationFrame(animate);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(adaptiveResolution.pixelRatio());
  composer.setPixelRatio(adaptiveResolution.pixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onResize);
window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyR") reload();
  if (event.code === "KeyQ") throwWeapon();
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas || mode !== "playing") return;
  lookController.ingest({ movementX: event.movementX, movementY: event.movementY, now: performance.now() });
  const cappedMovement = Math.min(180, Math.hypot(event.movementX, event.movementY));
  mouseEnergy = Math.min(1, mouseEnergy + cappedMovement * 0.018);
});
window.addEventListener("mousedown", (event) => {
  if (event.button === 0) shoot();
});
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    lookController.lock(performance.now());
    beginPlay();
  }
  else {
    lookController.unlock();
    keys.clear();
    if (mode === "playing") {
      mode = "paused";
      document.querySelector(".intro-copy h1").textContent = "任务暂停";
      $("startButton").querySelector("span").textContent = "返回设施";
      $("startOverlay").classList.remove("hidden");
    }
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && document.pointerLockElement === canvas) document.exitPointerLock?.();
});

$("startButton").addEventListener("click", requestPlay);
const lookLevelButtons = [...document.querySelectorAll("[data-look-level]")];
function renderLookLevel(level) {
  document.body.dataset.lookLevel = level;
  lookLevelButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lookLevel === level)));
}
lookLevelButtons.forEach((button) => button.addEventListener("click", () => {
  const level = lookSettings.save(button.dataset.lookLevel);
  lookController.setLevel(level);
  renderLookLevel(level);
}));
renderLookLevel(lookSettings.value());
if (window.__FRAME_ZERO_QA__) {
  window.__FRAME_ZERO_QA__.lookState = () => ({ yaw, pitch, ...lookController.state() });
  window.__FRAME_ZERO_QA__.rearmLookWarmup = () => lookController.lock(performance.now());
  window.__FRAME_ZERO_QA__.state = () => ({
    mode,
    wave,
    alive: enemies.filter((enemy) => enemy.alive).length,
    kills,
    fragments: fragments.length,
    bursts: bursts.length,
    trails: trails.length,
    physicsBodies: world.bodies.length,
    wavePending,
  });
  window.__FRAME_ZERO_QA__.start = () => beginPlay();
  window.__FRAME_ZERO_QA__.spawnWave = (index) => spawnWave(index, true);
  window.__FRAME_ZERO_QA__.killAlive = () => {
    enemies.filter((enemy) => enemy.alive).forEach((enemy) => {
      const point = enemy.root.position.clone().add(new THREE.Vector3(0, 1.5, 0));
      killEnemy(enemy, point, new THREE.Vector3(0, 0, -1), "shot", "torso");
    });
  };
}
$("restartButton").addEventListener("click", () => {
  if (mode === "complete") resetGame();
  else restartFromCheckpoint();
  requestPlay();
});

blacksiteWorld = buildBlacksiteWorld({ THREE, scene, addBox });
applyWavePower(0);
blacksiteWorld.setIntroMode(true);
weaponMesh.visible = false;
removeAllEnemies();
updateHud();
animate();
