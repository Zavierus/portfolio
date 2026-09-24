import { access, stat } from "node:fs/promises";

import { photography, validatePhotography } from "../src/portfolio/data/photography.js";

const repositoryRoot = new URL("../", import.meta.url);
const heroAssets = ["assets/hero/monumental-fracture-keyart.webp"];
const MAX_HERO_BYTES = 10 * 1024 * 1024;
const result = validatePhotography(photography);
const failures = result.errors.map((error) => {
  const itemLabel = error.id ?? `index ${error.index}`;
  return `Photography item ${itemLabel}: ${error.field} ${error.message}`;
});

for (const item of result.items) {
  for (const assetPath of [item.src, item.thumbnail]) {
    try {
      await access(new URL(assetPath.slice(2), repositoryRoot));
    } catch {
      failures.push(`Photography item ${item.id}: missing ${assetPath}`);
    }
  }
}

let heroBytes = 0;
for (const assetPath of heroAssets) {
  try {
    const assetStat = await stat(new URL(assetPath, repositoryRoot));
    heroBytes += assetStat.size;
  } catch {
    failures.push(`Homepage hero asset is missing: ${assetPath}`);
  }
}
if (heroBytes > MAX_HERO_BYTES) failures.push("Homepage hero assets exceed the 10 MB budget");

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log(`${result.items.length} photography items and ${heroBytes} hero bytes validated`);
}
