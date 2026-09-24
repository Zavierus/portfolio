from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
TEXTURE_ROOT = REPOSITORY_ROOT / "assets" / "source" / "pulse-room" / "textures" / "signal-chrysalis"
ROOT_NAME = "SIGNAL_CHRYSALIS_ROOT"
CONTROLS = ("shell_compress", "plate_split", "nerve_sweep", "scar_idle")


def script_args():
    parser = argparse.ArgumentParser(description="Author SIGNAL CHRYSALIS high or low LOD.")
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        bpy.data.collections.remove(collection)
    collection = bpy.data.collections.new("PULSE_EXPORT")
    bpy.context.scene.collection.children.link(collection)
    return collection


def principled(name, color, metallic, roughness, emission=None, emission_strength=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    material.metallic = metallic
    material.roughness = roughness
    material.use_backface_culling = False
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in shader.inputs:
        shader.inputs["Coat Weight"].default_value = 0.28
    if emission:
        shader.inputs["Emission Color"].default_value = emission
        shader.inputs["Emission Strength"].default_value = emission_strength
    return material


def attach_pbr(material, texture_id):
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    shader = nodes.get("Principled BSDF")
    images = {}
    for role in ("basecolor", "normal", "orm"):
        image = bpy.data.images.load(str(TEXTURE_ROOT / f"{texture_id}-{role}.png"), check_existing=True)
        image.colorspace_settings.name = "sRGB" if role == "basecolor" else "Non-Color"
        node = nodes.new("ShaderNodeTexImage")
        node.name = f"{texture_id}_{role}"
        node.image = image
        images[role] = node
    separate = nodes.new("ShaderNodeSeparateColor")
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.55
    links.new(images["basecolor"].outputs["Color"], shader.inputs["Base Color"])
    links.new(images["normal"].outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], shader.inputs["Normal"])
    links.new(images["orm"].outputs["Color"], separate.inputs["Color"])
    links.new(separate.outputs["Green"], shader.inputs["Roughness"])
    links.new(separate.outputs["Blue"], shader.inputs["Metallic"])


def mesh_object(collection, name, vertices, faces, material, root, smooth=True):
    mesh = bpy.data.meshes.new(f"{name}_MESH")
    mesh.from_pydata(vertices, [], faces)
    mesh.validate(verbose=False)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.parent = root
    obj.data.materials.append(material)
    for polygon in mesh.polygons:
        polygon.use_smooth = smooth
    return obj


def animate_shape(obj, control, frames):
    block = obj.data.shape_keys.key_blocks[control]
    for frame, value in frames:
        block.value = value
        block.keyframe_insert(data_path="value", frame=frame, group=control)
    action = obj.data.shape_keys.animation_data.action
    action.name = control
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "BEZIER"


def membrane_point(t, u):
    taper = math.sin(math.pi * (0.035 + t * 0.93)) ** 0.58
    half_height = taper * (1.32 + 0.42 * math.sin(t * math.pi * 1.7 + 0.4))
    x = -5.45 + 10.9 * t + 0.28 * math.sin(t * math.pi * 2.0)
    center_z = -0.42 + 0.74 * t + 0.28 * math.sin(t * math.pi * 2.6)
    z = center_z + u * half_height * (1.0 + 0.13 * math.sin(t * 11.0 + u * 2.7))
    fold = math.sin(t * math.pi * 2.35 + u * 1.65) * (1.0 - abs(u) ** 1.7)
    y = -0.18 + fold * (0.94 + 0.2 * math.sin(t * 9.0))
    y += 0.15 * math.sin(t * 19.0 + u * 5.0) * (1.0 - u * u)
    return (x, y, z)


def build_membrane(collection, material, root, lod):
    longitudinal, across = (220, 210) if lod == "high" else (120, 108)
    vertices, faces, params = [], [], []
    for row in range(longitudinal + 1):
        t = row / longitudinal
        for column in range(across + 1):
            u = column / across * 2.0 - 1.0
            vertices.append(membrane_point(t, u))
            params.append((t, u))
    stride = across + 1
    for row in range(longitudinal):
        for column in range(across):
            a = row * stride + column
            faces.append((a, a + 1, a + stride + 1, a + stride))
    obj = mesh_object(collection, "CHRYSALIS_FoldedMembrane", vertices, faces, material, root)
    obj["source_role"] = "authored_continuous_folded_membrane"
    obj.shape_key_add(name="Basis")
    compressed = obj.shape_key_add(name="shell_compress")
    for index, (t, u) in enumerate(params):
        base = Vector(vertices[index])
        compressed.data[index].co.x = base.x * 0.84 + 0.24 * math.sin(t * math.pi)
        compressed.data[index].co.y = base.y * 1.2 + (1.0 - u * u) * 0.28
        compressed.data[index].co.z = base.z * 0.9 - 0.16 * math.sin(t * math.pi * 2.0)
    animate_shape(obj, "shell_compress", [(1, 0.12), (28, 0.82), (58, 0.25), (92, 0.62), (124, 0.18)])
    return obj


def build_plates(collection, material, root):
    vertices, faces, plate_ids = [], [], []
    for plate in range(13):
        t = 0.09 + plate / 12 * 0.84
        center = Vector(membrane_point(t, 0.2 * math.sin(plate * 1.7)))
        center.y += 0.26 + (plate % 3) * 0.035
        width = 0.38 + 0.16 * ((plate * 7) % 5) / 4
        height = 0.33 + 0.22 * ((plate * 3) % 7) / 6
        angle = -0.42 + 0.17 * plate + 0.24 * math.sin(plate * 1.4)
        outline = []
        for point in range(7):
            theta = point / 7 * math.tau
            irregular = 0.78 + 0.24 * math.sin(point * 2.3 + plate)
            dx = math.cos(theta) * width * irregular
            dz = math.sin(theta) * height * (1.1 - 0.13 * math.cos(theta + plate))
            outline.append((dx * math.cos(angle) - dz * math.sin(angle), dz * math.cos(angle) + dx * math.sin(angle)))
        start = len(vertices)
        for depth in (-0.045, 0.045):
            for dx, dz in outline:
                vertices.append((center.x + dx, center.y + depth, center.z + dz))
                plate_ids.append(plate)
        faces.append(tuple(start + i for i in range(7)))
        faces.append(tuple(start + 7 + i for i in reversed(range(7))))
        for point in range(7):
            nxt = (point + 1) % 7
            faces.append((start + point, start + nxt, start + 7 + nxt, start + 7 + point))
    obj = mesh_object(collection, "CHRYSALIS_SegmentedPlates", vertices, faces, material, root, smooth=False)
    bevel = obj.modifiers.new("Authored plate edge", "BEVEL")
    bevel.width = 0.035
    bevel.segments = 2
    obj.shape_key_add(name="Basis")
    split = obj.shape_key_add(name="plate_split")
    for index, plate in enumerate(plate_ids):
        direction = -1 if plate % 2 else 1
        split.data[index].co.x += direction * (0.12 + plate * 0.018)
        split.data[index].co.y += 0.12 + 0.025 * (plate % 4)
        split.data[index].co.z += direction * 0.06 * math.sin(plate * 0.8)
    animate_shape(obj, "plate_split", [(1, 0.08), (24, 0.22), (44, 1.0), (72, 0.34), (108, 0.7), (124, 0.12)])
    return obj


def path_mesh(collection, name, points, widths, depth, material, root):
    vertices, faces = [], []
    for index, point in enumerate(points):
        previous = Vector(points[max(0, index - 1)])
        following = Vector(points[min(len(points) - 1, index + 1)])
        tangent = (following - previous).normalized()
        lateral = Vector((-tangent.z, 0.0, tangent.x)).normalized() * widths[index]
        front = Vector((0.0, depth, 0.0))
        center = Vector(point)
        vertices.extend((center - lateral - front, center + lateral - front, center + lateral + front, center - lateral + front))
    for index in range(len(points) - 1):
        a = index * 4
        b = a + 4
        faces.extend(((a, a + 1, b + 1, b), (a + 1, a + 2, b + 2, b + 1), (a + 2, a + 3, b + 3, b + 2), (a + 3, a, b, b + 3)))
    faces.extend(((0, 3, 2, 1), tuple(range(len(vertices) - 4, len(vertices)))))
    obj = mesh_object(collection, name, vertices, faces, material, root)
    bevel = obj.modifiers.new("Chassis bevel", "BEVEL")
    bevel.width = min(depth * 0.45, 0.055)
    bevel.segments = 2
    return obj


def build_chassis(collection, material, root, lod):
    segments = 96 if lod == "high" else 44
    specs = [
        (-0.62, 0.0, 0.0, 1.0),
        (-0.72, 0.42, 0.38, 0.82),
        (-0.6, -0.48, 0.53, 0.78),
        (-0.82, 0.86, 0.72, 0.62),
        (-0.74, -0.92, 0.88, 0.58),
    ]
    objects = []
    for branch, (depth_y, z_bias, phase, reach) in enumerate(specs):
        points, widths = [], []
        for index in range(segments + 1):
            t = index / segments
            if branch == 0:
                x = -5.15 + 10.15 * t
                z = -0.18 + 0.34 * math.sin(t * math.pi * 2.1)
            else:
                origin_t = 0.12 + branch * 0.13
                x = -5.15 + 10.15 * (origin_t + (t - 0.08) * reach * 0.55)
                z = z_bias * t * 2.1 + 0.22 * math.sin(t * math.pi * (1.4 + branch * 0.15) + phase)
            y = depth_y + 0.12 * math.sin(t * 7.0 + phase)
            points.append((x, y, z))
            widths.append((0.16 - 0.085 * t) * (1.0 + 0.08 * math.sin(t * 13.0 + branch)))
        objects.append(path_mesh(collection, f"CHRYSALIS_Chassis_{branch + 1:02d}", points, widths, 0.08, material, root))
    return objects


def ribbon_mesh(collection, name, material, root, segments, width, point_fn, control=None):
    vertices, faces, params = [], [], []
    for index in range(segments + 1):
        t = index / segments
        center = Vector(point_fn(t))
        delta = Vector(point_fn(min(1.0, t + 1 / segments))) - Vector(point_fn(max(0.0, t - 1 / segments)))
        lateral = Vector((-delta.z, 0.0, delta.x)).normalized() * width * (0.7 + 0.3 * math.sin(math.pi * t))
        vertices.extend((center - lateral, center + lateral))
        params.extend((t, t))
    for index in range(segments):
        a = index * 2
        faces.append((a, a + 1, a + 3, a + 2))
    obj = mesh_object(collection, name, vertices, faces, material, root)
    if control:
        obj.shape_key_add(name="Basis")
        shape = obj.shape_key_add(name=control)
        for index, t in enumerate(params):
            base = Vector(vertices[index])
            shape.data[index].co.y = base.y + 0.16 + 0.22 * math.sin(t * math.pi * 5.0)
            shape.data[index].co.z = base.z + 0.13 * math.sin(t * math.pi * 7.0)
        frames = [(1, 0.0), (22, 0.0), (52, 1.0), (78, 0.26), (112, 0.86), (124, 0.08)]
        animate_shape(obj, control, frames)
    return obj


def build_signal(collection, nerve_material, fibre_material, root, lod):
    nerve_segments = 280 if lod == "high" else 110
    def nerve_point(t):
        base = Vector(membrane_point(t, -0.08 + 0.16 * math.sin(t * 8.0)))
        return (base.x, base.y + 0.68, base.z + 0.08 * math.sin(t * 17.0))
    nerve = ribbon_mesh(collection, "CHRYSALIS_ChartreuseNerve", nerve_material, root, nerve_segments, 0.035, nerve_point, "nerve_sweep")

    scar_segments = 150 if lod == "high" else 64
    def scar_point(t):
        source_t = 0.2 + t * 0.52
        base = Vector(membrane_point(source_t, 0.58 - t * 0.8))
        return (base.x, base.y + 0.58, base.z)
    scar = ribbon_mesh(collection, "CHRYSALIS_IdleScar", nerve_material, root, scar_segments, 0.018, scar_point, "scar_idle")

    fibres = []
    fibre_segments = 120 if lod == "high" else 52
    for fibre in range(9):
        def fibre_point(t, fibre=fibre):
            u = -0.82 + fibre / 8 * 1.64 + 0.06 * math.sin(t * 9.0 + fibre)
            base = Vector(membrane_point(t, u))
            return (base.x, base.y + 0.16 + fibre * 0.006, base.z)
        fibres.append(ribbon_mesh(collection, f"CHRYSALIS_Fibre_{fibre + 1:02d}", fibre_material, root, fibre_segments, 0.009, fibre_point))
    return nerve, scar, fibres


def smart_uv(obj):
    if obj.type != "MESH" or not obj.data.polygons:
        return
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(68), island_margin=0.006, area_weight=0.1)
    bpy.ops.object.mode_set(mode="OBJECT")


def triangle_count(obj):
    if obj.type != "MESH":
        return 0
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


def build(lod, output):
    for role in ("titanium-basecolor", "titanium-normal", "titanium-orm", "polymer-basecolor", "polymer-normal", "polymer-orm"):
        if not (TEXTURE_ROOT / f"{role}.png").exists():
            raise FileNotFoundError("Run npm run generate:pulse-textures before authoring SIGNAL CHRYSALIS")
    collection = reset_scene()
    root = bpy.data.objects.new(ROOT_NAME, None)
    collection.objects.link(root)
    root["asset_id"] = "signal-chrysalis"
    root["lod"] = lod
    root["license_record"] = "projects/pulse-room/assets/ATTRIBUTIONS.md"

    titanium = principled("MAT_CHRYSALIS_Titanium", (0.035, 0.045, 0.052, 1.0), 0.92, 0.25)
    attach_pbr(titanium, "titanium")
    bone = principled("MAT_CHRYSALIS_BoneAlloy", (0.38, 0.4, 0.35, 1.0), 0.62, 0.34)
    attach_pbr(bone, "titanium")
    polymer = principled("MAT_CHRYSALIS_VioletPolymer", (0.11, 0.035, 0.2, 1.0), 0.08, 0.38)
    attach_pbr(polymer, "polymer")
    fibre = principled("MAT_CHRYSALIS_Fibre", (0.025, 0.03, 0.036, 1.0), 0.62, 0.42)
    nerve = principled("MAT_CHRYSALIS_Nerve", (0.28, 0.72, 0.02, 1.0), 0.18, 0.2, (0.58, 1.0, 0.035, 1.0), 8.0)

    membrane = build_membrane(collection, polymer, root, lod)
    plates = build_plates(collection, bone, root)
    chassis = build_chassis(collection, titanium, root, lod)
    nerve_obj, scar, fibres = build_signal(collection, nerve, fibre, root, lod)
    objects = [membrane, plates, nerve_obj, scar, *chassis, *fibres]
    for obj in objects:
        smart_uv(obj)
        obj.hide_render = False
        obj.hide_viewport = False

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 124
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene["asset_id"] = "signal-chrysalis"
    bpy.context.scene["required_controls"] = ",".join(CONTROLS)
    bpy.context.scene.frame_set(1)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(output.resolve()), compress=True)

    triangles = sum(triangle_count(obj) for obj in objects)
    minimum, maximum = (80_000, 140_000) if lod == "high" else (25_000, 45_000)
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"{lod} LOD has {triangles} triangles; expected {minimum}-{maximum}")
    print("SIGNAL_CHRYSALIS_OUTPUT", output.resolve())
    print("SIGNAL_CHRYSALIS_TRIANGLES", triangles)
    print("SIGNAL_CHRYSALIS_BREAKDOWN", sorted((obj.name, triangle_count(obj)) for obj in objects))
    print("SIGNAL_CHRYSALIS_ACTIONS", sorted(action.name for action in bpy.data.actions))


if __name__ == "__main__":
    args = script_args()
    build(args.lod, args.output)
