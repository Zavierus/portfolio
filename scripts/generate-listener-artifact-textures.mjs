import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const size = 2048;
const outputRoot = path.resolve(
  "assets/source/echo-hall/textures/listener-artifact",
);
const clamp = (value, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(maximum, value));
const clampByte = (value) => Math.round(clamp(value, 0, 255));
const mix = (a, b, amount) => a + (b - a) * clamp(amount);

function layeredField(x, y, phase = 0) {
  return (
    Math.sin(x * 0.0127 + phase) * 0.34
    + Math.sin(y * 0.0181 - phase * 1.7) * 0.24
    + Math.sin((x + y) * 0.0063 + phase * 2.1) * 0.2
    + Math.sin((x * 0.031 - y * 0.023) + phase * 0.6) * 0.13
    + Math.sin(Math.hypot(x - 1229, y - 731) * 0.0091 + phase) * 0.09
  );
}

function ceramicHeight(x, y) {
  const warpX = x + Math.sin(y * 0.009) * 48 + Math.sin(y * 0.027) * 13;
  const warpY = y + Math.sin(x * 0.007) * 39 - Math.sin(x * 0.021) * 11;
  const seamA = Math.exp(
    -Math.abs(Math.sin(warpX * 0.0081 + warpY * 0.0047)) * 64,
  ) * clamp(Math.sin(warpX * 0.0037 - warpY * 0.0061 + 0.4) * 2.4);
  const seamB = Math.exp(
    -Math.abs(Math.sin(warpY * 0.0107 - warpX * 0.0039 + 1.8)) * 70,
  ) * clamp(Math.sin(warpX * 0.0053 + warpY * 0.0031 + 2.2) * 2.7);
  const seamC = Math.exp(
    -Math.abs(Math.sin(warpX * 0.0049 - warpY * 0.0073 + 0.7)) * 78,
  ) * clamp(Math.sin(warpX * 0.0023 + warpY * 0.0087 - 1.1) * 3.1);
  const fracture = Math.max(seamA, seamB, seamC);
  const chips = Math.exp(-Math.abs(Math.sin(warpX * 0.071 + warpY * 0.053)) * 36);
  return layeredField(x, y, 0.3) * 0.18 - fracture * (0.8 + chips * 0.35);
}

function titaniumHeight(x, y) {
  const sweep = x * 0.91 + y * 0.24 + Math.sin(y * 0.006) * 26;
  const machining = Math.sin(sweep * 0.17) * 0.44 + Math.sin(sweep * 0.47) * 0.11;
  return machining + layeredField(x, y, 1.9) * 0.22;
}

function membraneHeight(x, y) {
  const drift = x + Math.sin(y * 0.0047) * 96;
  const fibres = Math.sin(drift * 0.095 + Math.sin(y * 0.013) * 1.7);
  const crossFibres = Math.sin((x * 0.018 - y * 0.083) + 0.9) * 0.28;
  return fibres * 0.55 + crossFibres + layeredField(x, y, 3.4) * 0.18;
}

function coreHeight(x, y) {
  const warp = layeredField(x * 0.76, y * 0.76, 5.1) * 42;
  const fissureA = Math.exp(
    -Math.abs(Math.sin((x + warp) * 0.0089 + y * 0.0037)) * 52,
  ) * clamp(Math.sin(x * 0.0041 - y * 0.0067 + 1.3) * 2.8);
  const fissureB = Math.exp(
    -Math.abs(Math.sin((y - warp) * 0.0117 - x * 0.0049 + 1.1)) * 58,
  ) * clamp(Math.sin(x * 0.0063 + y * 0.0029 - 0.7) * 3);
  const fissureC = Math.exp(
    -Math.abs(Math.sin(x * 0.0061 + y * 0.0079 + warp * 0.016)) * 64,
  ) * clamp(Math.sin(y * 0.0057 - x * 0.0021 + 2.5) * 2.6);
  const fissure = Math.max(fissureA, fissureB, fissureC);
  const oxidized = layeredField(x, y, 5.8) * 0.32;
  return oxidized - fissure * 0.88;
}

function ceramicBaseColor(x, y) {
  const height = ceramicHeight(x, y);
  const seam = clamp(-height - 0.35);
  const grain = layeredField(x, y, 0.8);
  return [
    23 + grain * 8 + seam * 14,
    27 + grain * 9 + seam * 11,
    29 + grain * 10 + seam * 8,
    255,
  ];
}

function titaniumBaseColor(x, y) {
  const grain = titaniumHeight(x, y);
  const highlight = Math.pow(Math.abs(Math.sin((x * 0.91 + y * 0.24) * 0.019)), 18);
  return [
    54 + grain * 10 + highlight * 15,
    68 + grain * 13 + highlight * 18,
    78 + grain * 15 + highlight * 22,
    255,
  ];
}

function membraneBaseColor(x, y) {
  const fibre = membraneHeight(x, y);
  const tension = 0.5 + Math.sin(y * 0.006 + Math.sin(x * 0.004) * 1.3) * 0.5;
  return [
    24 + fibre * 7 + tension * 5,
    69 + fibre * 15 + tension * 9,
    76 + fibre * 18 + tension * 12,
    255,
  ];
}

function coreBaseColor(x, y) {
  const height = coreHeight(x, y);
  const fissure = clamp(-height - 0.28);
  const oxidation = layeredField(x, y, 6.7);
  return [
    18 + oxidation * 6 + fissure * 58,
    12 + oxidation * 3 + fissure * 9,
    14 + oxidation * 4 + fissure * 8,
    255,
  ];
}

const materialSpecs = Object.freeze({
  ceramic: {
    baseColor: ceramicBaseColor,
    height: ceramicHeight,
    normalStrength: 18,
    orm(x, y) {
      const field = layeredField(x, y, 2.6) * 0.5 + 0.5;
      return [mix(218, 252, field), mix(173, 230, field), mix(20, 51, 1 - field), 255];
    },
  },
  titanium: {
    baseColor: titaniumBaseColor,
    height: titaniumHeight,
    normalStrength: 13,
    orm(x, y) {
      const field = titaniumHeight(x, y) * 0.5 + 0.5;
      return [mix(232, 255, field), mix(64, 133, field), mix(199, 245, 1 - field), 255];
    },
  },
  membrane: {
    baseColor: membraneBaseColor,
    height: membraneHeight,
    normalStrength: 11,
    orm(x, y) {
      const field = membraneHeight(x, y) * 0.34 + 0.5;
      return [mix(224, 250, field), mix(31, 77, field), 0, 255];
    },
  },
  core: {
    baseColor: coreBaseColor,
    height: coreHeight,
    normalStrength: 17,
    orm(x, y) {
      const field = layeredField(x, y, 7.2) * 0.5 + 0.5;
      return [mix(204, 247, field), mix(107, 179, field), mix(46, 107, 1 - field), 255];
    },
  },
});

function sampleNormal(height, strength, x, y) {
  const dx = height(x + 1, y) - height(x - 1, y);
  const dy = height(x, y + 1) - height(x, y - 1);
  const nx = -dx * strength;
  const ny = -dy * strength;
  const inverseLength = 1 / Math.hypot(nx, ny, 1);
  return [
    128 + nx * inverseLength * 127,
    128 + ny * inverseLength * 127,
    128 + inverseLength * 127,
    255,
  ];
}

async function writeTexture(name, pixel) {
  const pixels = Buffer.allocUnsafe(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const values = pixel(x, y);
      pixels[offset] = clampByte(values[0]);
      pixels[offset + 1] = clampByte(values[1]);
      pixels[offset + 2] = clampByte(values[2]);
      pixels[offset + 3] = clampByte(values[3] ?? 255);
    }
  }

  await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(outputRoot, `${name}.png`));
}

await mkdir(outputRoot, { recursive: true });
for (const [material, spec] of Object.entries(materialSpecs)) {
  await writeTexture(`${material}-basecolor`, spec.baseColor);
  await writeTexture(`${material}-normal`, (x, y) =>
    sampleNormal(spec.height, spec.normalStrength, x, y),
  );
  await writeTexture(`${material}-orm`, spec.orm);
}

console.log("Generated 12 Listener artifact PBR textures");
