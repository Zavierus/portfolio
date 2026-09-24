import { build } from "esbuild";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";

const sourceEntry = "projects/pulse-room/src/main.js";
const output = "projects/pulse-room/app.bundle.js";
const workerEntry = "projects/pulse-room/src/analysis/analysis-worker.js";
const workerOutput = "projects/pulse-room/analysis-worker.bundle.js";
const essentiaSource = "node_modules/essentia.js/dist";
const essentiaOutput = "projects/pulse-room/assets/essentia";
const basisSource = "node_modules/three/examples/jsm/libs/basis";
const basisOutput = "projects/pulse-room/assets/basis";
const manifestOutput = "projects/pulse-room/build-manifest.json";
const buildStartedAt = performance.now();

await Promise.all([mkdir(essentiaOutput, { recursive: true }), mkdir(basisOutput, { recursive: true })]);
await Promise.all([
  copyFile(`${essentiaSource}/essentia-wasm.umd.js`, `${essentiaOutput}/essentia-wasm.umd.js`),
  copyFile(`${essentiaSource}/essentia-wasm.web.js`, `${essentiaOutput}/essentia-wasm.web.js`),
  copyFile(`${essentiaSource}/essentia-wasm.web.wasm`, `${essentiaOutput}/essentia-wasm.web.wasm`),
  copyFile(`${essentiaSource}/essentia.js-core.umd.min.js`, `${essentiaOutput}/essentia.js-core.umd.min.js`),
  copyFile(`${basisSource}/basis_transcoder.js`, `${basisOutput}/basis_transcoder.js`),
  copyFile(`${basisSource}/basis_transcoder.wasm`, `${basisOutput}/basis_transcoder.wasm`),
]);

await Promise.all([
  build({
    entryPoints: [sourceEntry],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    outfile: output,
    sourcemap: false,
  }),
  build({
    entryPoints: [workerEntry],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    outfile: workerOutput,
    sourcemap: false,
  }),
]);

const [bundleStats, workerStats] = await Promise.all([stat(output), stat(workerOutput)]);
const manifest = {
  sourceEntry,
  output,
  bytes: bundleStats.size,
  workerEntry,
  workerOutput,
  workerBytes: workerStats.size,
  builtAt: new Date().toISOString(),
  buildDurationMs: Math.round((performance.now() - buildStartedAt) * 100) / 100,
};

await writeFile(manifestOutput, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`PULSE ROOM bundles built (${manifest.bytes} main, ${manifest.workerBytes} worker bytes).`);
