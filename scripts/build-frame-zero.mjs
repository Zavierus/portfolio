import { build } from "esbuild";
import { stat, writeFile } from "node:fs/promises";

const sourceEntry = "projects/frame-zero/src/main.js";
const output = "projects/frame-zero/game.bundle.js";
const manifestOutput = "projects/frame-zero/build-manifest.json";
const buildStartedAt = performance.now();

await build({
  entryPoints: [sourceEntry],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  outfile: output,
  sourcemap: false,
});

const bundleStats = await stat(output);
const manifest = {
  sourceEntry,
  output,
  bytes: bundleStats.size,
  builtAt: new Date().toISOString(),
  buildDurationMs: Math.round((performance.now() - buildStartedAt) * 100) / 100,
};

await writeFile(manifestOutput, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`FRAME//ZERO bundle built (${manifest.bytes} bytes).`);
