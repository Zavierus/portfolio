import { createRainSystem } from "../render/weather-system.js";

export function getLightningPulse(time) {
  const phase = ((time % 6.8) + 6.8) % 6.8;
  if (phase >= 0.64 && phase < 0.74) return 1;
  if (phase >= 0.88 && phase < 1.02) return 0.58;
  return 0;
}

export function buildBlacksiteWorld({ THREE, scene, addBox }) {
  const objects = [];
  const heroDetailGeometries = [];
  const lights = new Map();
  const doors = new Map();
  const rain = createRainSystem({ THREE, scene });
  let introMode = true;
  let heroGateProgress = 0;

  const wetConcrete = new THREE.MeshStandardMaterial({ color: 0x30383b, metalness: 0.18, roughness: 0.24 });
  const blackSteel = new THREE.MeshStandardMaterial({ color: 0x1b2326, metalness: 0.78, roughness: 0.24 });
  const galvanized = new THREE.MeshStandardMaterial({ color: 0x707b7e, metalness: 0.68, roughness: 0.3 });
  const paintedSteel = new THREE.MeshStandardMaterial({ color: 0x283438, metalness: 0.58, roughness: 0.38 });
  const safety = new THREE.MeshStandardMaterial({ color: 0x879d20, emissive: 0x263200, emissiveIntensity: 1.15, metalness: 0.5, roughness: 0.34 });
  const emergency = new THREE.MeshStandardMaterial({ color: 0x7a1d12, emissive: 0x4a0c05, emissiveIntensity: 2.2, metalness: 0.34, roughness: 0.4 });
  const puddleMaterial = new THREE.MeshPhysicalMaterial({ color: 0x101719, metalness: 0.2, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: 0.72 });
  const materials = [wetConcrete, blackSteel, galvanized, paintedSteel, safety, emergency, puddleMaterial];

  const box = (position, size, mat, options = {}) => {
    const mesh = addBox({
      position: new THREE.Vector3(...position),
      size: new THREE.Vector3(...size),
      mat,
      rotationY: options.rotationY ?? 0,
      cast: options.cast ?? true,
      collider: options.collider ?? false,
    });
    objects.push(mesh);
    return mesh;
  };

  const cylinder = (position, radius, length, mat, axis = "z") => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 14, 1, false), mat);
    mesh.position.set(...position);
    if (axis === "z") mesh.rotation.x = Math.PI / 2;
    if (axis === "x") mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
  };

  const puddle = (position, scale, rotation = 0) => {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 28), puddleMaterial);
    mesh.position.set(...position);
    mesh.rotation.set(-Math.PI / 2, 0, rotation);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.receiveShadow = true;
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
  };

  const gateDetail = (parent, position, size, material, rotationZ = 0) => {
    const geometry = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.z = rotationZ;
    mesh.castShadow = true;
    parent.add(mesh);
    heroDetailGeometries.push(geometry);
    return mesh;
  };

  const practical = (id, circuit, position, color, activeIntensity, distance = 13) => {
    const light = new THREE.PointLight(color, circuit === "external-link" ? activeIntensity : 0.12, distance, 2);
    light.position.set(...position);
    light.userData.activeIntensity = activeIntensity;
    light.userData.circuit = circuit;
    scene.add(light);
    objects.push(light);
    lights.set(id, light);
    box([position[0], position[1] + 0.08, position[2]], [0.52, 0.12, 0.28], circuit === "external-link" ? safety : emergency, { cast: false });
    return light;
  };

  const floorZones = [
    { center: 0, length: 36, width: 25 },
    { center: -35, length: 34, width: 29 },
    { center: -72, length: 40, width: 41 },
    { center: -109, length: 34, width: 35 },
  ];
  for (const zone of floorZones) {
    box([0, -0.34, zone.center], [zone.width, 0.68, zone.length], wetConcrete);
  }

  for (let z = 15; z >= -124; z -= 9) {
    const halfWidth = z < -52 && z > -92 ? 19 : z <= -92 ? 16 : 12;
    box([-halfWidth, 3.2, z], [0.58, 6.4, 0.58], galvanized, { collider: true });
    box([halfWidth, 3.2, z], [0.58, 6.4, 0.58], galvanized, { collider: true });
    box([0, 6.05, z], [halfWidth * 2 + 0.6, 0.38, 0.48], blackSteel);
  }

  box([-8.4, 0.75, 1], [5.8, 1.5, 2.4], paintedSteel, { rotationY: -0.2, collider: true });
  box([7.6, 0.6, -8], [4.4, 1.2, 2.2], paintedSteel, { rotationY: 0.18, collider: true });
  puddle([-4.5, 0.018, 5.2], [4.8, 1.25], -0.18);
  puddle([4.8, 0.02, -2.8], [5.2, 1.6], 0.12);
  puddle([-1.5, 0.022, -10.5], [3.8, 1.1], -0.08);

  // The first-screen hero is a real gate in the playable world, not a separate backdrop.
  box([-8.1, 3.8, -15.4], [1.8, 7.6, 2.2], blackSteel, { collider: true });
  box([8.1, 3.8, -15.4], [1.8, 7.6, 2.2], blackSteel, { collider: true });
  box([0, 7.55, -15.4], [17.8, 1.5, 2.2], galvanized);
  const heroGateLeft = box([-3.55, 3.45, -14.85], [6.8, 6.7, 0.75], paintedSteel, { collider: true });
  const heroGateRight = box([3.55, 3.45, -14.85], [6.8, 6.7, 0.75], paintedSteel, { collider: true });
  for (const [panel, material, seamX] of [[heroGateLeft, blackSteel, 3.31], [heroGateRight, galvanized, -3.31]]) {
    for (const x of [-2.65, -0.88, 0.88, 2.65]) gateDetail(panel, [x, 0, 0.47], [0.14, 5.9, 0.14], material);
    gateDetail(panel, [0, 2.72, 0.48], [6.15, 0.14, 0.14], material);
    gateDetail(panel, [0, -2.72, 0.48], [6.15, 0.14, 0.14], material);
    gateDetail(panel, [0, 0, 0.5], [7.1, 0.17, 0.16], material, 0.73);
    gateDetail(panel, [0, 0, 0.5], [7.1, 0.17, 0.16], material, -0.73);
    gateDetail(panel, [seamX, 0, 0.52], [0.11, 6.25, 0.18], safety);
  }

  const signCanvas = document.createElement("canvas");
  signCanvas.width = 1024;
  signCanvas.height = 256;
  const signContext = signCanvas.getContext("2d");
  signContext.fillStyle = "#111719";
  signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);
  signContext.strokeStyle = "#d9ff32";
  signContext.lineWidth = 12;
  signContext.strokeRect(16, 16, 992, 224);
  signContext.fillStyle = "#e8ece9";
  signContext.font = "700 118px Arial Narrow, sans-serif";
  signContext.textAlign = "center";
  signContext.textBaseline = "middle";
  signContext.fillText("BLACKSITE  B-17", 512, 130, 900);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const signMaterial = new THREE.MeshStandardMaterial({ map: signTexture, emissiveMap: signTexture, emissive: 0x263200, emissiveIntensity: 1.05, roughness: 0.34 });
  materials.push(signMaterial);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.85), signMaterial);
  sign.position.set(0, 7.5, -14.22);
  scene.add(sign);
  objects.push(sign);

  const gateFloods = [
    { position: [-8.6, 7.2, -7.6], target: [-2.4, 3, -15.2] },
    { position: [8.6, 7.2, -7.6], target: [2.4, 3, -15.2] },
  ].map(({ position, target }) => {
    const light = new THREE.SpotLight(0xe2e9e6, 92, 42, 0.24, 0.72, 1.35);
    light.position.set(...position);
    light.target.position.set(...target);
    light.castShadow = false;
    scene.add(light, light.target);
    objects.push(light, light.target);
    return light;
  });
  const gateAmber = new THREE.PointLight(0xd9ff32, 7.5, 17, 2);
  gateAmber.position.set(0, 7.2, -13.4);
  scene.add(gateAmber);
  objects.push(gateAmber);

  const steamPositions = new Float32Array(72 * 3);
  for (let index = 0; index < 72; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    steamPositions[index * 3] = side * (5.2 + Math.random() * 1.3);
    steamPositions[index * 3 + 1] = 0.12 + Math.random() * 1.35;
    steamPositions[index * 3 + 2] = -13.95 + (Math.random() - 0.5) * 0.9;
  }
  const steamGeometry = new THREE.BufferGeometry();
  steamGeometry.setAttribute("position", new THREE.BufferAttribute(steamPositions, 3));
  const steamCanvas = document.createElement("canvas");
  steamCanvas.width = 64;
  steamCanvas.height = 64;
  const steamContext = steamCanvas.getContext("2d");
  const steamGradient = steamContext.createRadialGradient(32, 32, 2, 32, 32, 30);
  steamGradient.addColorStop(0, "rgba(255,255,255,0.78)");
  steamGradient.addColorStop(0.38, "rgba(225,235,234,0.34)");
  steamGradient.addColorStop(1, "rgba(190,205,204,0)");
  steamContext.fillStyle = steamGradient;
  steamContext.fillRect(0, 0, 64, 64);
  const steamTexture = new THREE.CanvasTexture(steamCanvas);
  const steamMaterial = new THREE.PointsMaterial({ color: 0xb8c3c2, map: steamTexture, size: 0.38, transparent: true, opacity: 0.08, depthWrite: false, sizeAttenuation: true });
  materials.push(steamMaterial);
  const steam = new THREE.Points(steamGeometry, steamMaterial);
  scene.add(steam);
  objects.push(steam);
  box([-9.5, 1.5, -30], [3.2, 3, 7], blackSteel, { collider: true });
  box([9.2, 1.35, -39], [3.8, 2.7, 5.4], paintedSteel, { collider: true });
  box([0, 1.05, -47], [7.4, 2.1, 2.2], paintedSteel, { collider: true });

  for (const x of [-10.8, 10.8]) {
    cylinder([x, 4.8, -29], 0.34, 42, galvanized, "z");
    cylinder([x + (x < 0 ? 0.9 : -0.9), 4.15, -32], 0.18, 34, safety, "z");
  }

  for (const x of [-11, 11]) {
    cylinder([x, 3.35, -72], 3.1, 12, blackSteel, "x");
    cylinder([x, 3.35, -72], 2.35, 12.35, galvanized, "x");
    for (let ring = -2; ring <= 2; ring += 1) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.13, 8, 28), safety);
      torus.position.set(x + ring * 2.2, 3.35, -72);
      torus.rotation.y = Math.PI / 2;
      scene.add(torus);
      objects.push(torus);
    }
  }

  box([0, 3.2, -66], [25, 0.36, 2.4], galvanized);
  box([0, 3.2, -83], [27, 0.36, 2.4], galvanized);
  for (const x of [-13.2, 13.2]) {
    box([x, 1.3, -80], [2.1, 2.6, 5.2], paintedSteel, { collider: true });
  }

  const blastDoor = box([0, 2.6, -51], [8.4, 5.2, 0.7], blackSteel, { collider: true });
  doors.set("turbine-blast-door", { mesh: blastDoor, closedY: 2.6, openY: 7.6, circuit: "auxiliary-b" });
  const freightDoor = box([0, 2.7, -92], [9.2, 5.4, 0.7], blackSteel, { collider: true });
  doors.set("freight-access-door", { mesh: freightDoor, closedY: 2.7, openY: 8.1, circuit: "reactor" });

  const containerColors = [paintedSteel, blackSteel, safety];
  [
    [-10, -103, 0], [8.5, -104, 0.05], [-6, -115, -0.08], [10.2, -118, 0.12],
  ].forEach(([x, z, rotation], index) => {
    box([x, 1.35, z], [5.8, 2.7, 11.5], containerColors[index % containerColors.length], { rotationY: rotation, collider: true });
  });

  practical("gantry-a", "external-link", [-8, 4.8, 9], 0xd9ff32, 3.4, 12);
  practical("gantry-b", "external-link", [8, 4.8, -8], 0xd9ff32, 3.4, 12);
  practical("aux-a", "auxiliary-a", [-9, 4.6, -29], 0xe5e7df, 5.4, 15);
  practical("aux-b", "auxiliary-b", [9, 4.6, -42], 0xe5e7df, 5.4, 15);
  practical("reactor-a", "reactor", [-12, 6.1, -66], 0xf2f1e8, 7.4, 18);
  practical("reactor-b", "reactor", [12, 6.1, -82], 0xf2f1e8, 7.4, 18);
  practical("freight-a", "extraction", [-10, 5.2, -105], 0xb9c5c7, 5.8, 17);
  practical("freight-b", "extraction", [10, 5.2, -119], 0xb9c5c7, 5.8, 17);

  const stormFill = new THREE.HemisphereLight(0x8fa2aa, 0x111416, 2.2);
  scene.add(stormFill);
  objects.push(stormFill);
  const moonKey = new THREE.DirectionalLight(0xb9c9ce, 1.8);
  moonKey.position.set(-9, 18, 12);
  moonKey.castShadow = true;
  moonKey.shadow.mapSize.set(768, 768);
  moonKey.shadow.camera.left = -18;
  moonKey.shadow.camera.right = 18;
  moonKey.shadow.camera.top = 18;
  moonKey.shadow.camera.bottom = -18;
  scene.add(moonKey);
  objects.push(moonKey);
  const approachKey = new THREE.SpotLight(0xd5dedc, 26, 48, 0.42, 0.72, 1.35);
  approachKey.position.set(-9, 10, 14);
  approachKey.target.position.set(1, 0, -13);
  approachKey.castShadow = false;
  scene.add(approachKey, approachKey.target);
  objects.push(approachKey, approachKey.target);
  const lightning = new THREE.DirectionalLight(0xc7d7df, 0);
  lightning.position.set(-18, 24, 8);
  scene.add(lightning);
  objects.push(lightning);

  return {
    lights,
    doors,
    setCircuitState(restoredIds) {
      const restored = new Set(restoredIds);
      for (const light of lights.values()) {
        light.intensity = restored.has(light.userData.circuit) ? light.userData.activeIntensity : 0.12;
      }
      for (const door of doors.values()) {
        const open = restored.has(door.circuit);
        door.mesh.position.y = open ? door.openY : door.closedY;
        if (door.mesh.userData.obstacle) door.mesh.userData.obstacle.active = !open;
      }
    },
    setIntroMode(active) {
      introMode = Boolean(active);
      if (introMode) heroGateProgress = 0;
    },
    update(realTime, worldDelta, focus, realDelta = worldDelta) {
      rain.update(worldDelta, focus);
      rain.setVisible((focus?.z ?? 0) > -18 || (focus?.z ?? 0) < -92);
      heroGateProgress = THREE.MathUtils.clamp(heroGateProgress + (introMode ? -1 : 1) * realDelta * 0.92, 0, 1);
      const gateEase = heroGateProgress * heroGateProgress * (3 - 2 * heroGateProgress);
      heroGateLeft.position.x = THREE.MathUtils.lerp(-3.55, -9.6, gateEase);
      heroGateRight.position.x = THREE.MathUtils.lerp(3.55, 9.6, gateEase);
      if (heroGateLeft.userData.obstacle) heroGateLeft.userData.obstacle.active = heroGateProgress < 0.82;
      if (heroGateRight.userData.obstacle) heroGateRight.userData.obstacle.active = heroGateProgress < 0.82;
      gateFloods[0].target.position.x = -2.4 + Math.sin(realTime * 0.22) * 1.1;
      gateFloods[1].target.position.x = 2.4 + Math.sin(realTime * 0.22 + Math.PI) * 1.1;
      gateFloods.forEach((light) => { light.intensity = introMode ? 92 : 48; });
      gateAmber.intensity = introMode ? 7.5 : 3.2;
      steamMaterial.opacity = introMode ? 0.08 : 0.035;
      for (let index = 0; index < 72; index += 1) {
        const offset = index * 3;
        steamPositions[offset + 1] += realDelta * (0.18 + (index % 7) * 0.018);
        steamPositions[offset] += Math.sin(realTime * 0.7 + index) * realDelta * 0.025;
        if (steamPositions[offset + 1] > 2.2) steamPositions[offset + 1] = 0.12;
      }
      steamGeometry.attributes.position.needsUpdate = true;
      const flash = getLightningPulse(realTime) * (introMode ? 13 : 7.5);
      lightning.intensity += (flash - lightning.intensity) * Math.min(1, worldDelta * 22);
    },
    dispose() {
      rain.dispose();
      for (const object of objects) scene.remove(object);
      for (const material of materials) material.dispose();
      for (const geometry of heroDetailGeometries) geometry.dispose();
      signTexture.dispose();
      steamTexture.dispose();
      steamGeometry.dispose();
    },
  };
}
