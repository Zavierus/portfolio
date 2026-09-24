from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import signal_chrysalis_author as shared


ROOT_NAME = "TRIUNE_GATE_ROOT"
CONTROLS = ("left_strike", "center_strike", "right_strike", "gate_lock", "cable_tension")


def script_args():
    parser = argparse.ArgumentParser(description="Author TRIUNE GATE high or low LOD.")
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def build_body(collection, root, material, name, control, body_index, lod):
    rows, across = (150, 96) if lod == "high" else (84, 56)
    centers = (-3.25, 0.0, 3.35)
    heights = (7.1, 8.0, 6.65)
    leans = (-0.72, 0.28, 0.86)
    phases = (0.3, 1.7, 3.15)
    vertices, faces, params = [], [], []
    for row in range(rows + 1):
        t = row / rows
        z = -heights[body_index] * 0.5 + heights[body_index] * t
        center_x = centers[body_index] + leans[body_index] * (t - 0.5) + 0.12 * math.sin(t * 8.0 + phases[body_index])
        envelope = math.sin(math.pi * (0.035 + t * 0.93)) ** 0.52
        width = envelope * (1.15 + 0.27 * math.sin(t * math.pi * (1.4 + body_index * 0.22) + phases[body_index]))
        gap_center = 0.16 * math.sin(t * 5.4 + phases[body_index]) + (body_index - 1) * 0.05
        gap_width = 0.12 + 0.055 * math.sin(t * math.pi * 3.0 + body_index)
        for column in range(across + 1):
            u = column / across * 2.0 - 1.0
            x = center_x + u * width * (1.0 + 0.11 * math.sin(u * 5.0 + t * 12.0))
            fold = math.sin(u * math.pi * 1.25 + t * math.pi * (1.6 + body_index * 0.18))
            y = -0.28 + body_index * 0.18 + fold * (0.58 + 0.18 * math.sin(t * 9.0))
            y += 0.11 * math.sin(t * 17.0 + u * 7.0 + phases[body_index])
            vertices.append((x, y, z))
            params.append((t, u, gap_center, gap_width))
    stride = across + 1
    for row in range(rows):
        for column in range(across):
            u = (column + 0.5) / across * 2.0 - 1.0
            _, _, gap_center, gap_width = params[row * stride + column]
            if abs(u - gap_center) < gap_width:
                continue
            a = row * stride + column
            faces.append((a, a + 1, a + stride + 1, a + stride))
    obj = shared.mesh_object(collection, name, vertices, faces, material, root, smooth=False)
    obj["source_role"] = "authored_tapered_gate_body_with_negative_space"
    obj.shape_key_add(name="Basis")
    strike = obj.shape_key_add(name=control)
    direction = (-1, 0, 1)[body_index]
    for index, (t, u, _, _) in enumerate(params):
        base = Vector(vertices[index])
        impact = math.sin(math.pi * t) ** 0.7
        strike.data[index].co.x = base.x + direction * impact * 0.32
        strike.data[index].co.y = base.y + impact * (0.34 + 0.08 * math.sin(u * 5.0))
        strike.data[index].co.z = base.z - impact * (0.22 + body_index * 0.035)
    shared.animate_shape(obj, control, [(1, 0.0), (16 + body_index * 7, 0.0), (20 + body_index * 7, 1.0), (28 + body_index * 7, 0.08), (72 + body_index * 5, 0.65), (78 + body_index * 5, 0.0)])
    return obj


def build_buttresses(collection, root, material, lod):
    segments = 76 if lod == "high" else 34
    objects = []
    for body, center in enumerate((-3.25, 0.0, 3.35)):
        for side in (-1, 1):
            points, widths = [], []
            for index in range(segments + 1):
                t = index / segments
                z = -3.25 + t * (6.5 + body * 0.22)
                x = center + side * (0.72 + 0.4 * math.sin(math.pi * t)) + 0.15 * math.sin(t * 6.0 + body)
                y = -0.72 + 0.1 * side + 0.12 * math.sin(t * 9.0 + body)
                points.append((x, y, z))
                widths.append(0.12 - t * 0.045 + 0.012 * math.sin(t * 11.0))
            objects.append(shared.path_mesh(collection, f"TRIUNE_Buttress_{body}_{side}", points, widths, 0.065, material, root))
    return objects


def make_ribbon_object(collection, root, material, name, paths, control, tension=False):
    vertices, faces, meta = [], [], []
    for path_index, points in enumerate(paths):
        start = len(vertices)
        for index, point in enumerate(points):
            t = index / max(1, len(points) - 1)
            previous = Vector(points[max(0, index - 1)])
            following = Vector(points[min(len(points) - 1, index + 1)])
            tangent = following - previous
            lateral = Vector((-tangent.z, 0.0, tangent.x)).normalized() * (0.045 + 0.018 * math.sin(math.pi * t))
            center = Vector(point)
            vertices.extend((center - lateral, center + lateral))
            meta.extend(((path_index, t), (path_index, t)))
        for index in range(len(points) - 1):
            a = start + index * 2
            faces.append((a, a + 1, a + 3, a + 2))
    obj = shared.mesh_object(collection, name, vertices, faces, material, root)
    obj.shape_key_add(name="Basis")
    shape = obj.shape_key_add(name=control)
    for index, (path_index, t) in enumerate(meta):
        base = Vector(vertices[index])
        if tension:
            shape.data[index].co.y = base.y * 0.35 - 0.15
            shape.data[index].co.z = base.z + math.sin(math.pi * t) * (0.22 + path_index * 0.035)
        else:
            shape.data[index].co.y = base.y + 0.42 * math.sin(math.pi * t)
            shape.data[index].co.z = base.z - 0.55 + 1.1 * t
    shared.animate_shape(obj, control, [(1, 0.0), (34, 0.0), (48, 1.0), (66, 0.35), (94, 0.82), (124, 0.12)])
    return obj


def build_lock_and_cables(collection, root, lock_material, cable_material, lod):
    segments = 110 if lod == "high" else 50
    lock_paths = []
    for lane in range(3):
        points = []
        for index in range(segments + 1):
            t = index / segments
            points.append((-3.8 + 7.7 * t, 0.55 + lane * 0.08, -0.7 + lane * 0.62 + math.sin(t * math.pi) * (0.35 + lane * 0.08)))
        lock_paths.append(points)
    lock = make_ribbon_object(collection, root, lock_material, "TRIUNE_GateLock", lock_paths, "gate_lock")

    cable_paths = []
    for cable in range(8):
        points = []
        start_x = -4.2 + cable * 1.2
        end_x = 4.1 - cable * 0.65
        for index in range(segments + 1):
            t = index / segments
            x = start_x + (end_x - start_x) * t
            z = -2.8 + cable * 0.72 + math.sin(math.pi * t) * (0.8 + (cable % 3) * 0.18)
            y = -0.95 - 0.18 * math.sin(t * math.pi * 2.0 + cable)
            points.append((x, y, z))
        cable_paths.append(points)
    cables = make_ribbon_object(collection, root, cable_material, "TRIUNE_TensionCables", cable_paths, "cable_tension", tension=True)
    return lock, cables


def build(lod, output):
    collection = shared.reset_scene()
    root = bpy.data.objects.new(ROOT_NAME, None)
    collection.objects.link(root)
    root["asset_id"] = "triune-gate"
    root["lod"] = lod
    root["license_record"] = "projects/pulse-room/assets/ATTRIBUTIONS.md"

    titanium = shared.principled("MAT_TRIUNE_Titanium", (0.025, 0.032, 0.036, 1.0), 0.94, 0.23)
    shared.attach_pbr(titanium, "titanium")
    violet = shared.principled("MAT_TRIUNE_VioletCeramic", (0.15, 0.04, 0.24, 1.0), 0.16, 0.31)
    shared.attach_pbr(violet, "polymer")
    bone = shared.principled("MAT_TRIUNE_BoneAlloy", (0.42, 0.44, 0.38, 1.0), 0.54, 0.38)
    shared.attach_pbr(bone, "titanium")
    signal = shared.principled("MAT_TRIUNE_KillSignal", (0.55, 0.012, 0.02, 1.0), 0.2, 0.18, (1.0, 0.02, 0.028, 1.0), 9.5)
    cable = shared.principled("MAT_TRIUNE_Cable", (0.02, 0.025, 0.028, 1.0), 0.7, 0.34)

    body_materials = (titanium, violet, bone)
    controls = ("left_strike", "center_strike", "right_strike")
    bodies = [build_body(collection, root, body_materials[index], f"TRIUNE_Body_{index + 1}", controls[index], index, lod) for index in range(3)]
    buttresses = build_buttresses(collection, root, titanium, lod)
    lock, cables = build_lock_and_cables(collection, root, signal, cable, lod)
    objects = [*bodies, *buttresses, lock, cables]
    for obj in objects:
        shared.smart_uv(obj)
        obj.hide_render = False
        obj.hide_viewport = False

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 124
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene["asset_id"] = "triune-gate"
    bpy.context.scene["required_controls"] = ",".join(CONTROLS)
    bpy.context.scene.frame_set(1)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(output.resolve()), compress=True)

    triangles = sum(shared.triangle_count(obj) for obj in objects)
    minimum, maximum = (80_000, 140_000) if lod == "high" else (25_000, 45_000)
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"{lod} LOD has {triangles} triangles; expected {minimum}-{maximum}")
    print("TRIUNE_GATE_OUTPUT", output.resolve())
    print("TRIUNE_GATE_TRIANGLES", triangles)
    print("TRIUNE_GATE_BREAKDOWN", sorted((obj.name, shared.triangle_count(obj)) for obj in objects))
    print("TRIUNE_GATE_ACTIONS", sorted(action.name for action in bpy.data.actions))


if __name__ == "__main__":
    args = script_args()
    build(args.lod, args.output)
