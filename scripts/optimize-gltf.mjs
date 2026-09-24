import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(process.cwd());
const temporaryRoot = path.join(repositoryRoot, "tmp/gltf-optimize");
const gltfTransformCli = path.join(repositoryRoot, "node_modules/@gltf-transform/cli/bin/cli.js");
const ktxCandidate = process.env.KTX_BIN
  ?? (process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "Programs/KTX-Software-4.4.2/bin")
    : null);

function run(command, args, extraEnvironment = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: { ...process.env, ...extraEnvironment },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

async function resolveKtxPath() {
  if (!ktxCandidate) return process.env.PATH;
  try {
    await access(path.join(ktxCandidate, process.platform === "win32" ? "toktx.exe" : "toktx"));
    return `${ktxCandidate}${path.delimiter}${process.env.PATH ?? ""}`;
  } catch {
    throw new Error(`toktx was not found in ${ktxCandidate}. Set KTX_BIN to the KTX-Software bin directory.`);
  }
}

async function optimizeAsset({ id, file, textureSize, quality }) {
  const input = path.join(repositoryRoot, file);
  await access(input);
  const raw = path.join(temporaryRoot, `${id}-raw.glb`);
  const png = path.join(temporaryRoot, `${id}-png.glb`);
  const ktx = path.join(temporaryRoot, `${id}-ktx.glb`);
  const final = path.join(temporaryRoot, `${id}-final.glb`);
  await copyFile(input, raw);

  run(process.execPath, [gltfTransformCli,
    "optimize",
    raw,
    png,
    "--compress", "false",
    "--texture-compress", "auto",
    "--texture-size", String(textureSize),
    "--flatten", "false",
    "--join", "false",
    "--instance", "false",
    "--palette", "false",
    "--prune", "true",
    "--simplify", "false",
    "--sparse", "false",
  ]);

  const ktxPath = await resolveKtxPath();
  run(process.execPath, [gltfTransformCli,
    "etc1s",
    png,
    ktx,
    "--quality", String(quality),
    "--compression", "1",
    "--jobs", "4",
    "--mipmaps", "true",
  ], { PATH: ktxPath });

  run(process.execPath, [gltfTransformCli,
    "meshopt",
    ktx,
    final,
    "--level", "high",
    "--quantization-volume", "mesh",
    "--quantize-position", "14",
    "--quantize-normal", "10",
    "--quantize-texcoord", "12",
  ]);

  await copyFile(final, input);
  console.log(`Optimized ${file} (${textureSize}px KTX2, ETC1S quality ${quality}, Meshopt high).`);
}

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

await mkdir(temporaryRoot, { recursive: true });
const requestedFile = option("file", null);
if (requestedFile) {
  await optimizeAsset({
    id: option("id", path.basename(requestedFile, path.extname(requestedFile))),
    file: requestedFile,
    textureSize: Number(option("texture-size", 2048)),
    quality: Number(option("quality", 108)),
  });
} else {
  await optimizeAsset({
    id: "relic-01-high",
    file: "assets/runtime/relic-01/models/relic-01-high.glb",
    textureSize: 2048,
    quality: 112,
  });
  await optimizeAsset({
    id: "relic-01-low",
    file: "assets/runtime/relic-01/models/relic-01-low.glb",
    textureSize: 1024,
    quality: 96,
  });
}
