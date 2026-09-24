import { build } from "esbuild";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";

const sourceEntry = "projects/echo-hall/src/main.js";
const output = "projects/echo-hall/app.bundle.js";
const manifestOutput = "projects/echo-hall/build-manifest.json";
const basisSource = "node_modules/three/examples/jsm/libs/basis";
const basisOutput = "projects/echo-hall/assets/basis";
const startedAt = performance.now();

await mkdir(basisOutput, { recursive: true });
await Promise.all([
  copyFile(`${basisSource}/basis_transcoder.js`, `${basisOutput}/basis_transcoder.js`),
  copyFile(`${basisSource}/basis_transcoder.wasm`, `${basisOutput}/basis_transcoder.wasm`),
]);

await build({
  entryPoints: [sourceEntry],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  outfile: output,
  sourcemap: false,
});

const stats = await stat(output);
const manifest = {
  product: "THE LISTENER",
  sourceEntry,
  output,
  bytes: stats.size,
  builtAt: new Date().toISOString(),
  buildDurationMs: Math.round((performance.now() - startedAt) * 100) / 100,
};
await writeFile(manifestOutput, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`THE LISTENER bundle built (${manifest.bytes} bytes).`);
