import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const size = 1024;
const outputRoot = path.resolve("assets/source/pulse-room/textures/signal-chrysalis");
const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));

function field(x, y, phase = 0) {
  return (
    Math.sin(x * 0.061 + phase)
    + Math.sin(y * 0.043 - phase * 0.7)
    + Math.sin((x + y) * 0.019 + phase * 1.9)
    + Math.sin(Math.hypot(x - 612, y - 387) * 0.034 + phase)
  ) * 0.25;
}

async function writeTexture(name, pixel) {
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const values = pixel(x, y);
      pixels[offset] = clampByte(values[0]);
      pixels[offset + 1] = clampByte(values[1]);
      pixels[offset + 2] = clampByte(values[2]);
      pixels[offset + 3] = values[3] ?? 255;
    }
  }
  await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(outputRoot, `${name}.png`));
}

await mkdir(outputRoot, { recursive: true });
await Promise.all([
  writeTexture("titanium-basecolor", (x, y) => {
    const grain = field(x, y, 0.8);
    const scar = Math.abs(Math.sin(x * 0.22 + y * 0.013)) > 0.992 ? 22 : 0;
    return [34 + grain * 15 + scar, 39 + grain * 17 + scar, 42 + grain * 18 + scar, 255];
  }),
  writeTexture("titanium-normal", (x, y) => {
    const dx = field(x + 2, y, 1.1) - field(x - 2, y, 1.1);
    const dy = field(x, y + 2, 1.1) - field(x, y - 2, 1.1);
    return [128 + dx * 26, 128 + dy * 26, 250, 255];
  }),
  writeTexture("titanium-orm", (x, y) => {
    const grain = field(x, y, 2.2);
    return [238, 72 + grain * 22, 232 + grain * 8, 255];
  }),
  writeTexture("polymer-basecolor", (x, y) => {
    const grain = field(x, y, 3.7);
    const vein = Math.pow(Math.max(0, Math.sin(x * 0.018 + Math.sin(y * 0.027) * 2.2)), 18);
    return [42 + grain * 16 + vein * 38, 24 + grain * 7, 70 + grain * 26 + vein * 54, 255];
  }),
  writeTexture("polymer-normal", (x, y) => {
    const dx = field(x + 3, y, 4.1) - field(x - 3, y, 4.1);
    const dy = field(x, y + 3, 4.1) - field(x, y - 3, 4.1);
    return [128 + dx * 34, 128 + dy * 34, 247, 255];
  }),
  writeTexture("polymer-orm", (x, y) => {
    const grain = field(x, y, 5.3);
    return [224, 96 + grain * 34, 28 + grain * 5, 255];
  }),
]);

console.log(`Generated SIGNAL CHRYSALIS PBR textures in ${outputRoot}`);
