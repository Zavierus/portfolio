import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds, getGLPrimitiveCount } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";

export const LISTENER_RUNTIME_CONTRACT = Object.freeze({
  root: "LISTENER_ARTIFACT_ROOT",
  morphs: Object.freeze([
    "shell_open",
    "membrane_tension",
    "core_exposure",
    "balance_shift",
    "signal_sweep",
  ]),
  materials: Object.freeze([
    "MAT_CERAMIC_SHELL",
    "MAT_TITANIUM_SPINE",
    "MAT_SIGNAL_MEMBRANE",
    "MAT_ARCHIVE_CORE",
    "MAT_ACID_SIGNAL",
  ]),
  triangleBounds: Object.freeze({
    high: Object.freeze([90_000, 150_000]),
    low: Object.freeze([28_000, 45_000]),
  }),
});

const REQUIRED_EXTENSIONS = Object.freeze(["EXT_meshopt_compression", "KHR_texture_basisu"]);

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function addError(errors, level, message) {
  errors.push(`${level} LOD ${message}`);
}

function readGlbJson(buffer, filePath) {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) {
    throw new Error(`${filePath} is not a glTF 2.0 binary`);
  }
  const jsonLength = buffer.readUInt32LE(12);
  if (buffer.readUInt32LE(16) !== 0x4e4f534a) throw new Error(`${filePath} has no JSON chunk`);
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8"));
}

function hasOnlyFiniteValues(accessor) {
  const values = accessor.getArray();
  if (!values) return false;
  for (const value of values) {
    if (!Number.isFinite(value)) return false;
  }
  return true;
}

function dimensions(bounds) {
  return bounds.max.map((maximum, axis) => maximum - bounds.min[axis]);
}

function sameMembers(actual, expected) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

export async function inspectListenerArtifact(filePath, level) {
  if (!Object.hasOwn(LISTENER_RUNTIME_CONTRACT.triangleBounds, level)) {
    throw new Error(`Unknown Listener LOD: ${level}`);
  }

  await MeshoptDecoder.ready;
  const [buffer, file] = await Promise.all([readFile(filePath), stat(filePath)]);
  const json = readGlbJson(buffer, filePath);
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const document = await io.readBinary(buffer);
  const root = document.getRoot();
  const errors = [];

  const matchingRoots = root.listNodes().filter((node) => node.getName() === LISTENER_RUNTIME_CONTRACT.root);
  if (matchingRoots.length !== 1) {
    addError(errors, level, `must contain exactly one ${LISTENER_RUNTIME_CONTRACT.root} node; found ${matchingRoots.length}`);
  }

  const morphs = [...new Set((json.meshes ?? []).flatMap((mesh) => mesh.extras?.targetNames ?? []))];
  if (!sameMembers(morphs, LISTENER_RUNTIME_CONTRACT.morphs)) {
    addError(errors, level, `morph contract is ${sorted(morphs).join(", ") || "empty"}`);
  }

  const materials = root.listMaterials().map((material) => material.getName());
  if (!sameMembers(materials, LISTENER_RUNTIME_CONTRACT.materials)) {
    addError(errors, level, `material contract is ${sorted(materials).join(", ") || "empty"}`);
  }

  const triangles = root.listMeshes().reduce(
    (total, mesh) => total + mesh.listPrimitives().reduce((sum, primitive) => sum + getGLPrimitiveCount(primitive), 0),
    0,
  );
  const [minimumTriangles, maximumTriangles] = LISTENER_RUNTIME_CONTRACT.triangleBounds[level];
  if (triangles < minimumTriangles || triangles > maximumTriangles) {
    addError(errors, level, `has ${triangles} triangles; expected ${minimumTriangles}-${maximumTriangles}`);
  }

  const accessors = root.listAccessors();
  if (accessors.length === 0 || !accessors.every(hasOnlyFiniteValues)) {
    addError(errors, level, "contains missing or non-finite accessor values");
  }

  const scenes = root.listScenes();
  const bounds = scenes.length === 1 ? getBounds(scenes[0]) : null;
  if (!bounds || ![...bounds.min, ...bounds.max].every(Number.isFinite)) {
    addError(errors, level, "has non-finite scene bounds");
  }

  for (const extension of REQUIRED_EXTENSIONS) {
    if (!json.extensionsUsed?.includes(extension) || !json.extensionsRequired?.includes(extension)) {
      addError(errors, level, `must require ${extension}`);
    }
  }
  if ((json.images ?? []).length === 0 || !(json.images ?? []).every(({ mimeType }) => mimeType === "image/ktx2")) {
    addError(errors, level, "must contain only KTX2 images");
  }

  return Object.freeze({
    level,
    file: filePath,
    bytes: file.size,
    triangles,
    bounds,
    dimensions: bounds ? dimensions(bounds) : null,
    morphs: Object.freeze(sorted(morphs)),
    materials: Object.freeze(sorted(materials)),
    errors: Object.freeze(errors),
  });
}

export async function validateListenerArtifactModels(options = {}) {
  const repositoryRoot = path.resolve(options.repositoryRoot ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  const modelsDirectory = path.resolve(options.modelsDirectory ?? path.join(repositoryRoot, "projects/echo-hall/assets/models"));
  const reports = await Promise.all(["high", "low"].map((level) => (
    inspectListenerArtifact(path.join(modelsDirectory, `listener-artifact-${level}.glb`), level)
  )));
  const errors = reports.flatMap((report) => report.errors);

  if (reports.every((report) => report.dimensions)) {
    const [high, low] = reports;
    high.dimensions.forEach((highSize, axis) => {
      const difference = Math.abs(low.dimensions[axis] - highSize) / highSize;
      if (!Number.isFinite(difference) || difference > 0.03) {
        errors.push(`Listener high/low bounds differ by ${(difference * 100).toFixed(2)}% on axis ${axis}; maximum is 3%`);
      }
    });
  }

  return Object.freeze({ reports: Object.freeze(reports), errors: Object.freeze(errors) });
}

async function runCli() {
  try {
    const result = await validateListenerArtifactModels();
    if (result.errors.length > 0) {
      result.errors.forEach((error) => console.error(error));
      process.exitCode = 1;
      return;
    }
    const totalBytes = result.reports.reduce((sum, report) => sum + report.bytes, 0);
    console.log(`Listener artifact GLBs validated (${totalBytes} bytes).`);
    result.reports.forEach((report) => console.log(JSON.stringify({
      level: report.level,
      bytes: report.bytes,
      triangles: report.triangles,
      dimensions: report.dimensions.map((value) => Number(value.toFixed(6))),
    })));
  } catch (error) {
    console.error(`Unable to validate Listener artifact GLBs: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await runCli();
