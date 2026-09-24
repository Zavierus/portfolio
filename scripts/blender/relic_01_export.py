from __future__ import annotations

from pathlib import Path

import bpy


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIRECTORY = REPOSITORY_ROOT / "assets" / "runtime" / "relic-01" / "models"
HIGH_OUTPUT = OUTPUT_DIRECTORY / "relic-01-high.glb"
LOW_OUTPUT = OUTPUT_DIRECTORY / "relic-01-low.glb"

HIGH_MINIMUM = 150_000
HIGH_MAXIMUM = 180_000
LOW_TARGET = 56_000
LOW_MINIMUM = 50_000
LOW_MAXIMUM = 60_000
REQUIRED_SHAPE_KEYS = {"membrane_tension", "fibre_reveal", "core_wake", "signal_sweep"}
REQUIRED_ACTIONS = REQUIRED_SHAPE_KEYS | {"turntable_idle"}


def triangle_count(obj: bpy.types.Object) -> int:
    if obj.type != "MESH":
        return 0
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


def collection_objects() -> list[bpy.types.Object]:
    collection = bpy.data.collections.get("RELIC_EXPORT")
    if collection is None:
        raise RuntimeError("RELIC_EXPORT collection is missing")
    objects = list(collection.all_objects)
    if bpy.data.objects.get("RELIC_ROOT") not in objects:
        raise RuntimeError("RELIC_ROOT is missing from RELIC_EXPORT")
    return objects


def validate_source(objects: list[bpy.types.Object]) -> None:
    meshes = [obj for obj in objects if obj.type == "MESH"]
    total = sum(triangle_count(obj) for obj in meshes)
    if not HIGH_MINIMUM <= total <= HIGH_MAXIMUM:
        raise RuntimeError(f"High LOD has {total} triangles; expected {HIGH_MINIMUM}-{HIGH_MAXIMUM}")

    shape_keys = {
        key.name
        for obj in meshes
        if obj.data.shape_keys
        for key in obj.data.shape_keys.key_blocks
        if key.name != "Basis"
    }
    if shape_keys != REQUIRED_SHAPE_KEYS:
        raise RuntimeError(f"Unexpected shape-key contract: {sorted(shape_keys)}")

    actions = {action.name for action in bpy.data.actions}
    missing_actions = REQUIRED_ACTIONS - actions
    if missing_actions:
        raise RuntimeError(f"Missing actions: {sorted(missing_actions)}")

    materials = {material.name for obj in meshes for material in obj.data.materials if material}
    required_materials = {
        "MAT_RELIC_Bone",
        "MAT_RELIC_OxidizedAlloy",
        "MAT_RELIC_Membrane",
        "MAT_RELIC_Fibre",
        "MAT_RELIC_Core",
        "MAT_RELIC_Signal",
    }
    if materials != required_materials:
        raise RuntimeError(f"Unexpected material contract: {sorted(materials)}")


def select_for_export(objects: list[bpy.types.Object]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.hide_viewport = False
        obj.hide_render = False
        obj.select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects["RELIC_ROOT"]


def export_glb(path: Path, objects: list[bpy.types.Object]) -> None:
    select_for_export(objects)
    bpy.context.scene.frame_set(1)
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
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
    )


def apply_modifier(obj: bpy.types.Object, modifier: bpy.types.Modifier) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def make_low_lod(objects: list[bpy.types.Object]) -> int:
    shell = bpy.data.objects.get("RELIC_BoneShell")
    if shell is None:
        raise RuntimeError("RELIC_BoneShell is missing")
    fixed = sum(triangle_count(obj) for obj in objects if obj.type == "MESH" and obj != shell)
    shell_current = triangle_count(shell)
    shell_target = LOW_TARGET - fixed
    if shell_target <= 0 or shell_target >= shell_current:
        raise RuntimeError(f"Cannot resolve low LOD shell target from fixed triangle cost {fixed}")

    decimate = shell.modifiers.new("Runtime low LOD", "DECIMATE")
    decimate.decimate_type = "COLLAPSE"
    decimate.ratio = shell_target / shell_current
    decimate.use_collapse_triangulate = True
    apply_modifier(shell, decimate)
    shell.data.name = "RELIC_BoneShell_Low"

    total = sum(triangle_count(obj) for obj in objects if obj.type == "MESH")
    if not LOW_MINIMUM <= total <= LOW_MAXIMUM:
        raise RuntimeError(f"Low LOD has {total} triangles; expected {LOW_MINIMUM}-{LOW_MAXIMUM}")
    return total


def main() -> None:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    objects = collection_objects()
    validate_source(objects)
    high_triangles = sum(triangle_count(obj) for obj in objects if obj.type == "MESH")
    export_glb(HIGH_OUTPUT, objects)
    low_triangles = make_low_lod(objects)
    export_glb(LOW_OUTPUT, objects)

    print("RELIC_EXPORT_HIGH", HIGH_OUTPUT, high_triangles, HIGH_OUTPUT.stat().st_size)
    print("RELIC_EXPORT_LOW", LOW_OUTPUT, low_triangles, LOW_OUTPUT.stat().st_size)
    print("RELIC_EXPORT_ACTIONS", sorted(action.name for action in bpy.data.actions))


if __name__ == "__main__":
    main()
