from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT_NAME = "LISTENER_ARTIFACT_ROOT"
SOURCE_ROOTS = {
    "high": ROOT_NAME,
    "low": "LISTENER_ARTIFACT_LOW_SOURCE",
}
MORPHS = ("shell_open", "membrane_tension", "core_exposure", "balance_shift", "signal_sweep")
MATERIALS = (
    "MAT_CERAMIC_SHELL",
    "MAT_TITANIUM_SPINE",
    "MAT_SIGNAL_MEMBRANE",
    "MAT_ARCHIVE_CORE",
    "MAT_ACID_SIGNAL",
)
TRIANGLE_BOUNDS = {
    "high": (90_000, 150_000),
    "low": (28_000, 45_000),
}


def script_args():
    parser = argparse.ArgumentParser(description="Validate and export the authored Listener artifact.")
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parsed = parser.parse_args(args)
    if not parsed.validate_only and parsed.output is None:
        parser.error("--output is required unless --validate-only is used")
    return parsed


def descendants(root):
    yield root
    yield from root.children_recursive


def triangle_count(meshes):
    total = 0
    for obj in meshes:
        obj.data.calc_loop_triangles()
        total += len(obj.data.loop_triangles)
    return total


def object_bounds(meshes):
    minimum = Vector((float("inf"),) * 3)
    maximum = Vector((float("-inf"),) * 3)
    for obj in meshes:
        for vertex in obj.data.vertices:
            coordinate = vertex.co
            minimum.x = min(minimum.x, coordinate.x)
            minimum.y = min(minimum.y, coordinate.y)
            minimum.z = min(minimum.z, coordinate.z)
            maximum.x = max(maximum.x, coordinate.x)
            maximum.y = max(maximum.y, coordinate.y)
            maximum.z = max(maximum.z, coordinate.z)
    return maximum - minimum


def validate_morph_samples(meshes):
    for obj in meshes:
        shape_keys = obj.data.shape_keys
        if not shape_keys:
            continue
        basis = shape_keys.key_blocks.get("Basis")
        if basis is None:
            return False
        for key in shape_keys.key_blocks:
            if key.name == "Basis":
                continue
            for weight in (0.0, 0.5, 1.0):
                for index, point in enumerate(key.data):
                    source = basis.data[index].co
                    coordinate = source.lerp(point.co, weight)
                    if not all(math.isfinite(value) for value in coordinate):
                        return False
    return True


def validate_contract(lod):
    root = bpy.data.objects.get(SOURCE_ROOTS[lod])
    if root is None:
        raise RuntimeError(f"Missing Listener source root for {lod}: {SOURCE_ROOTS[lod]}")
    meshes = [obj for obj in descendants(root) if obj.type == "MESH" and not obj.hide_render]
    if not meshes:
        raise RuntimeError(f"Listener {lod} source has no renderable meshes")

    morph_names = set()
    material_names = set()
    for obj in meshes:
        if obj.data.shape_keys:
            morph_names.update(key.name for key in obj.data.shape_keys.key_blocks if key.name != "Basis")
        material_names.update(slot.material.name for slot in obj.material_slots if slot.material)
    missing_morphs = [name for name in MORPHS if name not in morph_names]
    missing_materials = [name for name in MATERIALS if name not in material_names]
    if missing_morphs:
        raise RuntimeError(f"Listener {lod} source is missing morphs: {missing_morphs}")
    if missing_materials:
        raise RuntimeError(f"Listener {lod} source is missing materials: {missing_materials}")

    triangles = triangle_count(meshes)
    minimum, maximum = TRIANGLE_BOUNDS[lod]
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"Listener {lod} has {triangles} triangles; expected {minimum}-{maximum}")
    bounds = object_bounds(meshes)
    if not all(math.isfinite(value) and value > 0 for value in bounds):
        raise RuntimeError(f"Listener {lod} has invalid bounds: {tuple(bounds)}")
    samples_finite = validate_morph_samples(meshes)
    if not samples_finite:
        raise RuntimeError(f"Listener {lod} has non-finite morph samples")
    return root, meshes, {
        "root": ROOT_NAME,
        "lod": lod,
        "morphs": list(MORPHS),
        "materials": list(MATERIALS),
        "triangles": triangles,
        "bounds": [round(float(value), 6) for value in bounds],
        "morphSamplesFinite": samples_finite,
    }


def export_glb(root, meshes, output):
    original_name = root.name
    conflicting_root = bpy.data.objects.get(ROOT_NAME)
    conflicting_name = None
    if conflicting_root is not None and conflicting_root != root:
        conflicting_name = conflicting_root.name
        conflicting_root.name = "__LISTENER_ARTIFACT_ROOT_EXPORT_HOLD__"
    root.name = ROOT_NAME
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        bpy.ops.export_scene.gltf(
            filepath=str(output.resolve()),
            export_format="GLB",
            use_selection=True,
            export_apply=False,
            export_texcoords=True,
            export_normals=True,
            export_tangents=False,
            export_materials="EXPORT",
            export_image_format="AUTO",
            export_animations=True,
            export_animation_mode="ACTIONS",
            export_morph=True,
            export_morph_animation=True,
            export_morph_normal=True,
            export_morph_tangent=False,
            export_lights=False,
            export_cameras=False,
            export_extras=True,
            export_unused_images=False,
            export_unused_textures=False,
            export_optimize_animation_size=False,
            check_existing=False,
            export_yup=True,
        )
    finally:
        root.name = original_name
        if conflicting_root is not None and conflicting_name is not None:
            conflicting_root.name = conflicting_name


def main():
    args = script_args()
    root, meshes, report = validate_contract(args.lod)
    print("LISTENER_CONTRACT_JSON", json.dumps(report, separators=(",", ":")))
    if not args.validate_only:
        export_glb(root, meshes, args.output)
        print(f"Exported Listener artifact {args.lod}: {args.output} ({report['triangles']} triangles)")


if __name__ == "__main__":
    main()
