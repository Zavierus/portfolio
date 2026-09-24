import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { validateAssetManifest } from "../src/shared/assets/asset-contract.js";

const repositoryRoot = path.resolve(process.cwd());
const manifestPath = path.join(repositoryRoot, "projects/pulse-room/assets/asset-manifest.json");
const expectedIds = ["signal-chrysalis", "triune-gate", "null-cathedral", "packet-bloom"];
const failures = [];

const fail = (message) => failures.push(message);

async function readGlb(relativePath) {
  const buffer = await readFile(path.join(repositoryRoot, relativePath));
  if (buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) {
    throw new Error(`${relativePath} is not a glTF 2.0 binary`);
  }
  const jsonLength = buffer.readUInt32LE(12);
  if (buffer.readUInt32LE(16) !== 0x4e4f534a) throw new Error(`${relativePath} has no JSON chunk`);
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8"));
}

function triangleCount(json) {
  return Math.round((json.meshes ?? []).reduce((total, mesh) => total + mesh.primitives.reduce((meshTotal, primitive) => {
    if (primitive.mode !== undefined && primitive.mode !== 4) return meshTotal;
    const accessor = json.accessors?.[primitive.indices ?? primitive.attributes?.POSITION];
    return meshTotal + (accessor?.count ?? 0) / 3;
  }, 0), 0));
}

function nodeIncludesRoot(json, root) {
  return (json.nodes ?? []).some(({ name }) => name === root);
}

async function validatePublishedLod(asset, lod) {
  const filePath = path.join(repositoryRoot, lod.path);
  const file = await stat(filePath);
  if (file.size !== lod.bytes) fail(`${asset.id}:${lod.level} bytes ${file.size} do not match ${lod.bytes}`);
  if (file.size > 5 * 1024 * 1024) fail(`${asset.id}:${lod.level} exceeds the 5 MB GLB budget`);
  const json = await readGlb(lod.path);
  const triangles = triangleCount(json);
  if (triangles !== lod.triangles) fail(`${asset.id}:${lod.level} triangles ${triangles} do not match ${lod.triangles}`);
  if (!nodeIncludesRoot(json, asset.root)) fail(`${asset.id}:${lod.level} is missing ${asset.root}`);
  const animations = new Set((json.animations ?? []).map(({ name }) => name));
  const missingAnimations = asset.animations.filter((name) => !animations.has(name));
  if (missingAnimations.length) fail(`${asset.id}:${lod.level} missing animations ${missingAnimations.join(", ")}`);
  const morphs = new Set((json.meshes ?? []).flatMap((mesh) => mesh.extras?.targetNames ?? []));
  const missingMorphs = asset.controls.filter((name) => !morphs.has(name));
  if (missingMorphs.length) fail(`${asset.id}:${lod.level} missing controls ${missingMorphs.join(", ")}`);
  for (const extension of ["EXT_meshopt_compression", "KHR_texture_basisu"]) {
    if (!json.extensionsUsed?.includes(extension)) fail(`${asset.id}:${lod.level} must use ${extension}`);
  }
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const contract = validateAssetManifest(manifest);
for (const error of contract.errors) fail(`${error.id ?? error.index}:${error.field} ${error.message}`);
if (JSON.stringify(contract.items.map(({ id }) => id)) !== JSON.stringify(expectedIds)) {
  fail(`world order must be ${expectedIds.join(", ")}`);
}

for (const asset of contract.items) {
  if (!asset.root || !Array.isArray(asset.controls) || asset.controls.length < 4) {
    fail(`${asset.id} requires a root and at least four controls`);
    continue;
  }
  try {
    await access(path.join(repositoryRoot, asset.source.path));
    const sourceRecord = JSON.parse(await readFile(path.join(repositoryRoot, asset.source.path), "utf8"));
    if (sourceRecord.root !== asset.root) fail(`${asset.id} source root does not match manifest`);
    if (JSON.stringify(sourceRecord.controls) !== JSON.stringify(asset.controls)) fail(`${asset.id} source controls do not match manifest`);
  } catch (error) {
    fail(`${asset.id} source record failed: ${error.message}`);
  }
  if (asset.lods.map(({ level }) => level).join(",") !== "high,low") fail(`${asset.id} requires high and low LODs`);
  if (asset.published) {
    for (const lod of asset.lods) {
      try {
        await validatePublishedLod(asset, lod);
      } catch (error) {
        fail(`${asset.id}:${lod.level} failed: ${error.message}`);
      }
    }
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  const published = contract.items.filter(({ published }) => published).length;
  console.log(`PULSE world contracts validated (${published}/4 published).`);
}
