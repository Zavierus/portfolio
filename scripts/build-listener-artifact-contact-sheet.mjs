import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import sharp from "sharp";

const repositoryRoot = path.resolve(process.cwd());
const outputRoot = path.join(repositoryRoot, "docs/qa/listener-artifact");
const blend = path.join(repositoryRoot, "assets/source/echo-hall/blender/listener-artifact.blend");
const reviewScript = path.join(repositoryRoot, "scripts/blender/listener_artifact_review.py");
const blender = process.env.BLENDER_BIN ?? path.join(
  process.env.LOCALAPPDATA ?? "",
  "Programs/Blender/blender-4.5.12-windows-x64/blender.exe",
);
const filenames = [
  "01-front-closed.png",
  "02-side-closed.png",
  "03-back-closed.png",
  "04-material-close.png",
  "05-front-open.png",
  "06-side-open.png",
];

await mkdir(outputRoot, { recursive: true });
const result = spawnSync(blender, [
  "--background",
  blend,
  "--python",
  reviewScript,
  "--",
  "--output-dir",
  outputRoot,
], { cwd: repositoryRoot, stdio: "inherit", timeout: 300_000 });
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`Blender review render exited with status ${result.status}`);

const composites = [];
for (const [index, filename] of filenames.entries()) {
  const label = Buffer.from(`
    <svg width="928" height="928" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="886" width="928" height="42" fill="#050606" fill-opacity="0.9" />
      <text x="16" y="912" fill="#d9ff32" font-family="Consolas, monospace" font-size="16">${filename.replace(".png", "").toUpperCase()}</text>
    </svg>
  `);
  const input = await sharp(path.join(outputRoot, filename))
    .resize(928, 928, { fit: "cover" })
    .composite([{ input: label }])
    .png()
    .toBuffer();
  composites.push({
    input,
    left: 16 + (index % 3) * 960,
    top: 16 + Math.floor(index / 3) * 960,
  });
}

await sharp({
  create: { width: 2880, height: 1920, channels: 4, background: "#020303" },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputRoot, "contact-sheet.png"));

console.log(`Built Listener artifact contact sheet: ${path.join(outputRoot, "contact-sheet.png")}`);
