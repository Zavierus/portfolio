from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import signal_chrysalis_author as shared


ROOT_NAME = "NULL_CATHEDRAL_ROOT"
CONTROLS = ("shell_reveal", "void_cross", "scale_reveal", "relic_idle")


def script_args():
    parser = argparse.ArgumentParser(description="Author NULL CATHEDRAL high or low LOD.")
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def translucent_principled(name, color, roughness, transmission):
    material = shared.principled(name, color, 0.08, roughness)
    shader = material.node_tree.nodes.get("Principled BSDF")
    if "Transmission Weight" in shader.inputs:
        shader.inputs["Transmission Weight"].default_value = transmission
    if "Alpha" in shader.inputs:
        shader.inputs["Alpha"].default_value = color[3]
    material.diffuse_color = color
    if hasattr(material, "surface_render_method"):
        material.surface_render_method = "DITHERED"
    material.use_transparency_overlap = False
    return material


def shell_point(layer, u, v):
    spans = (4.58, 4.16, 4.82, 4.34)
    starts = (-2.56, -1.96, -2.82, -1.48)
    radii = (
        (4.95, 1.64, 3.45),
        (4.36, 2.08, 3.82),
        (5.42, 1.34, 2.92),
        (3.92, 2.32, 3.24),
    )
    offsets = ((-0.34, 0.08, 0.18), (0.46, -0.38, -0.16), (0.12, 0.48, 0.34), (0.72, 0.06, -0.44))
    theta = starts[layer] + u * spans[layer]
    phi = -1.18 + v * 2.34
    rx, ry, rz = radii[layer]
    ox, oy, oz = offsets[layer]
    irregular = 1.0 + 0.075 * math.sin(theta * (2.2 + layer * 0.19) + phi * 3.4 + layer)
    irregular += 0.035 * math.sin(theta * 7.1 - phi * 5.3 + layer * 1.7)
    edge_taper = 0.88 + 0.12 * math.sin(math.pi * u) ** 0.45
    x = ox + math.cos(phi) * math.cos(theta) * rx * irregular * edge_taper
    y = oy + math.cos(phi) * math.sin(theta) * ry * (1.0 + 0.14 * math.sin(phi * 4.0 + layer))
    y += 0.13 * math.sin(theta * 5.0 + phi * 7.0)
    z = oz + math.sin(phi) * rz * (1.0 + 0.08 * math.cos(theta * 3.0 - layer))
    lobe = math.sin(math.pi * v) ** 1.35
    if layer == 0:
        x -= 1.2 * math.exp(-((u - 0.12) / 0.2) ** 2) * lobe
    elif layer == 1:
        z += 1.0 * math.exp(-((u - 0.68) / 0.2) ** 2) * lobe
    elif layer == 2:
        x += 1.45 * math.exp(-((u - 0.84) / 0.18) ** 2) * lobe
    else:
        z -= 1.25 * math.exp(-((u - 0.38) / 0.22) ** 2) * lobe
    return Vector((x, y, z))


def in_void_cut(layer, u, v):
    centers = ((0.58, 0.52), (0.47, 0.47), (0.63, 0.56), (0.42, 0.58))
    radii = ((0.135, 0.205), (0.12, 0.18), (0.155, 0.17), (0.115, 0.21))
    cu, cv = centers[layer]
    ru, rv = radii[layer]
    return ((u - cu) / ru) ** 2 + ((v - cv) / rv) ** 2 < 1.0


def build_shell(collection, root, material, layer, lod):
    rows, across = (128, 104) if lod == "high" else (70, 50)
    vertices, faces, params = [], [], []
    for row in range(rows + 1):
        u = row / rows
        for column in range(across + 1):
            v = column / across
            vertices.append(tuple(shell_point(layer, u, v)))
            params.append((u, v))
    stride = across + 1
    for row in range(rows):
        for column in range(across):
            u = (row + 0.5) / rows
            v = (column + 0.5) / across
            center = shell_point(layer, u, v)
            common_void = ((center.x - 0.95) / 1.55) ** 2 + ((center.z - 0.18) / 1.24) ** 2 < 1.0
            if in_void_cut(layer, u, v) or common_void:
                continue
            if 0.08 < u < 0.92 and (row * 13 + column * 7 + layer * 17) % 211 == 0:
                continue
            a = row * stride + column
            faces.append((a, a + stride, a + stride + 1, a + 1))
    obj = shared.mesh_object(
        collection,
        f"CATHEDRAL_TranslucentShell_{layer + 1:02d}",
        vertices,
        faces,
        material,
        root,
    )
    obj["source_role"] = "irregular_incomplete_overlapping_shell_with_off_center_void"
    obj.shape_key_add(name="Basis")
    reveal = obj.shape_key_add(name="shell_reveal")
    void_center = Vector((0.62, -0.12, 0.18))
    for index, (u, v) in enumerate(params):
        base = Vector(vertices[index])
        outward = base - void_center
        outward.normalize()
        edge = math.sin(math.pi * u) * math.sin(math.pi * v)
        reveal.data[index].co = base + outward * (0.18 + layer * 0.055) * edge
        reveal.data[index].co.y += (layer - 1.5) * 0.12 * edge
    shared.animate_shape(
        obj,
        "shell_reveal",
        [(1, 0.04), (30, 0.14), (58, 0.46), (86, 1.0), (112, 0.72), (140, 0.2)],
    )
    return obj


def build_spars(collection, root, material, lod):
    segments = 112 if lod == "high" else 44
    objects = []
    for spar in range(7):
        points, widths = [], []
        phase = spar * 0.91
        for index in range(segments + 1):
            t = index / segments
            x = -4.65 + 9.2 * t + 0.34 * math.sin(t * math.pi * 2.0 + phase)
            y = -1.2 + spar * 0.34 + 0.24 * math.sin(t * 5.5 + phase)
            z = -2.7 + spar * 0.82 + math.sin(t * math.pi) * (0.7 + (spar % 3) * 0.24)
            z += 0.18 * math.sin(t * 11.0 + phase)
            points.append((x, y, z))
            widths.append((0.08 + 0.018 * (spar % 3)) * (0.8 + 0.2 * math.sin(math.pi * t)))
        obj = shared.path_mesh(
            collection,
            f"CATHEDRAL_ScaleSpar_{spar + 1:02d}",
            points,
            widths,
            0.038,
            material,
            root,
        )
        obj["source_role"] = "sparse_scale_reference_spar"
        if spar == 0:
            obj.shape_key_add(name="Basis")
            idle = obj.shape_key_add(name="relic_idle")
            for vertex_index, vertex in enumerate(idle.data):
                t = (vertex_index // 4) / segments
                base = vertex.co.copy()
                vertex.co.y = base.y + 0.045 * math.sin(t * math.pi * 2.0)
                vertex.co.z = base.z + 0.028 * math.sin(t * math.pi * 3.0)
            shared.animate_shape(obj, "relic_idle", [(1, 0.18), (48, 0.72), (92, 0.3), (140, 0.62)])
        objects.append(obj)
    return objects


def build_scale_lights(collection, root, material, lod):
    segments = 76 if lod == "high" else 30
    paths = 18 if lod == "high" else 12
    vertices, faces, meta = [], [], []
    for path in range(paths):
        start = len(vertices)
        for index in range(segments + 1):
            t = index / segments
            lane = -1.0 + path / max(1, paths - 1) * 2.0
            x = -4.1 + 8.4 * t + 0.18 * math.sin(t * 13.0 + path)
            y = 1.12 + 0.2 * math.sin(t * 6.0 + path * 0.7)
            z = lane * 2.65 + 0.44 * math.sin(t * math.pi * 1.6 + path * 0.35)
            width = 0.012 + 0.008 * ((path * 5) % 7) / 6
            vertices.extend(((x, y - width, z), (x, y + width, z)))
            meta.extend(((path, t), (path, t)))
        for index in range(segments):
            a = start + index * 2
            faces.append((a, a + 1, a + 3, a + 2))
    obj = shared.mesh_object(collection, "CATHEDRAL_DistantScaleLights", vertices, faces, material, root)
    obj["source_role"] = "distant_navigation_scale_marks"
    obj.shape_key_add(name="Basis")
    reveal = obj.shape_key_add(name="scale_reveal")
    for index, (path, t) in enumerate(meta):
        base = Vector(vertices[index])
        reveal.data[index].co.x = base.x + (t - 0.5) * 0.8
        reveal.data[index].co.y = base.y + 0.35 + path * 0.007
        reveal.data[index].co.z = base.z + math.sin(t * math.pi) * 0.22
    shared.animate_shape(obj, "scale_reveal", [(1, 0.02), (38, 0.18), (68, 0.62), (94, 1.0), (140, 0.88)])
    return obj


def build_void_veil(collection, root, material, lod):
    rows, across = (96, 40) if lod == "high" else (48, 20)
    vertices, faces, params = [], [], []
    for row in range(rows + 1):
        t = row / rows
        for column in range(across + 1):
            u = column / across * 2.0 - 1.0
            x = -1.55 + 3.85 * t + 0.16 * math.sin(t * math.pi * 2.0)
            y = -0.08 + 0.34 * math.sin(t * math.pi) * (1.0 - u * u)
            z = 0.16 + u * (0.72 + 0.22 * math.sin(t * math.pi))
            z += 0.14 * math.sin(t * 8.0 + u * 2.2)
            vertices.append((x, y, z))
            params.append((t, u))
    stride = across + 1
    for row in range(rows):
        for column in range(across):
            a = row * stride + column
            faces.append((a, a + stride, a + stride + 1, a + 1))
    obj = shared.mesh_object(collection, "CATHEDRAL_VoidCrossVeil", vertices, faces, material, root)
    obj["source_role"] = "single_membrane_crossing_the_off_center_void"
    obj.shape_key_add(name="Basis")
    crossing = obj.shape_key_add(name="void_cross")
    for index, (t, u) in enumerate(params):
        base = Vector(vertices[index])
        crossing.data[index].co.x = base.x + (t - 0.5) * 1.25
        crossing.data[index].co.y = base.y - 0.62 * math.sin(math.pi * t)
        crossing.data[index].co.z = base.z + u * 0.38 + 0.22 * math.sin(t * math.pi)
    shared.animate_shape(obj, "void_cross", [(1, 0.0), (56, 0.06), (82, 1.0), (106, 0.84), (140, 0.18)])
    return obj


def build(lod, output):
    collection = shared.reset_scene()
    root = bpy.data.objects.new(ROOT_NAME, None)
    collection.objects.link(root)
    root["asset_id"] = "null-cathedral"
    root["lod"] = lod
    root["license_record"] = "projects/pulse-room/assets/ATTRIBUTIONS.md"

    pale = shared.principled("MAT_CATHEDRAL_PaleAlloy", (0.48, 0.51, 0.49, 1.0), 0.58, 0.34)
    shared.attach_pbr(pale, "titanium")
    shell_a = translucent_principled("MAT_CATHEDRAL_VioletShell", (0.16, 0.08, 0.28, 0.38), 0.24, 0.58)
    shared.attach_pbr(shell_a, "polymer")
    shell_b = translucent_principled("MAT_CATHEDRAL_CyanShell", (0.035, 0.18, 0.22, 0.3), 0.2, 0.68)
    shared.attach_pbr(shell_b, "polymer")
    cyan = shared.principled(
        "MAT_CATHEDRAL_DepthLight",
        (0.02, 0.28, 0.34, 1.0),
        0.12,
        0.18,
        (0.08, 0.78, 1.0, 1.0),
        7.5,
    )
    veil = translucent_principled("MAT_CATHEDRAL_VoidVeil", (0.22, 0.12, 0.38, 0.25), 0.18, 0.76)

    shells = [
        build_shell(collection, root, shell_a if layer % 2 == 0 else shell_b, layer, lod)
        for layer in range(4)
    ]
    spars = build_spars(collection, root, pale, lod)
    lights = build_scale_lights(collection, root, cyan, lod)
    void_veil = build_void_veil(collection, root, veil, lod)
    objects = [*shells, *spars, lights, void_veil]
    for obj in objects:
        shared.smart_uv(obj)
        obj.hide_render = False
        obj.hide_viewport = False

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 140
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene["asset_id"] = "null-cathedral"
    bpy.context.scene["required_controls"] = ",".join(CONTROLS)
    bpy.context.scene.frame_set(1)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(output.resolve()), compress=True)

    triangles = sum(shared.triangle_count(obj) for obj in objects)
    minimum, maximum = (80_000, 140_000) if lod == "high" else (25_000, 45_000)
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"{lod} LOD has {triangles} triangles; expected {minimum}-{maximum}")
    print("NULL_CATHEDRAL_OUTPUT", output.resolve())
    print("NULL_CATHEDRAL_TRIANGLES", triangles)
    print("NULL_CATHEDRAL_BREAKDOWN", sorted((obj.name, shared.triangle_count(obj)) for obj in objects))
    print("NULL_CATHEDRAL_ACTIONS", sorted(action.name for action in bpy.data.actions))


if __name__ == "__main__":
    args = script_args()
    build(args.lod, args.output)
