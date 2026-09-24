export const RAIN_LAYER_CONFIG = Object.freeze([
  Object.freeze({
    id: "far",
    count: 390,
    spanX: 46,
    spanZ: 54,
    length: Object.freeze([0.12, 0.34]),
    speed: Object.freeze([9, 15]),
    opacity: 0.065,
    color: 0x839093,
    wind: 0.09,
  }),
  Object.freeze({
    id: "middle",
    count: 210,
    spanX: 38,
    spanZ: 44,
    length: Object.freeze([0.32, 0.78]),
    speed: Object.freeze([14, 22]),
    opacity: 0.115,
    color: 0xa4afb0,
    wind: 0.14,
  }),
  Object.freeze({
    id: "foreground",
    count: 64,
    spanX: 27,
    spanZ: 30,
    length: Object.freeze([0.75, 1.65]),
    speed: Object.freeze([20, 31]),
    opacity: 0.16,
    color: 0xc1c9c8,
    wind: 0.2,
  }),
]);

const randomBetween = ([minimum, maximum]) => minimum + Math.random() * (maximum - minimum);

function createLayer(THREE, scene, config) {
  const positions = new Float32Array(config.count * 6);
  const drops = Array.from({ length: config.count }, () => ({
    x: (Math.random() - 0.5) * config.spanX,
    y: Math.random() * 18,
    z: (Math.random() - 0.5) * config.spanZ,
    length: randomBetween(config.length),
    speed: randomBetween(config.speed),
  }));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.renderOrder = config.id === "foreground" ? 2 : 1;
  scene.add(lines);

  const writeDrop = (drop, index) => {
    const offset = index * 6;
    const windOffset = drop.length * config.wind;
    positions[offset] = drop.x;
    positions[offset + 1] = drop.y;
    positions[offset + 2] = drop.z;
    positions[offset + 3] = drop.x - windOffset;
    positions[offset + 4] = drop.y - drop.length;
    positions[offset + 5] = drop.z + windOffset * 0.22;
  };
  drops.forEach(writeDrop);
  geometry.attributes.position.needsUpdate = true;

  return {
    update(worldDelta, focus) {
      const centerX = focus?.x ?? 0;
      const centerZ = focus?.z ?? 0;
      for (let index = 0; index < drops.length; index += 1) {
        const drop = drops[index];
        drop.y -= drop.speed * worldDelta;
        drop.x -= config.wind * drop.speed * worldDelta;
        if (drop.y < -0.15 || Math.abs(drop.x - centerX) > config.spanX * 0.58) {
          drop.y = 12 + Math.random() * 7;
          drop.x = centerX + (Math.random() - 0.5) * config.spanX;
          drop.z = centerZ + (Math.random() - 0.5) * config.spanZ;
          drop.length = randomBetween(config.length);
        }
        writeDrop(drop, index);
      }
      geometry.attributes.position.needsUpdate = true;
    },
    setVisible(visible) {
      lines.visible = visible;
    },
    dispose() {
      scene.remove(lines);
      geometry.dispose();
      material.dispose();
    },
  };
}

export function createRainSystem({ THREE, scene }) {
  const layers = RAIN_LAYER_CONFIG.map((config) => createLayer(THREE, scene, config));

  return {
    update(worldDelta, focus) {
      for (const layer of layers) layer.update(worldDelta, focus);
    },
    setVisible(visible) {
      for (const layer of layers) layer.setVisible(visible);
    },
    dispose() {
      for (const layer of layers) layer.dispose();
    },
  };
}

