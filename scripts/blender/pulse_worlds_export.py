import argparse
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pulse_worlds_author import WORLD_CONTRACTS


def script_args():
    parser = argparse.ArgumentParser(description="Validate and export one authored PULSE world.")
    parser.add_argument("--world", choices=WORLD_CONTRACTS, required=True)
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def descendants(root):
    yield root
    yield from root.children_recursive


def validate_contract(world_id):
    root_name, controls = WORLD_CONTRACTS[world_id]
    root = bpy.data.objects.get(root_name)
    if root is None:
        raise RuntimeError(f"Missing root object: {root_name}")

    morphs = set()
    visible_meshes = []
    for obj in descendants(root):
        if obj.type == "MESH" and not obj.hide_render:
            visible_meshes.append(obj)
        if obj.type == "MESH" and obj.data.shape_keys:
            morphs.update(block.name for block in obj.data.shape_keys.key_blocks if block.name != "Basis")
    missing_morphs = [name for name in controls if name not in morphs]
    if missing_morphs:
        raise RuntimeError(f"Missing shape keys: {', '.join(missing_morphs)}")
    if not visible_meshes:
        raise RuntimeError("The world contains no renderable authored mesh")

    actions = {action.name for action in bpy.data.actions}
    missing_actions = [name for name in controls if name not in actions]
    if missing_actions:
        raise RuntimeError(f"Missing animation actions: {', '.join(missing_actions)}")
    return root, visible_meshes


def triangle_count(meshes):
    total = 0
    for obj in meshes:
        obj.data.calc_loop_triangles()
        total += len(obj.data.loop_triangles)
    return total


def main():
    args = script_args()
    root, meshes = validate_contract(args.world)
    triangles = triangle_count(meshes)
    bounds = (80_000, 140_000) if args.lod == "high" else (25_000, 45_000)
    if not bounds[0] <= triangles <= bounds[1]:
        raise RuntimeError(f"{args.world}:{args.lod} has {triangles} triangles; expected {bounds[0]}-{bounds[1]}")
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root
    args.output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(args.output.resolve()),
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
    print(f"Exported {args.world}:{args.lod} -> {args.output} ({triangles} source triangles)")


if __name__ == "__main__":
    main()
