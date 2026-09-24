from __future__ import annotations

import os
from pathlib import Path

import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIRECTORY = REPOSITORY_ROOT / "artifacts" / "relic-01" / "blender-review"


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def make_material(name: str, color: tuple[float, float, float, float], roughness: float) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Roughness"].default_value = roughness
    return material


def add_area(name: str, location: tuple[float, float, float], color: tuple[float, float, float], energy: float, size: float, target=(0.0, 0.0, 0.0)) -> bpy.types.Object:
    data = bpy.data.lights.new(name, type="AREA")
    data.color = color
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    look_at(obj, target)
    return obj


def add_point(name: str, location: tuple[float, float, float], color: tuple[float, float, float], energy: float, radius: float) -> bpy.types.Object:
    data = bpy.data.lights.new(name, type="POINT")
    data.color = color
    data.energy = energy
    data.shadow_soft_size = radius
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    return obj


def configure_scene() -> bpy.types.Object:
    scene = bpy.context.scene
    draft = os.environ.get("RELIC_REVIEW_DRAFT") == "1"
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 10 if draft else 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 640 if draft else 900
    scene.render.resolution_y = 640 if draft else 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.use_file_extension = True

    world = scene.world or bpy.data.worlds.new("RELIC Review World")
    scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.002, 0.003, 0.003, 1.0)
    background.inputs["Strength"].default_value = 0.02

    scene.use_nodes = True
    nodes = scene.node_tree.nodes
    links = scene.node_tree.links
    nodes.clear()
    render_layers = nodes.new("CompositorNodeRLayers")
    glare = nodes.new("CompositorNodeGlare")
    glare.glare_type = "FOG_GLOW"
    glare.quality = "HIGH"
    glare.threshold = 1.2
    glare.size = 6
    composite = nodes.new("CompositorNodeComposite")
    links.new(render_layers.outputs["Image"], glare.inputs["Image"])
    links.new(glare.outputs["Image"], composite.inputs["Image"])

    bpy.ops.mesh.primitive_plane_add(size=18.0, location=(0.0, 0.0, -1.47))
    floor = bpy.context.object
    floor.name = "REVIEW_Floor"
    floor.data.materials.append(make_material("REVIEW_FloorMaterial", (0.003, 0.005, 0.005, 1.0), 0.72))

    add_area("REVIEW_Key", (3.5, -4.6, 4.8), (0.96, 0.91, 0.79), 620.0, 3.1, (0.0, 0.0, 0.15))
    add_area("REVIEW_CyanRim", (-3.9, 2.2, 2.5), (0.13, 0.72, 0.78), 710.0, 2.5, (0.0, 0.0, 0.2))
    add_area("REVIEW_AcidCut", (2.4, 2.9, 0.3), (0.48, 1.0, 0.05), 380.0, 1.9, (-0.2, 0.0, 0.25))
    add_area("REVIEW_LowFill", (-2.1, -2.8, -0.8), (0.24, 0.3, 0.28), 260.0, 2.2, (0.0, 0.0, -0.15))
    add_point("REVIEW_CoreLight", (0.0, -0.42, -0.12), (1.0, 0.015, 0.025), 18.0, 0.24)

    camera_data = bpy.data.cameras.new("REVIEW_Camera")
    camera_data.lens = 58.0
    camera_data.sensor_width = 36.0
    camera = bpy.data.objects.new("REVIEW_Camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    return camera


def set_review_pose() -> None:
    bpy.context.scene.frame_set(1)
    root = bpy.data.objects.get("RELIC_ROOT")
    if root:
        root.rotation_euler = (0.0, 0.0, 0.0)
    values = {
        "membrane_tension": 0.48,
        "fibre_reveal": 1.0,
        "core_wake": 0.68,
        "signal_sweep": 1.0,
    }
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data.shape_keys:
            continue
        for name, value in values.items():
            key = obj.data.shape_keys.key_blocks.get(name)
            if key:
                key.value = value


def render_views(camera: bpy.types.Object) -> None:
    views = [
        ("front", (0.0, -7.2, 0.05), (0.0, 0.0, 0.0), 54.0),
        ("side", (6.8, 0.0, 0.08), (0.0, 0.0, 0.0), 54.0),
        ("back", (0.0, 7.2, 0.05), (0.0, 0.0, 0.0), 54.0),
        ("bone-macro", (1.38, -2.65, 1.25), (-0.24, -0.1, 0.72), 78.0),
        ("membrane-macro", (0.05, -2.45, 0.22), (-0.02, -0.04, 0.08), 84.0),
        ("core-macro", (0.86, -2.08, -0.12), (-0.015, -0.095, -0.12), 92.0),
    ]
    for name, location, target, lens in views:
        camera.location = location
        camera.data.lens = lens
        look_at(camera, target)
        bpy.context.scene.render.filepath = str(OUTPUT_DIRECTORY / f"{name}.png")
        bpy.ops.render.render(write_still=True)
        print("RELIC_REVIEW_RENDER", name, bpy.context.scene.render.filepath)


def main() -> None:
    if bpy.data.objects.get("RELIC_ROOT") is None:
        raise RuntimeError("Open relic-01.blend before running the review script")
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    set_review_pose()
    camera = configure_scene()
    render_views(camera)


if __name__ == "__main__":
    main()
