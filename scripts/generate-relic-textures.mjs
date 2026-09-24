import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const repositoryRoot = path.resolve(process.cwd());
const sourceRoot = path.join(repositoryRoot, "assets/source/relic-01/base/polyhaven");
const bakedRoot = path.join(repositoryRoot, "assets/source/relic-01/textures/baked");
const fallbackRoot = path.join(repositoryRoot, "assets/runtime/relic-01/textures/fallback");

const materials = [
  {
    id: "bone",
    source: "lambis_shell",
    diffuse: "lambis_shell_diff_2k.jpg",
    normal: "lambis_shell_nor_gl_2k.jpg",
    orm: "lambis_shell_arm_2k.jpg",
    tint: "#756c59",
    brightness: 0.62,
    saturation: 0.45,
  },
  {
    id: "alloy",
    source: "modular_electric_cables",
    diffuse: "modular_electric_cables_diff_2k.jpg",
    normal: "modular_electric_cables_nor_gl_2k.jpg",
    orm: "modular_electric_cables_arm_2k.jpg",
    tint: "#173f43",
    brightness: 0.48,
    saturation: 0.5,
  },
  {
    id: "core",
    source: "dead_quiver_branch_01",
    diffuse: "dead_quiver_branch_01_diff_2k.jpg",
    normal: "dead_quiver_branch_01_nor_gl_2k.jpg",
    orm: "dead_quiver_branch_01_arm_2k.jpg",
    tint: "#4d0710",
    brightness: 0.42,
    saturation: 0.78,
  },
  {
    id: "membrane",
    source: "dead_quiver_branch_01",
    diffuse: "dead_quiver_branch_01_diff_2k.jpg",
    normal: "dead_quiver_branch_01_nor_gl_2k.jpg",
    orm: "dead_quiver_branch_01_arm_2k.jpg",
    tint: "#15505b",
    brightness: 0.54,
    saturation: 0.52,
  },
];

function sourceTexture(material, filename) {
  return path.join(sourceRoot, material.source, "textures", filename);
}

async function requireSources() {
  for (const material of materials) {
    for (const filename of [material.diffuse, material.normal, material.orm]) {
      const file = sourceTexture(material, filename);
      try {
        await access(file);
      } catch {
        throw new Error(`Missing verified RELIC source texture: ${file}`);
      }
    }
  }
}

async function writePair(pipeline, id, role) {
  const sourcePath = path.join(bakedRoot, `${id}-${role}.png`);
  const fallbackPath = path.join(fallbackRoot, `${id}-${role}.webp`);
  await Promise.all([
    pipeline.clone().resize(2048, 2048, { fit: "fill" }).png({ compressionLevel: 9 }).toFile(sourcePath),
    pipeline.clone().resize(1024, 1024, { fit: "fill" }).webp({ quality: role === "normal" ? 88 : 80, effort: 6 }).toFile(fallbackPath),
  ]);
}

await requireSources();
await Promise.all([mkdir(bakedRoot, { recursive: true }), mkdir(fallbackRoot, { recursive: true })]);

for (const material of materials) {
  const baseColor = sharp(sourceTexture(material, material.diffuse))
    .greyscale()
    .tint(material.tint)
    .modulate({ brightness: material.brightness, saturation: material.saturation })
    .gamma(1.06);
  const normal = sharp(sourceTexture(material, material.normal));
  const orm = sharp(sourceTexture(material, material.orm));
  await Promise.all([
    writePair(baseColor, material.id, "basecolor"),
    writePair(normal, material.id, "normal"),
    writePair(orm, material.id, "orm"),
  ]);
}

console.log(`Generated ${materials.length * 3} RELIC source textures and ${materials.length * 3} WebP fallbacks.`);
