
function enhanceModelDetails(mesh, name) {
  if (!mesh) return;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (mesh.material) {
    mesh.material.roughness = 0.45;
    mesh.material.metalness = 0.25;
  }
}

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createAssetDefinition } from "../assets/asset-catalog.js";

const VIEW_PRESETS = {
  isometric: { position: [5.4, 5.2, 6.8], target: [0, 0.75, -0.35] },
  top: { position: [0.01, 8.6, 0.01], target: [0, 0, -0.35] },
  front: { position: [0, 2.5, 7.4], target: [0, 1.0, -0.5] },
};

const COLORS = {
  floor: 0x111a1e,
  wall: 0x172125,
  wallEdge: 0x5eb8c2,
  grid: 0x365157,
  signal: 0x5eb8c2,
  warning: 0xd9b85d,
  neutral: 0x829294,
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.18,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
  });
}

function addBox(group, dimensions, position, color, options) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z),
    material(color, options),
  );
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = group.userData.renderProfile?.castShadows !== false;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addCylinder(group, radiusTop, radiusBottom, height, position, color, radialSegments) {
  const segments = radialSegments || group.userData.renderProfile?.radialSegments || 14;
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material(color, { metalness: 0.28 }),
  );
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = group.userData.renderProfile?.castShadows !== false;
  group.add(mesh);
  return mesh;
}

function createTable(group, dimensions, color) {
  addBox(group, { x: dimensions.width, y: 0.08, z: dimensions.depth }, { x: 0, y: dimensions.height / 2 - 0.04, z: 0 }, color);
  const legHeight = Math.max(0.18, dimensions.height - 0.08);
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    addBox(group, { x: 0.055, y: legHeight, z: 0.055 }, {
      x: x * (dimensions.width / 2 - 0.09), y: -0.04, z: z * (dimensions.depth / 2 - 0.09),
    }, 0x4c5b5e, { metalness: 0.5 });
  }
}

function createRack(group, dimensions, color) {
  const top = dimensions.height / 2 - 0.09;
  for (const x of [-1, 1]) {
    addCylinder(group, 0.022, 0.022, dimensions.height - 0.1, { x: x * (dimensions.width / 2 - 0.05), y: 0, z: 0 }, color, 10);
  }
  const rail = addCylinder(group, 0.025, 0.025, dimensions.width - 0.1, { x: 0, y: top, z: 0 }, color, 10);
  rail.rotation.z = Math.PI / 2;
  addBox(group, { x: dimensions.width, y: 0.045, z: dimensions.depth }, { x: 0, y: -dimensions.height / 2 + 0.04, z: 0 }, 0x39474a, { metalness: 0.35 });
  for (let index = -2; index <= 2; index += 1) {
    const garment = addBox(group, { x: 0.18, y: dimensions.height * 0.42, z: 0.028 }, {
      x: index * dimensions.width * 0.12, y: dimensions.height * 0.08, z: 0,
    }, index % 2 ? 0x6a7a7c : 0x4e6669, { roughness: 0.88 });
    garment.rotation.z = index * 0.025;
  }
}

function createPresenter(group, dimensions, color) {
  addCylinder(group, dimensions.width * 0.22, dimensions.width * 0.28, dimensions.height * 0.62, { x: 0, y: -dimensions.height * 0.13, z: 0 }, color, 24);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(dimensions.width * 0.25, group.userData.renderProfile?.radialSegments || 14, 10),
    material(0xe1b997, { roughness: 0.92 }),
  );
  head.position.y = dimensions.height * 0.33;
  head.castShadow = true;
  group.add(head);
  const clearance = new THREE.Mesh(
    new THREE.CylinderGeometry(dimensions.width * 0.64, dimensions.width * 0.64, 0.02, 32),
    new THREE.MeshBasicMaterial({ color: COLORS.warning, transparent: true, opacity: 0.12, depthWrite: false }),
  );
  clearance.position.y = -dimensions.height / 2 + 0.015;
  group.add(clearance);
}

function createStand(group, dimensions) {
  addCylinder(group, 0.018, 0.025, dimensions.height * 0.78, { x: 0, y: -dimensions.height * 0.08, z: 0 }, 0x526165, 10);
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI * 2 / 3) {
    const leg = addCylinder(group, 0.012, 0.012, dimensions.width * 0.85, { x: 0, y: -dimensions.height * 0.43, z: 0 }, 0x465457, 8);
    leg.rotation.z = Math.PI / 3;
    leg.rotation.y = angle;
  }
}

function createLight(group, dimensions, color) {
  createStand(group, dimensions);
  addBox(group, { x: dimensions.width, y: dimensions.width * 0.58, z: dimensions.depth }, {
    x: 0, y: dimensions.height * 0.38, z: 0,
  }, color, { roughness: 0.35, metalness: 0.22 });
  addBox(group, { x: dimensions.width * 0.82, y: dimensions.width * 0.42, z: 0.012 }, {
    x: 0, y: dimensions.height * 0.38, z: -dimensions.depth / 2 - 0.007,
  }, 0xffd9b2, { roughness: 0.2, metalness: 0, transparent: true, opacity: 0.82 });
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(dimensions.width * 0.95, dimensions.height * 1.25, group.userData.renderProfile?.radialSegments || 14, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: group.userData.renderProfile?.visibleLightCones === "all" ? 0.05 : 0.009, side: THREE.DoubleSide, depthWrite: false }),
  );
  cone.name = "planning-light-cone";
  cone.userData.lightCone = true;
  // The cone must open away from the fixture: apex at the light head, base toward the floor.
  cone.rotation.x = Math.PI / 2;
  cone.position.set(0, dimensions.height * 0.38, -dimensions.height * 0.625);
  group.add(cone);
}

function createMonitor(group, dimensions, color) {
  addBox(group, { x: dimensions.width, y: dimensions.height, z: dimensions.depth }, { x: 0, y: 0, z: 0 }, 0x242f32, { metalness: 0.42 });
  addBox(group, { x: dimensions.width * 0.88, y: dimensions.height * 0.78, z: 0.014 }, { x: 0, y: 0.02, z: dimensions.depth / 2 + 0.008 }, color, { transparent: true, opacity: 0.62, roughness: 0.28 });
  addCylinder(group, 0.018, 0.024, dimensions.height * 0.7, { x: 0, y: -dimensions.height * 0.78, z: 0 }, 0x536164, 10);
}

function createCamera(group, dimensions, color) {
  addBox(group, { x: dimensions.width, y: dimensions.height * 0.72, z: dimensions.depth * 0.68 }, { x: 0, y: dimensions.height * 0.08, z: 0 }, 0x263135, { metalness: 0.58 });
  const lens = addCylinder(group, dimensions.height * 0.18, dimensions.height * 0.24, dimensions.depth * 0.4, { x: 0, y: dimensions.height * 0.08, z: -dimensions.depth * 0.5 }, color, 18);
  lens.rotation.x = Math.PI / 2;
  addCylinder(group, 0.025, 0.035, dimensions.height * 1.8, { x: 0, y: -dimensions.height * 1.05, z: 0 }, 0x4b5b5e, 10);
}

function createMarker(group, dimensions, color) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(dimensions.width * 0.34, dimensions.width * 0.5, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  group.add(mesh);
}

function createAssetObject(asset, renderProfile = {}) {
  const group = new THREE.Group();
  group.userData.renderProfile = renderProfile;
  const dimensions = asset.dimensions;
  let definition;
  try { definition = createAssetDefinition(asset.type); } catch { definition = null; }
  const primitive = definition?.visual?.primitive || "box";
  const color = new THREE.Color(definition?.visual?.color || "#829294").getHex();

  if (primitive === "table") createTable(group, dimensions, color);
  else if (primitive === "rack") createRack(group, dimensions, color);
  else if (primitive === "presenter") createPresenter(group, dimensions, color);
  else if (primitive === "light") createLight(group, dimensions, color);
  else if (primitive === "stand") createStand(group, dimensions);
  else if (primitive === "monitor") createMonitor(group, dimensions, color);
  else if (primitive === "camera") createCamera(group, dimensions, color);
  else if (primitive === "marker") createMarker(group, dimensions, color);
  else if (primitive === "orb") {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(dimensions.width / 2, 18, 12), material(color, { transparent: true, opacity: 0.72 }));
    group.add(orb);
  } else {
    addBox(group, { x: dimensions.width, y: dimensions.height, z: dimensions.depth }, { x: 0, y: 0, z: 0 }, color, primitive === "wall" ? { transparent: true, opacity: 0.78 } : {});
  }

  const boundsProxy = new THREE.Mesh(
    new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  boundsProxy.visible = false;
  boundsProxy.userData.nonPickable = true;
  group.add(boundsProxy);

  group.name = asset.name;
  group.userData.assetId = asset.id;
  group.userData.assetType = asset.type;
  group.userData.geometrySignature = JSON.stringify(asset.dimensions);
  group.userData.boundsProxy = boundsProxy;
  group.traverse((child) => { if (!child.userData.nonPickable) child.userData.assetId = asset.id; });
  return group;
}

function boundsTarget(object) {
  return object?.userData?.boundsProxy || object;
}

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach((entry) => entry.dispose?.());
    else child.material?.dispose?.();
  });
}

function createRoom(room) {
  const group = new THREE.Group();
  group.name = "room-envelope";

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(room.width, room.depth),
    material(COLORS.floor, { roughness: 0.94 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const grid = new THREE.GridHelper(Math.max(room.width, room.depth), Math.round(Math.max(room.width, room.depth) * 10), COLORS.grid, COLORS.grid);
  grid.position.y = 0.006;
  grid.material.transparent = true;
  grid.material.opacity = 0.32;
  group.add(grid);

  const back = addBox(group, { x: room.width, y: room.height, z: 0.045 }, { x: 0, y: room.height / 2, z: -room.depth / 2 }, COLORS.wall, { transparent: true, opacity: 0.78 });
  const side = addBox(group, { x: 0.045, y: room.height, z: room.depth }, { x: -room.width / 2, y: room.height / 2, z: 0 }, COLORS.wall, { transparent: true, opacity: 0.6 });
  back.receiveShadow = true;
  side.receiveShadow = true;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(room.width, room.height, room.depth)),
    new THREE.LineBasicMaterial({ color: COLORS.wallEdge, transparent: true, opacity: 0.32 }),
  );
  edges.position.y = room.height / 2;
  group.add(edges);
  group.userData.roomSignature = JSON.stringify(room);
  return group;
}

export function createStudioScene({ canvas, policy = {} }) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError("A canvas element is required");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(policy.pixelRatio || Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x0e1518, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = policy.shadows !== false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1518);
  scene.fog = new THREE.FogExp2(0x0e1518, 0.045);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 50);
  camera.layers.enable(31);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.4;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.screenSpacePanning = false;

  scene.add(new THREE.HemisphereLight(0xb9d9dd, 0x111315, 1.5));
  const key = new THREE.DirectionalLight(0xcbdadd, 2.1);
  key.position.set(3.8, 6.5, 4.5);
  key.castShadow = policy.shadows !== false;
  const shadowMapSize = policy.shadowMapSize || 1024;
  key.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  scene.add(key);
  const cyan = new THREE.PointLight(0x5eb8c2, 9, 8, 2);
  cyan.position.set(-2.2, 2.4, -2.2);
  scene.add(cyan);
  const programKey = new THREE.PointLight(0xffc38f, 15, 9, 1.7);
  programKey.position.set(-2.4, 3.1, 2.2);
  programKey.layers.set(2);
  scene.add(programKey);
  const programRim = new THREE.PointLight(0x75c8d2, 10, 8, 1.9);
  programRim.position.set(2.3, 2.5, -2.1);
  programRim.layers.set(2);
  scene.add(programRim);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const assetObjects = new Map();
  const evidenceGroup = new THREE.Group();
  evidenceGroup.name = "issue-evidence";
  evidenceGroup.layers.set(31);
  scene.add(evidenceGroup);
  let roomObject = null;
  let selectionHelper = null;
  let selectedId = null;
  let currentProject = null;
  let cameraFlight = null;

  controls.addEventListener("start", () => { cameraFlight = null; });

  function setView(mode = "isometric") {
    const preset = VIEW_PRESETS[mode] || VIEW_PRESETS.isometric;
    camera.position.fromArray(preset.position);
    controls.target.fromArray(preset.target);
    controls.update();
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

  function setSelectedAsset(assetId) {
    selectedId = assetObjects.has(assetId) ? assetId : null;
    if (selectionHelper) {
      scene.remove(selectionHelper);
      selectionHelper.geometry?.dispose?.();
      selectionHelper.material?.dispose?.();
      selectionHelper = null;
    }
    for (const [id, object] of assetObjects) {
      object.traverse((child) => {
        if (!child.userData.lightCone) return;
        child.material.opacity = id === selectedId ? 0.14 : policy.geometry?.visibleLightCones === "all" ? 0.045 : 0.008;
      });
    }
    if (!selectedId) return;
    selectionHelper = new THREE.BoxHelper(boundsTarget(assetObjects.get(selectedId)), COLORS.warning);
    selectionHelper.material.transparent = true;
    selectionHelper.material.opacity = 0.92;
    selectionHelper.layers.set(31);
    scene.add(selectionHelper);
  }

  function sync(project) {
    currentProject = project;
    const nextRoomSignature = JSON.stringify(project.room);
    if (!roomObject || roomObject.userData.roomSignature !== nextRoomSignature) {
      if (roomObject) { scene.remove(roomObject); disposeObject(roomObject); }
      roomObject = createRoom(project.room);
      scene.add(roomObject);
    }

    const nextIds = new Set(project.assets.map((asset) => asset.id));
    for (const [id, object] of assetObjects) {
      if (nextIds.has(id)) continue;
      scene.remove(object);
      disposeObject(object);
      assetObjects.delete(id);
    }

    for (const asset of project.assets) {
      const signature = JSON.stringify(asset.dimensions);
      let object = assetObjects.get(asset.id);
      if (!object || object.userData.assetType !== asset.type || object.userData.geometrySignature !== signature) {
        if (object) { scene.remove(object); disposeObject(object); }
        object = createAssetObject(asset, policy.geometry || {});
        assetObjects.set(asset.id, object);
        scene.add(object);
      }
      object.position.set(asset.transform.position.x, asset.transform.position.y, asset.transform.position.z);
      object.rotation.set(asset.transform.rotation.x, asset.transform.rotation.y, asset.transform.rotation.z);
      object.visible = asset.visible !== false;
    }
    setSelectedAsset(selectedId);
  }

  function pick(input) {
    const rect = canvas.getBoundingClientRect();
    const x = input.clientX ?? input.x ?? rect.left + rect.width / 2;
    const y = input.clientY ?? input.y ?? rect.top + rect.height / 2;
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...assetObjects.values()], true);
    return hits[0]?.object?.userData?.assetId || null;
  }

  function assetDragPlane(assetId) {
    const object = assetObjects.get(assetId);
    if (!object) return null;
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, object.position);
  }

  function measureGrabOffset(assetId, input) {
    const object = assetObjects.get(assetId);
    const plane = assetDragPlane(assetId);
    if (!object || !plane) return null;
    const rect = canvas.getBoundingClientRect();
    const x = input.clientX ?? input.x ?? rect.left + rect.width / 2;
    const y = input.clientY ?? input.y ?? rect.top + rect.height / 2;
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    return { dx: object.position.x - hit.x, dz: object.position.z - hit.z };
  }

  function dragAssetToPointer(assetId, input, offsetX = 0, offsetZ = 0) {
    const object = assetObjects.get(assetId);
    const plane = assetDragPlane(assetId);
    if (!object || !plane) return false;
    const rect = canvas.getBoundingClientRect();
    const x = input.clientX ?? input.x ?? rect.left + rect.width / 2;
    const y = input.clientY ?? input.y ?? rect.top + rect.height / 2;
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(plane, hit)) return false;
    object.position.x = hit.x + offsetX;
    object.position.z = hit.z + offsetZ;
    return true;
  }

  function focusAsset(assetId, { animate = false } = {}) {
    const object = assetObjects.get(assetId);
    if (!object) return false;
    const box = new THREE.Box3().setFromObject(boundsTarget(object));
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const direction = camera.position.clone().sub(controls.target).normalize();
    const nextPosition = sphere.center.clone().add(direction.multiplyScalar(Math.max(2.2, sphere.radius * 5.2)));
    if (animate) {
      cameraFlight = {
        startedAt: performance.now(),
        duration: 420,
        fromPosition: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toPosition: nextPosition,
        toTarget: sphere.center.clone(),
      };
    } else {
      controls.target.copy(sphere.center);
      camera.position.copy(nextPosition);
      controls.update();
    }
    return true;
  }

  function clearEvidence() {
    for (const child of [...evidenceGroup.children]) {
      evidenceGroup.remove(child);
      disposeObject(child);
    }
  }

  function evidenceLine(points, color = 0xe27d66) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.94 }));
    line.layers.set(31);
    evidenceGroup.add(line);
  }

  function focusEvidence(evidence, { animate = false } = {}) {
    clearEvidence();
    if (!evidence) return false;
    const objects = evidence.assetIds.map((id) => assetObjects.get(id)).filter(Boolean);
    if (evidence.visual.showCollisionBoxes || evidence.visual.showBoundaryMeasure || evidence.kind === "neutral") {
      for (const object of objects) {
        const helper = new THREE.BoxHelper(boundsTarget(object), evidence.kind === "boundary" ? 0xd9b85d : 0xe27d66);
        helper.material.transparent = true;
        helper.material.opacity = 0.96;
        helper.layers.set(31);
        evidenceGroup.add(helper);
      }
    }
    if (evidence.kind === "collision" && objects.length > 1) {
      evidenceLine(objects.slice(0, 2).map((object) => new THREE.Box3().setFromObject(boundsTarget(object)).getCenter(new THREE.Vector3())));
    }
    if (evidence.kind === "boundary" && objects[0]) {
      const center = new THREE.Box3().setFromObject(boundsTarget(objects[0])).getCenter(new THREE.Vector3());
      const axis = evidence.evidence.axes?.[0];
      const direction = new THREE.Vector3(axis === "left" ? 1 : axis === "right" ? -1 : 0, axis === "floor" ? 1 : axis === "ceiling" ? -1 : 0, axis === "back" ? 1 : axis === "front" ? -1 : 0);
      evidenceLine([center, center.clone().add(direction.multiplyScalar(Math.max(0.25, evidence.measurement?.value || 0.25)))], 0xd9b85d);
    }
    if (evidence.visual.showLineOfSight) {
      const cameraData = currentProject?.cameras.find((entry) => entry.id === evidence.cameraId) || currentProject?.cameras[0];
      if (cameraData) evidenceLine([
        new THREE.Vector3(cameraData.position.x, cameraData.position.y, cameraData.position.z),
        new THREE.Vector3(cameraData.target.x, cameraData.target.y, cameraData.target.z),
      ], 0x5eb8c2);
    }
    if (objects[0]) focusAsset(evidence.assetIds[0], { animate });
    return objects.length > 0 || Boolean(evidence.cameraId);
  }

  setView("isometric");
  renderer.setAnimationLoop(() => {
    if (cameraFlight) {
      const progress = Math.min(1, (performance.now() - cameraFlight.startedAt) / cameraFlight.duration);
      const eased = 1 - (1 - progress) ** 3;
      camera.position.lerpVectors(cameraFlight.fromPosition, cameraFlight.toPosition, eased);
      controls.target.lerpVectors(cameraFlight.fromTarget, cameraFlight.toTarget, eased);
      if (progress >= 1) cameraFlight = null;
    }
    controls.update();
    selectionHelper?.update();
    resize();
    renderer.render(scene, camera);
  });

  return {
    canvas,
    renderer,
    scene,
    camera,
    controls,
    sync,
    resize,
    pick,
    measureGrabOffset,
    dragAssetToPointer,
    focusAsset,
    focusEvidence,
    clearEvidence,
    setSelectedAsset,
    setView,
    capture() {
      resize();
      camera.layers.disable(31);
      renderer.render(scene, camera);
      const dataUrl = canvas.toDataURL("image/png");
      camera.layers.enable(31);
      return dataUrl;
    },
    getAssetObject(assetId) { return assetObjects.get(assetId) || null; },
    dispose() {
      renderer.setAnimationLoop(null);
      controls.dispose();
      if (selectionHelper) { scene.remove(selectionHelper); disposeObject(selectionHelper); }
      clearEvidence();
      scene.remove(evidenceGroup);
      if (roomObject) disposeObject(roomObject);
      assetObjects.forEach(disposeObject);
      assetObjects.clear();
      renderer.dispose();
    },
  };
}
