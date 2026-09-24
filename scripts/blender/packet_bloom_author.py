from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import signal_chrysalis_author as shared


ROOT_NAME = "PACKET_BLOOM_ROOT"
CONTROLS = ("lattice_bend", "cluster_break", "cluster_rebuild", "packet_idle")


def script_args():
    parser = argparse.ArgumentParser(description="Author PACKET BLOOM high or low LOD.")
    parser.add_argument("--lod", choices=("high", "low"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def seeded(index, channel):
    value = math.sin(index * 12.9898 + channel * 78.233) * 43758.5453
    return value - math.floor(value)


def lattice_center(t):
    return Vector((
        -5.35 + 10.7 * t,
        -0.18 + 0.36 * math.sin(t * math.pi * 1.7),
        -2.75 + 5.5 * t + 0.24 * math.sin(t * math.pi * 2.0),
    ))


def build_path_bundle(collection, root, material, name, paths, widths, depth, control=None, role=""):
    vertices, faces, meta = [], [], []
    for path_index, points in enumerate(paths):
        start = len(vertices)
        for index, point in enumerate(points):
            previous = Vector(points[max(0, index - 1)])
            following = Vector(points[min(len(points) - 1, index + 1)])
            tangent = (following - previous).normalized()
            lateral = Vector((-tangent.z, 0.0, tangent.x)).normalized() * widths[path_index][index]
            front = Vector((0.0, depth, 0.0))
            center = Vector(point)
            vertices.extend((center - lateral - front, center + lateral - front, center + lateral + front, center - lateral + front))
            t = index / max(1, len(points) - 1)
            meta.extend(((path_index, t),) * 4)
        for index in range(len(points) - 1):
            a = start + index * 4
            b = a + 4
            faces.extend((
                (a, a + 1, b + 1, b),
                (a + 1, a + 2, b + 2, b + 1),
                (a + 2, a + 3, b + 3, b + 2),
                (a + 3, a, b, b + 3),
            ))
    obj = shared.mesh_object(collection, name, vertices, faces, material, root)
    obj["source_role"] = role
    if control:
        obj.shape_key_add(name="Basis")
        shape = obj.shape_key_add(name=control)
        for index, (path_index, t) in enumerate(meta):
            base = Vector(vertices[index])
            envelope = math.sin(math.pi * t) ** 0.8
            shape.data[index].co.y = base.y + envelope * (0.52 + path_index * 0.006)
            shape.data[index].co.z = base.z + envelope * math.sin(t * math.pi * 2.0 + path_index * 0.18) * 0.36
        shared.animate_shape(obj, control, [(1, 0.12), (28, 0.48), (56, 0.22), (84, 1.0), (112, 0.4), (140, 0.72)])
    return obj


def build_lattice(collection, root, material, lod):
    rail_count, segments = (28, 190) if lod == "high" else (16, 88)
    paths, widths = [], []
    for rail in range(rail_count):
        lane = -1.0 + rail / max(1, rail_count - 1) * 2.0
        points, path_widths = [], []
        for index in range(segments + 1):
            t = index / segments
            envelope = math.sin(math.pi * (0.025 + t * 0.95)) ** 0.58
            center = lattice_center(t)
            center.y += lane * (0.74 + 0.28 * math.sin(t * math.pi * 1.6)) * envelope
            center.z += lane * (1.2 + 0.22 * math.cos(t * math.pi * 2.2)) * envelope
            center.y += 0.08 * math.sin(t * 11.0 + rail * 0.63)
            points.append(tuple(center))
            path_widths.append(0.038 + 0.022 * (1.0 - abs(lane)) + 0.008 * math.sin(t * 17.0 + rail))
        paths.append(points)
        widths.append(path_widths)
    return build_path_bundle(
        collection,
        root,
        material,
        "BLOOM_TaperedDiagonalLattice",
        paths,
        widths,
        0.028,
        "lattice_bend",
        "authored_diagonal_tapered_open_lattice",
    )


def build_braces(collection, root, material, lod):
    brace_count, segments = (24, 150) if lod == "high" else (14, 70)
    paths, widths = [], []
    for brace in range(brace_count):
        phase = brace / brace_count
        points, path_widths = [], []
        for index in range(segments + 1):
            t = index / segments
            center = lattice_center(t)
            envelope = math.sin(math.pi * t) ** 0.62
            braid = math.sin(t * math.pi * (3.0 + (brace % 4) * 0.36) + phase * math.tau)
            center.y += braid * envelope * (0.92 + (brace % 3) * 0.08)
            center.z += math.cos(t * math.pi * 2.2 + phase * math.tau) * envelope * (1.28 + (brace % 5) * 0.06)
            points.append(tuple(center))
            path_widths.append(0.027 + 0.009 * ((brace * 5) % 7) / 6)
        paths.append(points)
        widths.append(path_widths)
    return build_path_bundle(
        collection,
        root,
        material,
        "BLOOM_CrossBracedChassis",
        paths,
        widths,
        0.021,
        role="cross_braces_forming_non_radial_negative_space",
    )


def prism_vertices(center, length, width, thickness, skew):
    axis_a = Vector((0.72 + skew * 0.12, 0.08 * skew, 0.68 - skew * 0.08)).normalized() * length
    axis_b = Vector((-0.18, 1.0, 0.16 + skew * 0.09)).normalized() * width
    axis_c = axis_a.cross(axis_b).normalized() * thickness
    return [
        tuple(center + axis_a * sx + axis_b * sy + axis_c * sz)
        for sx, sy, sz in (
            (-1, -1, -1),
            (1, -1, -1),
            (1, 1, -1),
            (-1, 1, -1),
            (-1, -1, 1),
            (1, -1, 1),
            (1, 1, 1),
            (-1, 1, 1),
        )
    ]


def build_shard_cluster(collection, root, material, lod, cluster_name, control, start_index):
    total = (300 if lod == "high" else 225)
    vertices, faces, shard_ids, centers = [], [], [], []
    face_pattern = (
        (0, 1, 2, 3),
        (4, 7, 6, 5),
        (0, 4, 5, 1),
        (1, 5, 6, 2),
        (2, 6, 7, 3),
        (3, 7, 4, 0),
    )
    for local_index in range(total):
        shard = start_index + local_index
        t = 0.04 + seeded(shard, 2) * 0.92
        lane = seeded(shard, 5) * 2.0 - 1.0
        center = lattice_center(t)
        envelope = math.sin(math.pi * t) ** 0.55
        center.y += lane * envelope * (0.8 + seeded(shard, 7) * 0.7)
        center.z += (seeded(shard, 11) * 2.0 - 1.0) * envelope * 1.55
        center.x += (seeded(shard, 13) - 0.5) * 0.42
        shard_vertices = prism_vertices(
            center,
            0.11 + seeded(shard, 17) * 0.24,
            0.022 + seeded(shard, 19) * 0.07,
            0.012 + seeded(shard, 23) * 0.026,
            lane,
        )
        offset = len(vertices)
        vertices.extend(shard_vertices)
        shard_ids.extend((local_index,) * 8)
        centers.append(center)
        faces.extend(tuple(offset + vertex for vertex in face) for face in face_pattern)
    obj = shared.mesh_object(collection, cluster_name, vertices, faces, material, root, smooth=False)
    obj["source_role"] = "authored_hard_surface_packet_cluster"
    obj.shape_key_add(name="Basis")
    shape = obj.shape_key_add(name=control)
    for index, shard_id in enumerate(shard_ids):
        base = Vector(vertices[index])
        center = centers[shard_id]
        t = (center.x + 5.35) / 10.7
        axis_center = lattice_center(max(0.0, min(1.0, t)))
        outward = center - axis_center
        if outward.length < 1e-5:
            outward = Vector((0.0, 1.0, 0.0))
        outward.normalize()
        if control == "cluster_break":
            shape.data[index].co = base + outward * (0.72 + seeded(start_index + shard_id, 29) * 0.88)
            shape.data[index].co.x += (seeded(start_index + shard_id, 31) - 0.5) * 0.8
        else:
            shape.data[index].co = base + (axis_center - center) * 0.58
            shape.data[index].co.x += (t - 0.5) * 0.28
    if control == "cluster_break":
        frames = [(1, 0.04), (30, 0.16), (62, 0.88), (82, 0.28), (106, 1.0), (140, 0.14)]
    else:
        frames = [(1, 0.58), (30, 0.88), (62, 0.18), (82, 0.72), (106, 0.1), (140, 1.0)]
    shared.animate_shape(obj, control, frames)
    return obj


def build_fibres(collection, root, material, lod):
    fibre_count, segments = (18, 160) if lod == "high" else (10, 72)
    vertices, faces, meta = [], [], []
    for fibre in range(fibre_count):
        start = len(vertices)
        phase = fibre / fibre_count * math.tau
        for index in range(segments + 1):
            t = index / segments
            center = lattice_center(t)
            envelope = math.sin(math.pi * t) ** 0.6
            center.y += math.sin(t * math.pi * 3.2 + phase) * envelope * (0.76 + fibre * 0.018)
            center.z += math.cos(t * math.pi * 2.7 + phase) * envelope * (1.0 + (fibre % 4) * 0.06)
            tangent = Vector((1.0, 0.0, 0.54)).normalized()
            lateral = Vector((-tangent.z, 0.0, tangent.x)) * (0.012 + (fibre % 3) * 0.004)
            vertices.extend((tuple(center - lateral), tuple(center + lateral)))
            meta.extend(((fibre, t), (fibre, t)))
        for index in range(segments):
            a = start + index * 2
            faces.append((a, a + 1, a + 3, a + 2))
    obj = shared.mesh_object(collection, "BLOOM_LuminousFibres", vertices, faces, material, root)
    obj["source_role"] = "flexible_braided_signal_fibres"
    obj.shape_key_add(name="Basis")
    idle = obj.shape_key_add(name="packet_idle")
    for index, (fibre, t) in enumerate(meta):
        base = Vector(vertices[index])
        idle.data[index].co.y = base.y + math.sin(t * math.pi * 4.0 + fibre * 0.32) * 0.16
        idle.data[index].co.z = base.z + math.cos(t * math.pi * 3.0 + fibre * 0.27) * 0.12
    shared.animate_shape(obj, "packet_idle", [(1, 0.24), (34, 0.72), (70, 0.32), (104, 0.94), (140, 0.46)])
    return obj


def build_anchor(collection, root, material, lod):
    segments = 220 if lod == "high" else 90
    points, widths = [], []
    for index in range(segments + 1):
        t = index / segments
        center = lattice_center(t)
        center.y -= 0.42 + 0.12 * math.sin(t * 8.0)
        center.z += 0.16 * math.sin(t * 13.0)
        points.append(tuple(center))
        widths.append(0.18 * math.sin(math.pi * (0.025 + t * 0.95)) ** 0.52 + 0.035)
    obj = shared.path_mesh(collection, "BLOOM_DarkAnchorSpine", points, widths, 0.11, material, root)
    obj["source_role"] = "continuous_dark_anchor_spine"
    return obj


def build(lod, output):
    collection = shared.reset_scene()
    root = bpy.data.objects.new(ROOT_NAME, None)
    collection.objects.link(root)
    root["asset_id"] = "packet-bloom"
    root["lod"] = lod
    root["license_record"] = "projects/pulse-room/assets/ATTRIBUTIONS.md"

    titanium = shared.principled("MAT_BLOOM_DarkTitanium", (0.025, 0.032, 0.036, 1.0), 0.9, 0.26)
    shared.attach_pbr(titanium, "titanium")
    bone = shared.principled("MAT_BLOOM_BoneShard", (0.46, 0.49, 0.44, 1.0), 0.58, 0.32)
    shared.attach_pbr(bone, "titanium")
    cyan = shared.principled("MAT_BLOOM_CyanPacket", (0.02, 0.34, 0.4, 1.0), 0.14, 0.18, (0.08, 0.82, 1.0, 1.0), 7.8)
    chartreuse = shared.principled("MAT_BLOOM_ChartreuseFibre", (0.36, 0.68, 0.02, 1.0), 0.12, 0.17, (0.68, 1.0, 0.04, 1.0), 8.4)
    vermilion = shared.principled("MAT_BLOOM_ErrorSlice", (0.58, 0.018, 0.012, 1.0), 0.18, 0.2, (1.0, 0.035, 0.018, 1.0), 6.5)

    lattice = build_lattice(collection, root, titanium, lod)
    braces = build_braces(collection, root, bone, lod)
    breaking = build_shard_cluster(collection, root, cyan, lod, "BLOOM_BreakCluster", "cluster_break", 0)
    rebuilding = build_shard_cluster(collection, root, vermilion, lod, "BLOOM_RebuildCluster", "cluster_rebuild", 10_000)
    fibres = build_fibres(collection, root, chartreuse, lod)
    anchor = build_anchor(collection, root, titanium, lod)
    objects = [lattice, braces, breaking, rebuilding, fibres, anchor]
    for obj in objects:
        shared.smart_uv(obj)
        obj.hide_render = False
        obj.hide_viewport = False

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 140
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene["asset_id"] = "packet-bloom"
    bpy.context.scene["required_controls"] = ",".join(CONTROLS)
    bpy.context.scene.frame_set(1)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(output.resolve()), compress=True)

    triangles = sum(shared.triangle_count(obj) for obj in objects)
    minimum, maximum = (80_000, 140_000) if lod == "high" else (25_000, 45_000)
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"{lod} LOD has {triangles} triangles; expected {minimum}-{maximum}")
    print("PACKET_BLOOM_OUTPUT", output.resolve())
    print("PACKET_BLOOM_TRIANGLES", triangles)
    print("PACKET_BLOOM_BREAKDOWN", sorted((obj.name, shared.triangle_count(obj)) for obj in objects))
    print("PACKET_BLOOM_ACTIONS", sorted(action.name for action in bpy.data.actions))


if __name__ == "__main__":
    args = script_args()
    build(args.lod, args.output)
