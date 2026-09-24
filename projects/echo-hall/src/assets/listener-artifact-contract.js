export const LISTENER_ARTIFACT_CONTRACT = Object.freeze({
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
});

export class ListenerArtifactContractError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ListenerArtifactContractError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function resolveListenerAssetManifest(manifest, level) {
  if (!Array.isArray(manifest)) throw new TypeError("Asset manifest must be an array");
  const lod = level === "low" ? "low" : "high";

  return manifest.map((entry) => {
    if (entry?.id !== "listener-artifact") return entry;
    const selected = entry.lods?.[lod];
    if (!selected?.file || !Number.isFinite(Number(selected.bytes)) || Number(selected.bytes) <= 0) {
      throw new ListenerArtifactContractError(
        "MISSING_LOD",
        `Listener artifact is missing a valid ${lod} LOD`,
        { lod },
      );
    }
    return { ...entry, file: selected.file, bytes: Number(selected.bytes) };
  });
}

export function validateListenerArtifactScene(scene) {
  const root = typeof scene?.getObjectByName === "function"
    ? scene.getObjectByName(LISTENER_ARTIFACT_CONTRACT.root)
    : null;
  if (!root || typeof root.traverse !== "function") {
    throw new ListenerArtifactContractError(
      "MISSING_ROOT",
      `Listener artifact is missing required root ${LISTENER_ARTIFACT_CONTRACT.root}`,
      { expected: LISTENER_ARTIFACT_CONTRACT.root },
    );
  }

  const bindingsByMorph = new Map(LISTENER_ARTIFACT_CONTRACT.morphs.map((name) => [name, []]));
  const requiredMaterials = new Set(LISTENER_ARTIFACT_CONTRACT.materials);
  const materialNames = new Set();
  const materialObjects = new Set();

  root.traverse((node) => {
    if (!node?.isMesh) return;

    const dictionary = node.morphTargetDictionary;
    const influences = node.morphTargetInfluences;
    if (dictionary && Array.isArray(influences)) {
      for (const morph of LISTENER_ARTIFACT_CONTRACT.morphs) {
        const index = dictionary[morph];
        if (Number.isInteger(index) && index >= 0 && index < influences.length) {
          bindingsByMorph.get(morph).push(Object.freeze({ node, influences, index }));
        }
      }
    }

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (!material || !requiredMaterials.has(material.name)) continue;
      materialNames.add(material.name);
      materialObjects.add(material);
    }
  });

  const missingMorphs = LISTENER_ARTIFACT_CONTRACT.morphs
    .filter((name) => bindingsByMorph.get(name).length === 0);
  if (missingMorphs.length > 0) {
    throw new ListenerArtifactContractError(
      "MISSING_MORPHS",
      `Listener artifact is missing required morph targets: ${missingMorphs.join(", ")}`,
      { missing: Object.freeze(missingMorphs) },
    );
  }

  const missingMaterials = LISTENER_ARTIFACT_CONTRACT.materials
    .filter((name) => !materialNames.has(name));
  if (missingMaterials.length > 0) {
    throw new ListenerArtifactContractError(
      "MISSING_MATERIALS",
      `Listener artifact is missing required materials: ${missingMaterials.join(", ")}`,
      { missing: Object.freeze(missingMaterials) },
    );
  }

  const morphBindings = Object.freeze(Object.fromEntries(
    LISTENER_ARTIFACT_CONTRACT.morphs.map((name) => [name, Object.freeze(bindingsByMorph.get(name))]),
  ));

  return Object.freeze({
    root,
    morphBindings,
    materials: Object.freeze([...materialObjects]),
  });
}

export function validateListenerArtifactAsset(gltf) {
  if (!gltf?.scene) {
    throw new ListenerArtifactContractError(
      "INVALID_GLTF",
      "Listener artifact did not load a glTF scene",
    );
  }
  const contract = validateListenerArtifactScene(gltf.scene);
  return Object.freeze({ gltf, ...contract });
}
