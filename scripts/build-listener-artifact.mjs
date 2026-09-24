import { access } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(process.cwd());
const blender = process.env.BLENDER_BIN ?? path.join(
  process.env.LOCALAPPDATA ?? "",
  "Programs/Blender/blender-4.5.12-windows-x64/blender.exe",
);
const blend = "assets/source/echo-hall/blender/listener-artifact.blend";

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repositoryRoot, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

await access(blender);
run(process.execPath, ["scripts/generate-listener-artifact-textures.mjs"]);
run(blender, ["--background", "--python", "scripts/blender/listener_artifact_author.py"]);

for (const level of ["high", "low"]) {
  const file = `projects/echo-hall/assets/models/listener-artifact-${level}.glb`;
  run(blender, [
    "--background",
    blend,
    "--python",
    "scripts/blender/listener_artifact_export.py",
    "--",
    "--lod",
    level,
    "--output",
    file,
  ]);
  run(process.execPath, [
    "scripts/optimize-gltf.mjs",
    "--id",
    `listener-artifact-${level}`,
    "--file",
    file,
    "--texture-size",
    level === "high" ? "2048" : "1024",
    "--quality",
    level === "high" ? "112" : "96",
  ]);
}

run(process.execPath, ["scripts/validate-listener-artifact.mjs"]);
