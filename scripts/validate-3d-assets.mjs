import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { summarizeAssetBudget, validateAssetManifest } from "../src/shared/assets/asset-contract.js";

const repositoryRoot = path.resolve(process.cwd());

async function findManifestFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await findManifestFiles(entryPath));
    else if (entry.name === "asset-manifest.json") found.push(entryPath);
  }
  return found;
}

function repositoryPath(assetPath) {
  return path.resolve(repositoryRoot, assetPath);
}

async function verifyFile(assetPath, expectedBytes, label, failures) {
  try {
    const resolved = repositoryPath(assetPath);
    const relative = path.relative(repositoryRoot, resolved);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      failures.push(`${label}: path escapes the repository`);
      return;
    }
    await access(resolved);
    if (expectedBytes > 0) {
      const fileStats = await stat(resolved);
      if (fileStats.size !== expectedBytes) failures.push(`${label}: declared ${expectedBytes} bytes but found ${fileStats.size}`);
    }
  } catch {
    failures.push(`${label}: missing ${assetPath}`);
  }
}

const manifestFiles = await findManifestFiles(path.join(repositoryRoot, "projects"));
const productionManifests = [];
const failures = [];

for (const manifestFile of manifestFiles) {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  } catch (error) {
    failures.push(`${path.relative(repositoryRoot, manifestFile)}: invalid JSON (${error.message})`);
    continue;
  }
  if (manifest?.contractVersion !== 1) continue;
  const result = validateAssetManifest(manifest);
  productionManifests.push({ file: manifestFile, result });
  for (const error of result.errors) {
    failures.push(`${manifest.project || path.relative(repositoryRoot, manifestFile)}:${error.id ?? error.index}:${error.field} ${error.message}`);
  }
  for (const item of result.items) {
    await verifyFile(item.source.path, 0, `${manifest.project}:${item.id}:source`, failures);
    if (!item.published) continue;
    for (const lod of item.lods) await verifyFile(lod.path, lod.bytes, `${manifest.project}:${item.id}:${lod.level}`, failures);
    for (const texture of item.textures) {
      await verifyFile(texture.runtimePath, texture.bytes, `${manifest.project}:${item.id}:${texture.role}`, failures);
    }
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  const assetCount = productionManifests.reduce((total, { result }) => total + result.items.length, 0);
  const budgets = productionManifests.map(({ result }) => summarizeAssetBudget(result.items));
  console.log(`${productionManifests.length} production manifests and ${assetCount} assets validated`);
  budgets.forEach((budget) => console.log(JSON.stringify(budget)));
}
