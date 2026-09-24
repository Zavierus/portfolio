from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT_NAME = "LISTENER_ARTIFACT_ROOT"
LOW_ROOT_NAME = "LISTENER_ARTIFACT_LOW_SOURCE"
MORPHS = ("shell_open", "membrane_tension", "core_exposure", "balance_shift", "signal_sweep")


def script_args():
    parser = argparse.ArgumentParser(description="Render the six-view Listener artifact review set.")
    parser.add_argument("--output-dir", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def remove_review_objects():
    for obj in list(bpy.data.objects):
        if obj.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(obj, do_unlink=True)


def configure_scene():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 20
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.use_file_extension = True
    scene.render.image_settings.color_depth = "8"
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.0015, 0.0025, 0.0035, 1.0)
    background.inputs["Strength"].default_value = 0.035
    scene.view_settings.look = "AgX - Medium High Contrast"

    camera_data = bpy.data.cameras.new("LISTENER_REVIEW_CAMERA")
    camera = bpy.data.objects.new("LISTENER_REVIEW_CAMERA", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera

    lights = (
        ("LISTENER_REVIEW_KEY", "AREA", (-5.5, -6.5, 7.5), (0.92, 0.96, 1.0), 1180.0, 5.5),
        ("LISTENER_REVIEW_CYAN", "AREA", (5.5, 1.8, 5.0), (0.15, 0.68, 0.92), 980.0, 4.0),
        ("LISTENER_REVIEW_ACID", "AREA", (-1.5, 3.0, -2.0), (0.62, 1.0, 0.08), 85.0, 2.0),
        ("LISTENER_REVIEW_CORE", "POINT", (0.2, -2.2, 0.1), (1.0, 0.018, 0.012), 72.0, 0.0),
    )
    for name, light_type, location, color, energy, size in lights:
        data = bpy.data.lights.new(name, light_type)
        data.color = color
        data.energy = energy
        if light_type == "AREA":
            data.shape = "DISK"
            data.size = size
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.location = location
        look_at(light, (0.0, 0.0, 0.0))
    return scene, camera


def set_morphs(root, values):
    for obj in root.children_recursive:
        if obj.type != "MESH" or not obj.data.shape_keys:
            continue
        for name in MORPHS:
            key = obj.data.shape_keys.key_blocks.get(name)
            if key:
                key.value = float(values.get(name, 0.0))


def set_visibility(root, visible):
    root.hide_render = not visible
    for obj in root.children_recursive:
        obj.hide_render = not visible


def render_view(scene, camera, output, position, target, lens, morphs):
    root = bpy.data.objects[ROOT_NAME]
    set_morphs(root, morphs)
    camera.location = position
    camera.data.lens = lens
    look_at(camera, target)
    scene.render.filepath = str(output.resolve())
    bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Listener review frame: {output.name}")


def main():
    args = script_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    high_root = bpy.data.objects.get(ROOT_NAME)
    low_root = bpy.data.objects.get(LOW_ROOT_NAME)
    if high_root is None or low_root is None:
        raise RuntimeError("Listener review requires both authored source roots")
    remove_review_objects()
    set_visibility(high_root, True)
    set_visibility(low_root, False)
    scene, camera = configure_scene()
    closed = {name: 0.0 for name in MORPHS}
    opened = {
        "shell_open": 1.0,
        "membrane_tension": 0.88,
        "core_exposure": 0.82,
        "balance_shift": 0.48,
        "signal_sweep": 0.72,
    }
    views = (
        ("01-front-closed.png", (0.0, -18.5, 0.15), (0.0, 0.0, 0.0), 60, closed),
        ("02-side-closed.png", (18.5, -0.2, 0.35), (0.0, 0.0, 0.0), 60, closed),
        ("03-back-closed.png", (0.0, 18.5, 0.2), (0.0, 0.0, 0.0), 60, closed),
        ("04-material-close.png", (5.1, -7.2, 1.55), (0.35, -0.15, 0.65), 95, closed),
        ("05-front-open.png", (0.0, -18.5, 0.15), (0.0, 0.0, 0.0), 60, opened),
        ("06-side-open.png", (18.5, -0.2, 0.35), (0.0, 0.0, 0.0), 60, opened),
    )
    for filename, position, target, lens, morphs in views:
        render_view(scene, camera, args.output_dir / filename, position, target, lens, morphs)


if __name__ == "__main__":
    main()
