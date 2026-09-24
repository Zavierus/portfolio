import * as THREE from "../../../assets/vendor/three.module.js";

import { ACID_SIGNAL_COLORS } from "../../shared/acid-signal-tokens.js";

const freezeSlab = (slab) => Object.freeze({
  ...slab,
  position: Object.freeze(slab.position),
  rotation: Object.freeze(slab.rotation),
  scale: Object.freeze(slab.scale),
  profile: Object.freeze(slab.profile.map((point) => Object.freeze(point))),
  holes: Object.freeze((slab.holes ?? []).map((hole) => Object.freeze(hole.map((point) => Object.freeze(point))))),
});

export const FRACTURE_SLABS = Object.freeze([
  freezeSlab({
    id: "archive-cliff",
    material: "ceramic",
    signal: "none",
    position: [-4.15, 0.3, -3.8],
    rotation: [-0.06, 0.2, -0.16],
    scale: [5.8, 8.6, 1.05],
    profile: [[-0.5, -0.5], [0.33, -0.46], [0.5, -0.12], [0.37, 0.5], [-0.44, 0.39]],
    holes: [
      [[0.02, -0.31], [0.27, -0.28], [0.24, 0.19], [0.08, 0.31], [-0.05, 0.05]],
    ],
  }),
  freezeSlab({
    id: "suspended-crown",
    material: "titanium",
    signal: "none",
    position: [2.45, 4.6, -5.7],
    rotation: [0.12, -0.16, -0.08],
    scale: [7.4, 2.45, 1.4],
    profile: [[-0.5, -0.3], [0.45, -0.5], [0.5, 0.24], [0.14, 0.5], [-0.41, 0.35]],
    holes: [
      [[-0.31, -0.12], [0.29, -0.27], [0.24, 0.08], [-0.17, 0.24]],
    ],
  }),
  freezeSlab({
    id: "lower-keel",
    material: "glass",
    signal: "none",
    position: [4.1, -2.3, -6.5],
    rotation: [0.06, -0.24, 0.12],
    scale: [4.65, 5.35, 0.82],
    profile: [[-0.5, -0.42], [0.19, -0.5], [0.5, 0.05], [0.38, 0.5], [-0.24, 0.39]],
    holes: [
      [[-0.21, -0.23], [0.18, -0.12], [0.27, 0.2], [-0.02, 0.31], [-0.27, 0.08]],
    ],
  }),
  freezeSlab({
    id: "signal-blade",
    material: "acid",
    signal: "acid",
    position: [0.18, 1.7, -3.25],
    rotation: [0.02, 0.08, -0.28],
    scale: [0.52, 4.05, 0.16],
    profile: [[-0.12, -0.5], [0.22, -0.31], [0.05, -0.08], [0.31, 0.12], [0.02, 0.5], [-0.26, 0.2], [-0.08, -0.07], [-0.34, -0.32]],
  }),
]);

function drawPath(path, points) {
  points.forEach(([x, y], index) => {
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
}

function createSlabGeometry(profile, holes = []) {
  const shape = new THREE.Shape();
  drawPath(shape, profile);
  holes.forEach((points) => {
    const hole = new THREE.Path();
    drawPath(hole, [...points].reverse());
    shape.holes.push(hole);
  });
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 1,
  });
  geometry.center();
  return geometry;
}

function createBeam(start, end, material, width = 0.055) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(width, direction.length(), width), material);
  beam.position.copy(from).add(to).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return beam;
}

function seededNoise(index, seed) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createSurfaceTexture(seed = 1) {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const plateLine = x % 47 < 2 || y % 61 < 2;
      const scratch = (x + y * 3 + seed * 17) % 89 < 2;
      const noise = seededNoise(index, seed);
      const value = Math.round(plateLine ? 32 : scratch ? 205 : 82 + noise * 64);
      data[index * 4] = value;
      data[index * 4 + 1] = value;
      data[index * 4 + 2] = value;
      data[index * 4 + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 5.1);
  texture.needsUpdate = true;
  return texture;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const [x, y] = polygon[index];
    const [previousX, previousY] = polygon[previous];
    const crosses = (y > point[1]) !== (previousY > point[1])
      && point[0] < ((previousX - x) * (point[1] - y)) / (previousY - y) + x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function createGroundGeometry() {
  const geometry = new THREE.PlaneGeometry(25, 34, 32, 42);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const displacement = (seededNoise(index, 9) - 0.5) * 0.16 + Math.sin(x * 1.7 + y * 0.4) * 0.035;
    positions.setZ(index, displacement);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export class MonumentalFracture {
  constructor({ scene }) {
    this.group = new THREE.Group();
    this.group.name = "monumental-fracture";
    scene.add(this.group);
    this.scene = scene;
    this.textures = [createSurfaceTexture(3), createSurfaceTexture(11)];
    this.materials = {
      ceramic: new THREE.MeshStandardMaterial({
        color: 0x111515,
        roughness: 0.76,
        metalness: 0.2,
        bumpMap: this.textures[0],
        bumpScale: 0.12,
      }),
      titanium: new THREE.MeshStandardMaterial({
        color: 0x4b5351,
        roughness: 0.56,
        metalness: 0.82,
        bumpMap: this.textures[1],
        bumpScale: 0.09,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x15191a,
        roughness: 0.2,
        metalness: 0.12,
        transmission: 0.16,
        transparent: true,
        opacity: 0.86,
        thickness: 0.9,
        bumpMap: this.textures[0],
        bumpScale: 0.045,
      }),
      acid: new THREE.MeshStandardMaterial({
        color: ACID_SIGNAL_COLORS.acid,
        emissive: ACID_SIGNAL_COLORS.acid,
        emissiveIntensity: 3.2,
        roughness: 0.34,
        metalness: 0.1,
      }),
      structure: new THREE.MeshStandardMaterial({
        color: 0x3d4443,
        emissive: 0x061819,
        emissiveIntensity: 0.25,
        roughness: 0.56,
        metalness: 0.75,
      }),
      scan: new THREE.MeshBasicMaterial({ color: ACID_SIGNAL_COLORS.scan, transparent: true, opacity: 0.58 }),
      warning: new THREE.MeshBasicMaterial({ color: ACID_SIGNAL_COLORS.warning }),
      panelDark: new THREE.MeshStandardMaterial({ color: 0x252b2a, roughness: 0.64, metalness: 0.42 }),
      panelLight: new THREE.MeshStandardMaterial({ color: 0x202625, roughness: 0.58, metalness: 0.7 }),
      ground: new THREE.MeshStandardMaterial({
        color: 0x111615,
        roughness: 0.88,
        metalness: 0.25,
        bumpMap: this.textures[1],
        bumpScale: 0.14,
      }),
    };
    this.slabs = FRACTURE_SLABS.map((descriptor) => {
      const mesh = new THREE.Mesh(createSlabGeometry(descriptor.profile, descriptor.holes), this.materials[descriptor.material]);
      mesh.name = descriptor.id;
      mesh.position.fromArray(descriptor.position);
      mesh.rotation.set(...descriptor.rotation);
      mesh.scale.fromArray(descriptor.scale);
      mesh.userData.basePosition = mesh.position.clone();
      mesh.castShadow = descriptor.material !== "glass";
      mesh.receiveShadow = true;
      this.group.add(mesh);
      if (descriptor.signal === "none") this._addSurfaceDetails(mesh, descriptor, FRACTURE_SLABS.indexOf(descriptor));
      return mesh;
    });
    this._addStructuralDetail();
  }

  update({ time = 0, scrollProgress = 0 } = {}) {
    const opening = THREE.MathUtils.smoothstep(scrollProgress, 0.05, 0.9);
    const offsets = [-1, -0.35, 0.8, 0];
    this.slabs.forEach((slab, index) => {
      slab.position.copy(slab.userData.basePosition);
      slab.position.x += offsets[index] * opening * 1.1;
    });
    this.materials.acid.emissiveIntensity = 1.8 + Math.sin(time * 0.55) * 0.12;
    this.scanLight.position.y = 1.3 + Math.sin(time * 0.23) * 0.45;
  }

  setQuality(level) {
    const shadows = level === "high";
    this.slabs.forEach((slab) => { slab.castShadow = shadows && slab.material !== this.materials.glass; });
  }

  dispose() {
    const sharedMaterials = new Set(Object.values(this.materials));
    this.group.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        if (!sharedMaterials.has(material)) material.dispose?.();
      });
    });
    Object.values(this.materials).forEach((material) => material.dispose());
    this.textures.forEach((texture) => texture.dispose());
    this.scene.remove(this.group);
  }

  _addStructuralDetail() {
    const beams = [
      [[-1.65, -2.6, -3.1], [1.5, 3.1, -3.7]],
      [[1.2, 3.55, -4.1], [3.5, -1.4, -5]],
      [[-2.5, 2.2, -3.45], [2.9, 3.3, -4.4]],
      [[2.2, -2.4, -4.7], [0.65, 2.65, -3.2]],
    ];
    beams.forEach(([start, end], index) => {
      const beam = createBeam(start, end, this.materials.structure, index === 2 ? 0.035 : 0.06);
      beam.name = `load-beam-${index + 1}`;
      this.group.add(beam);
    });

    for (let index = 0; index < 7; index += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.16), this.materials.structure);
      fin.position.set(2.35 + index * 0.22, -0.6 + index * 0.34, -4.95 - index * 0.04);
      fin.rotation.z = -0.65;
      this.group.add(fin);
    }

    const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 5.4), this.materials.scan);
    scanPlane.name = "cyan-calibration-edge";
    scanPlane.position.set(-1.2, 1.3, -2.25);
    this.group.add(scanPlane);
    this.scanLight = scanPlane;

    const warningMarker = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.025), this.materials.warning);
    warningMarker.name = "distant-scale-marker";
    warningMarker.position.set(4.8, -3.9, -7.2);
    this.group.add(warningMarker);

    const ground = new THREE.Mesh(createGroundGeometry(), this.materials.ground);
    ground.name = "fractured-ground-plane";
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -4.05, -2.8);
    ground.receiveShadow = true;
    this.group.add(ground);

    const shardGeometry = new THREE.BoxGeometry(0.22, 0.07, 0.8);
    const shards = new THREE.InstancedMesh(shardGeometry, this.materials.structure, 34);
    const helper = new THREE.Object3D();
    for (let index = 0; index < shards.count; index += 1) {
      const lateral = (seededNoise(index, 5) - 0.5) * 13;
      const depth = -1.8 - seededNoise(index, 12) * 13;
      helper.position.set(lateral, -3.88 + seededNoise(index, 2) * 0.1, depth);
      helper.rotation.set(-0.08 + seededNoise(index, 4) * 0.16, seededNoise(index, 8) * Math.PI, 0);
      helper.scale.set(0.4 + seededNoise(index, 6) * 2.1, 0.5, 0.5 + seededNoise(index, 7) * 3.6);
      helper.updateMatrix();
      shards.setMatrixAt(index, helper.matrix);
    }
    shards.name = "scale-fragments";
    shards.receiveShadow = true;
    this.group.add(shards);

    const voidPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 13),
      new THREE.MeshBasicMaterial({ color: 0x030404 }),
    );
    voidPlane.name = "dominant-void";
    voidPlane.position.set(0.2, 0.1, -8.4);
    this.group.add(voidPlane);
    this.materials.void = voidPlane.material;
  }

  _addSurfaceDetails(slab, descriptor, slabIndex) {
    const count = 16 + slabIndex * 4;
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.026);
    const material = slabIndex === 1 ? this.materials.panelLight : this.materials.panelDark;
    const panels = new THREE.InstancedMesh(geometry, material, count);
    const helper = new THREE.Object3D();
    for (let index = 0; index < count; index += 1) {
      let x = -0.4 + seededNoise(index, slabIndex + 2) * 0.8;
      let y = -0.4 + seededNoise(index, slabIndex + 14) * 0.8;
      if (descriptor.holes.some((hole) => pointInPolygon([x, y], hole))) {
        x = -0.41 + (index % 3) * 0.11;
        y = -0.38 + (index % 5) * 0.13;
      }
      helper.position.set(x, y, 0.515);
      helper.rotation.z = (seededNoise(index, slabIndex + 20) - 0.5) * 0.16;
      helper.scale.set(
        0.45 + seededNoise(index, slabIndex + 3) * 1.3,
        0.25 + seededNoise(index, slabIndex + 6) * 1.15,
        0.7 + seededNoise(index, slabIndex + 9) * 0.65,
      );
      helper.updateMatrix();
      panels.setMatrixAt(index, helper.matrix);
    }
    panels.name = `${descriptor.id}-surface-panels`;
    slab.add(panels);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(slab.geometry, 28),
      new THREE.LineBasicMaterial({
        color: ACID_SIGNAL_COLORS.scan,
        transparent: true,
        opacity: slabIndex === 1 ? 0.2 : 0.11,
      }),
    );
    edges.name = `${descriptor.id}-edge-calibration`;
    slab.add(edges);
  }
}
