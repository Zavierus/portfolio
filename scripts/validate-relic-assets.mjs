import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { validateAssetManifest } from "../src/shared/assets/asset-contract.js";

const repositoryRoot = path.resolve(process.cwd());
const manifestPath = path.join(repositoryRoot, "projects/relic-01/assets/asset-manifest.json");
const requiredAnimations = ["core_wake", "fibre_reveal", "membrane_tension", "signal_sweep", "turntable_idle"];
const requiredMorphs = ["core_wake", "fibre_reveal", "membrane_tension", "signal_sweep"];
const requiredMaterials = [
  "MAT_RELIC_Bone",
  "MAT_RELIC_Core",
  "MAT_RELIC_Fibre",
  "MAT_RELIC_Membrane",
  "MAT_RELIC_OxidizedAlloy",
  "MAT_RELIC_Signal",
];

function addFailure(failures, message) {
  failures.push(message);
}

async function readGlb(relativePath) {
  const filePath = path.join(repositoryRoot, relativePath);
  const buffer = await readFile(filePath);
  if (buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) {
    throw new Error(`${relativePath} is not a glTF 2.0 binary`);
  }
  const jsonLength = buffer.readUInt32LE(12);
  if (buffer.readUInt32LE(16) !== 0x4e4f534a) throw new Error(`${relativePath} has no JSON chunk`);
  return { buffer, json: JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8")) };
}

function triangleCount(json) {
  return (json.meshes ?? []).reduce((total, mesh) => total + mesh.primitives.reduce((meshTotal, primitive) => {
    if (primitive.mode !== undefined && primitive.mode !== 4) return meshTotal;
    const accessor = json.accessors?.[primitive.indices ?? primitive.attributes?.POSITION];
    return meshTotal + (accessor?.count ?? 0) / 3;
  }, 0), 0);
}

function inspectGlb(json, level, failures) {
  const triangles = triangleCount(json);
  const bounds = level === "high" ? [150_000, 180_000] : [50_000, 60_000];
  if (triangles < bounds[0] || triangles > bounds[1]) {
    addFailure(failures, `${level} LOD has ${triangles} triangles; expected ${bounds[0]}-${bounds[1]}`);
  }
  const animations = (json.animations ?? []).map(({ name }) => name).sort();
  if (JSON.stringify(animations) !== JSON.stringify(requiredAnimations)) {
    addFailure(failures, `${level} LOD animation contract is ${animations.join(", ")}`);
  }
  const morphs = [...new Set((json.meshes ?? []).flatMap((mesh) => mesh.extras?.targetNames ?? []))].sort();
  if (JSON.stringify(morphs) !== JSON.stringify(requiredMorphs)) {
    addFailure(failures, `${level} LOD morph contract is ${morphs.join(", ")}`);
  }
  for (const extension of ["EXT_meshopt_compression", "KHR_texture_basisu"]) {
    if (!json.extensionsUsed?.includes(extension) || !json.extensionsRequired?.includes(extension)) {
      addFailure(failures, `${level} LOD must require ${extension}`);
    }
  }
  if (!(json.images ?? []).some(({ mimeType }) => mimeType === "image/ktx2")) {
    addFailure(failures, `${level} LOD contains no KTX2 images`);
  }
  const materials = (json.materials ?? []).map(({ name }) => name).sort();
  if (JSON.stringify(materials) !== JSON.stringify(requiredMaterials)) {
    addFailure(failures, `${level} LOD material contract is ${materials.join(", ")}`);
  }
  for (const material of json.materials ?? []) {
    if (["MAT_RELIC_Fibre", "MAT_RELIC_Signal"].includes(material.name)) continue;
    if (!material.pbrMetallicRoughness?.baseColorTexture) addFailure(failures, `${level}:${material.name} has no base color texture`);
    if (!material.pbrMetallicRoughness?.metallicRoughnessTexture) addFailure(failures, `${level}:${material.name} has no metallic-roughness texture`);
    if (!material.normalTexture) addFailure(failures, `${level}:${material.name} has no normal texture`);
  }
  return triangles;
}

const failures = [];
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const contract = validateAssetManifest(manifest);
for (const error of contract.errors) {
  addFailure(failures, `${error.id ?? error.index}:${error.field} ${error.message}`);
}
const artifact = contract.items.find(({ id }) => id === "relic-artifact");
if (!artifact?.published) addFailure(failures, "relic-artifact is not published");

let runtimeBytes = 0;
const lodReports = [];
if (artifact) {
  for (const lod of artifact.lods) {
    const file = await stat(path.join(repositoryRoot, lod.path));
    if (file.size !== lod.bytes) addFailure(failures, `${lod.level} LOD bytes ${file.size} do not match ${lod.bytes}`);
    runtimeBytes += file.size;
    const { json } = await readGlb(lod.path);
    const triangles = inspectGlb(json, lod.level, failures);
    if (triangles !== lod.triangles) addFailure(failures, `${lod.level} LOD triangles ${triangles} do not match ${lod.triangles}`);
    lodReports.push({ level: lod.level, bytes: file.size, triangles });
  }

  for (const texture of artifact.textures) {
    const filePath = path.join(repositoryRoot, texture.runtimePath);
    const [file, metadata] = await Promise.all([stat(filePath), sharp(filePath).metadata()]);
    if (file.size !== texture.bytes) addFailure(failures, `${texture.role} bytes ${file.size} do not match ${texture.bytes}`);
    if (metadata.width !== texture.width || metadata.height !== texture.height) {
      addFailure(failures, `${texture.role} is ${metadata.width}x${metadata.height}; expected ${texture.width}x${texture.height}`);
    }
    if (metadata.format !== "webp") addFailure(failures, `${texture.role} is not WebP`);
    runtimeBytes += file.size;
  }
}

if (runtimeBytes > 35 * 1024 * 1024) addFailure(failures, `runtime budget is ${runtimeBytes} bytes`);

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  console.log(`RELIC//01 assets validated (${runtimeBytes} runtime bytes).`);
  lodReports.forEach((report) => console.log(JSON.stringify(report)));
}
