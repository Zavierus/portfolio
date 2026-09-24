from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
TEXTURE_ROOT = REPOSITORY_ROOT / "assets" / "source" / "echo-hall" / "textures" / "listener-artifact"
OUTPUT_BLEND = REPOSITORY_ROOT / "assets" / "source" / "echo-hall" / "blender" / "listener-artifact.blend"

ARTIFACT_SPEC = {
    "root": "LISTENER_ARTIFACT_ROOT",
    "high_triangles": (90_000, 150_000),
    "low_triangles": (28_000, 45_000),
    "morphs": ("shell_open", "membrane_tension", "core_exposure", "balance_shift", "signal_sweep"),
    "materials": (
        "MAT_CERAMIC_SHELL",
        "MAT_TITANIUM_SPINE",
        "MAT_SIGNAL_MEMBRANE",
        "MAT_ARCHIVE_CORE",
        "MAT_ACID_SIGNAL",
    ),
    "target_bounds": (7.5, 3.2, 8.5),
}


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        bpy.data.collections.remove(collection)
    for material in list(bpy.data.materials):
        bpy.data.materials.remove(material)

    review_collection = bpy.data.collections.new("REVIEW_SCENE")
    bpy.context.scene.collection.children.link(review_collection)
    export_collection, form_collection, signal_collection = create_lod_collections("high")
    return export_collection, form_collection, signal_collection, review_collection


def create_lod_collections(lod):
    suffix = lod.upper()
    export_collection = bpy.data.collections.new(f"EXPORT_{suffix}")
    form_collection = bpy.data.collections.new(f"FORM_{suffix}")
    signal_collection = bpy.data.collections.new(f"SIGNAL_{suffix}")
    bpy.context.scene.collection.children.link(export_collection)
    export_collection.children.link(form_collection)
    export_collection.children.link(signal_collection)
    return export_collection, form_collection, signal_collection


def _principled_material(name, color, metallic, roughness, emission=None, emission_strength=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in shader.inputs:
        shader.inputs["Coat Weight"].default_value = 0.22
    if emission is not None:
        shader.inputs["Emission Color"].default_value = emission
        shader.inputs["Emission Strength"].default_value = emission_strength
    return material


def _attach_pbr(material, texture_id, normal_strength=0.55):
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    shader = nodes.get("Principled BSDF")
    images = {}
    for role in ("basecolor", "normal", "orm"):
        texture_path = TEXTURE_ROOT / f"{texture_id}-{role}.png"
        if not texture_path.exists():
            raise FileNotFoundError(f"Missing Listener texture: {texture_path}")
        image = bpy.data.images.load(str(texture_path), check_existing=True)
        image.colorspace_settings.name = "sRGB" if role == "basecolor" else "Non-Color"
        node = nodes.new("ShaderNodeTexImage")
        node.name = f"TEX_{texture_id.upper()}_{role.upper()}"
        node.label = f"{texture_id} {role}"
        node.image = image
        images[role] = node

    separate = nodes.new("ShaderNodeSeparateColor")
    separate.name = f"ORM_{texture_id.upper()}"
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.name = f"NORMAL_{texture_id.upper()}"
    normal_map.inputs["Strength"].default_value = normal_strength
    links.new(images["basecolor"].outputs["Color"], shader.inputs["Base Color"])
    links.new(images["normal"].outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], shader.inputs["Normal"])
    links.new(images["orm"].outputs["Color"], separate.inputs["Color"])
    links.new(separate.outputs["Green"], shader.inputs["Roughness"])
    links.new(separate.outputs["Blue"], shader.inputs["Metallic"])


def create_materials(texture_root):
    global TEXTURE_ROOT
    TEXTURE_ROOT = Path(texture_root)

    ceramic = _principled_material("MAT_CERAMIC_SHELL", (0.018, 0.024, 0.027, 1.0), 0.14, 0.78)
    _attach_pbr(ceramic, "ceramic", 0.72)

    titanium = _principled_material("MAT_TITANIUM_SPINE", (0.09, 0.16, 0.18, 1.0), 0.9, 0.34)
    _attach_pbr(titanium, "titanium", 0.5)

    membrane = _principled_material("MAT_SIGNAL_MEMBRANE", (0.05, 0.31, 0.34, 0.58), 0.0, 0.19)
    _attach_pbr(membrane, "membrane", 0.42)
    membrane.diffuse_color = (0.05, 0.31, 0.34, 0.58)
    membrane.use_backface_culling = False
    shader = membrane.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Alpha"].default_value = 0.58
    if "Transmission Weight" in shader.inputs:
        shader.inputs["Transmission Weight"].default_value = 0.26
    if hasattr(membrane, "surface_render_method"):
        membrane.surface_render_method = "DITHERED"

    core = _principled_material(
        "MAT_ARCHIVE_CORE",
        (0.035, 0.012, 0.014, 1.0),
        0.32,
        0.56,
        (0.28, 0.006, 0.008, 1.0),
        0.2,
    )
    _attach_pbr(core, "core", 0.66)

    acid = _principled_material(
        "MAT_ACID_SIGNAL",
        (0.055, 0.21, 0.012, 1.0),
        0.08,
        0.3,
        (0.16, 0.54, 0.008, 1.0),
        0.42,
    )
    return {
        "ceramic": ceramic,
        "titanium": titanium,
        "membrane": membrane,
        "core": core,
        "acid": acid,
    }


def _mesh_object(collection, name, vertices, faces, material, root, uvs=None, smooth=True):
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
    if uvs is not None:
        layer = mesh.uv_layers.new(name="UVMap")
        for loop in mesh.loops:
            layer.data[loop.index].uv = uvs[loop.vertex_index]
    return obj


def _bezier_point(points, t):
    p0, p1, p2, p3 = (Vector(point) for point in points)
    omt = 1.0 - t
    return p0 * (omt ** 3) + p1 * (3.0 * omt * omt * t) + p2 * (3.0 * omt * t * t) + p3 * (t ** 3)


def _bezier_tangent(points, t):
    p0, p1, p2, p3 = (Vector(point) for point in points)
    omt = 1.0 - t
    tangent = (p1 - p0) * (3.0 * omt * omt) + (p2 - p1) * (6.0 * omt * t) + (p3 - p2) * (3.0 * t * t)
    return tangent.normalized()


def _frame(points, t):
    tangent = _bezier_tangent(points, t)
    lateral = Vector((tangent.z, 0.0, -tangent.x))
    if lateral.length < 1e-5:
        lateral = Vector((1.0, 0.0, 0.0))
    lateral.normalize()
    depth = tangent.cross(lateral).normalized()
    return tangent, lateral, depth


def _section_value(sections, t, index):
    if t <= sections[0][0]:
        return sections[0][index]
    for left, right in zip(sections, sections[1:]):
        if left[0] <= t <= right[0]:
            blend = (t - left[0]) / max(1e-6, right[0] - left[0])
            blend = blend * blend * (3.0 - 2.0 * blend)
            return left[index] * (1.0 - blend) + right[index] * blend
    return sections[-1][index]


def create_lofted_shell(name, spine, sections, resolution, material, collection=None, root=None):
    along, across = resolution
    vertices = []
    uvs = []
    phase = spine["phase"]
    for side_index in range(2):
        surface_sign = 1.0 if side_index == 0 else -1.0
        for row in range(along + 1):
            t = row / along
            center = _bezier_point(spine["points"], t)
            tangent, lateral, depth = _frame(spine["points"], t)
            width = _section_value(sections, t, 1)
            thickness = _section_value(sections, t, 2)
            camber = _section_value(sections, t, 3)
            twist = spine["twist"] * (t - 0.5) + 0.08 * math.sin(t * math.pi * 2.0 + phase)
            rotated_lateral = lateral * math.cos(twist) + depth * math.sin(twist)
            rotated_depth = depth * math.cos(twist) - lateral * math.sin(twist)
            for column in range(across + 1):
                u = column / across * 2.0 - 1.0
                edge = abs(u) ** 2.7
                chip = edge * (
                    0.045 * math.sin(t * 91.0 + u * 17.0 + phase)
                    + 0.025 * math.sin(t * 173.0 - u * 11.0 + phase * 2.1)
                )
                width_shape = u * width * (1.0 - 0.07 * math.cos(t * math.pi * 3.0 + phase))
                crown = camber * (1.0 - u * u) + 0.018 * math.sin(u * math.pi * 3.0 + t * 15.0)
                taper = 0.34 + 0.66 * (1.0 - abs(u) ** 1.8)
                position = center + rotated_lateral * width_shape
                position += rotated_depth * (crown + surface_sign * thickness * taper * 0.5)
                position += tangent * chip
                vertices.append(tuple(position))
                uvs.append((t * 3.6, column / across))

    stride = across + 1
    surface_size = (along + 1) * stride
    faces = []
    for row in range(along):
        for column in range(across):
            a = row * stride + column
            faces.append((a, a + 1, a + stride + 1, a + stride))
            b = surface_size + a
            faces.append((b, b + stride, b + stride + 1, b + 1))
    for row in range(along):
        for column in (0, across):
            a = row * stride + column
            b = a + stride
            faces.append((a, surface_size + a, surface_size + b, b))
    for row in (0, along):
        base = row * stride
        for column in range(across):
            a = base + column
            b = a + 1
            faces.append((a, b, surface_size + b, surface_size + a))

    obj = _mesh_object(collection, name, vertices, faces, material, root, uvs, smooth=True)
    obj["source_role"] = "unique_bezier_lofted_ceramic_shell"
    obj["cross_sections"] = len(sections)
    obj["non_mirrored"] = True
    return obj


def _ribbon_mesh(collection, root, name, points, widths, thickness, material, width_subdivisions=4):
    vertices, uvs = [], []
    count = len(points)
    for side_index in range(2):
        sign = 1.0 if side_index == 0 else -1.0
        for index, center_tuple in enumerate(points):
            previous = Vector(points[max(0, index - 1)])
            following = Vector(points[min(count - 1, index + 1)])
            tangent = (following - previous).normalized()
            lateral = Vector((tangent.z, 0.0, -tangent.x))
            if lateral.length < 1e-5:
                lateral = Vector((1.0, 0.0, 0.0))
            lateral.normalize()
            depth = tangent.cross(lateral).normalized()
            center = Vector(center_tuple)
            for lane in range(width_subdivisions + 1):
                u = lane / width_subdivisions * 2.0 - 1.0
                crown = depth * (0.025 * (1.0 - u * u))
                point = center + lateral * widths[index] * u + depth * thickness * sign * 0.5 + crown
                vertices.append(tuple(point))
                uvs.append((index / max(1, count - 1) * 4.0, lane / width_subdivisions))
    stride = width_subdivisions + 1
    side_size = count * stride
    faces = []
    for index in range(count - 1):
        for lane in range(width_subdivisions):
            a = index * stride + lane
            faces.append((a, a + 1, a + stride + 1, a + stride))
            b = side_size + a
            faces.append((b, b + stride, b + stride + 1, b + 1))
    for index in range(count - 1):
        for lane in (0, width_subdivisions):
            a = index * stride + lane
            b = a + stride
            faces.append((a, side_size + a, side_size + b, b))
    for index in (0, count - 1):
        base = index * stride
        for lane in range(width_subdivisions):
            a = base + lane
            faces.append((a, a + 1, side_size + a + 1, side_size + a))
    return _mesh_object(collection, name, vertices, faces, material, root, uvs, smooth=True)


def create_spine_ribbon(name, control_points, width_profile, material, collection=None, root=None):
    segments = width_profile.get("segments", 180)
    points, widths = [], []
    for index in range(segments + 1):
        t = index / segments
        point = _bezier_point(control_points, t)
        point.y += 0.055 * math.sin(t * math.pi * 8.0 + width_profile.get("phase", 0.0))
        points.append(tuple(point))
        width = width_profile["base"] * (
            width_profile.get("tip", 0.48) + (1.0 - width_profile.get("tip", 0.48)) * math.sin(math.pi * (0.04 + t * 0.92)) ** 0.55
        )
        widths.append(width)
    obj = _ribbon_mesh(
        collection,
        root,
        name,
        points,
        widths,
        width_profile.get("thickness", 0.1),
        material,
        width_profile.get("across", 5),
    )
    obj["source_role"] = "continuous_titanium_spine_ribbon" if name == "LISTENER_TitaniumSpine" else "secondary_titanium_rib_fork"
    return obj


def create_tension_membrane(name, boundary_a, boundary_b, segments, material, collection=None, root=None):
    along, across = segments
    vertices, faces, uvs = [], [], []
    phase = boundary_a.get("phase", 0.0)
    for row in range(along + 1):
        t = row / along
        point_a = _bezier_point(boundary_a["points"], t)
        point_b = _bezier_point(boundary_b["points"], t)
        for column in range(across + 1):
            u = column / across
            tension = math.sin(math.pi * u)
            center = point_a.lerp(point_b, u)
            center.y += tension * (boundary_a["sag"] + 0.045 * math.sin(t * 13.0 + phase))
            center.z += tension * 0.08 * math.sin(t * math.pi * 2.0 + phase)
            center.x += tension * 0.035 * math.sin(t * 19.0 - phase)
            vertices.append(tuple(center))
            uvs.append((t * 3.0, u))
    stride = across + 1
    for row in range(along):
        for column in range(across):
            a = row * stride + column
            faces.append((a, a + 1, a + stride + 1, a + stride))
    obj = _mesh_object(collection, name, vertices, faces, material, root, uvs, smooth=True)
    obj["source_role"] = "curved_tension_membrane"
    obj["tension_profile"] = boundary_a["sag"]
    return obj


def create_archive_core(name, resolution, materials, collection=None, root=None):
    rows, around = resolution
    vertices, faces, uvs = [], [], []
    for row in range(rows + 1):
        t = row / rows
        z = -1.38 + t * 2.62
        envelope = math.sin(math.pi * (0.018 + t * 0.964)) ** 0.62
        center_x = 0.22 + 0.13 * math.sin(t * math.pi * 2.5) - 0.1 * t
        center_y = 0.12 + 0.055 * math.sin(t * math.pi * 5.0 + 0.4)
        for column in range(around):
            angle = column / around * math.tau
            irregular = 1.0 + 0.12 * math.sin(angle * 3.0 + t * 11.0) + 0.07 * math.sin(angle * 7.0 - t * 8.0)
            x = center_x + math.cos(angle) * 0.46 * envelope * irregular
            y = center_y + math.sin(angle) * 0.32 * envelope * (1.0 + 0.13 * math.cos(angle * 5.0 + t * 9.0))
            x += 0.08 * math.sin(angle * 2.0 + t * 13.0) * envelope
            vertices.append((x, y, z))
            uvs.append((column / around, t * 2.0))
    for row in range(rows):
        for column in range(around):
            nxt = (column + 1) % around
            a = row * around + column
            b = row * around + nxt
            faces.append((a, b, b + around, a + around))
    obj = _mesh_object(collection, name, vertices, faces, materials[0], root, uvs, smooth=False)
    obj.data.materials.append(materials[1])
    for polygon in obj.data.polygons:
        center_z = polygon.center.z if hasattr(polygon, "center") else 0.0
        polygon.material_index = 1 if polygon.index % 23 in (0, 1) and -1.05 < center_z < 0.95 else 0
    obj["source_role"] = "irregular_recessed_archive_core"
    return obj


def _fibre_points(anchor_points, fibre_index, segments):
    points = []
    lateral_offset = (fibre_index - 10.5) * 0.035
    phase = fibre_index * 1.317
    for index in range(segments + 1):
        t = index / segments
        center = _bezier_point(anchor_points, t)
        tangent, lateral, depth = _frame(anchor_points, t)
        center += lateral * (lateral_offset + 0.045 * math.sin(t * 12.0 + phase))
        center += depth * (0.025 * math.sin(t * 21.0 - phase))
        points.append(tuple(center))
    return points


def create_signal_fibres(name, anchors, count, material, collection=None, root=None, segments=78):
    objects = []
    for fibre_index in range(count):
        points = _fibre_points(anchors, fibre_index, segments)
        widths = [0.005 + 0.002 * math.sin(math.pi * index / segments) for index in range(segments + 1)]
        obj = _ribbon_mesh(
            collection,
            root,
            f"{name}_{fibre_index + 1:02d}",
            points,
            widths,
            0.006,
            material,
            width_subdivisions=1,
        )
        obj["source_role"] = "curved_internal_signal_fibre"
        objects.append(obj)
    return objects


def _smart_uv(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(62.0), island_margin=0.018, area_weight=0.12)
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def _create_subordinate_plate(collection, root, material, name, spine, t, width, height, phase):
    center = _bezier_point(spine, t)
    tangent, lateral, depth = _frame(spine, t)
    center += depth * (0.18 + 0.025 * math.sin(phase))
    outline = []
    points = 7
    for index in range(points):
        angle = index / points * math.tau
        radial = 0.78 + 0.17 * math.sin(index * 2.73 + phase) + 0.07 * math.sin(index * 5.1 - phase)
        outline.append((math.cos(angle) * width * radial, math.sin(angle) * height * radial))
    vertices = []
    thickness = 0.028 + 0.009 * (0.5 + 0.5 * math.sin(phase))
    for sign in (-1.0, 1.0):
        for local_x, local_z in outline:
            position = center + lateral * local_x + tangent * local_z + depth * thickness * sign
            vertices.append(tuple(position))
    faces = [tuple(range(points - 1, -1, -1)), tuple(points + index for index in range(points))]
    for index in range(points):
        nxt = (index + 1) % points
        faces.append((index, nxt, points + nxt, points + index))
    obj = _mesh_object(collection, name, vertices, faces, material, root, smooth=False)
    obj["source_role"] = "curvature_following_subordinate_plate"
    _smart_uv(obj)
    return obj


def add_artifact_shape_keys(root):
    for obj in root.children_recursive:
        if obj.type != "MESH":
            continue
        role = obj.get("source_role", "")
        morphs = []
        if role in {"unique_bezier_lofted_ceramic_shell", "curvature_following_subordinate_plate"}:
            morphs = ["shell_open", "balance_shift"]
        elif role in {"continuous_titanium_spine_ribbon", "secondary_titanium_rib_fork"}:
            morphs = ["balance_shift"]
        elif role == "curved_tension_membrane":
            morphs = ["membrane_tension", "balance_shift"]
        elif role == "irregular_recessed_archive_core":
            morphs = ["core_exposure", "balance_shift"]
        elif role == "curved_internal_signal_fibre":
            morphs = ["signal_sweep", "balance_shift"]
        if not morphs:
            continue

        basis = obj.shape_key_add(name="Basis")
        coordinates = [point.co.copy() for point in basis.data]
        center = sum(coordinates, Vector((0.0, 0.0, 0.0))) / max(1, len(coordinates))
        z_min = min(point.z for point in coordinates)
        z_max = max(point.z for point in coordinates)
        z_span = max(1e-6, z_max - z_min)
        side = -1.0 if center.x < -0.08 else 1.0

        for morph in morphs:
            key = obj.shape_key_add(name=morph)
            for index, point in enumerate(key.data):
                source = coordinates[index]
                normalized_z = (source.z - z_min) / z_span
                if morph == "shell_open":
                    spread = 0.38 + abs(source.z) * 0.06
                    point.co.x = source.x + side * spread
                    point.co.y = source.y + 0.08 + abs(center.x) * 0.025
                    point.co.z = source.z + side * (normalized_z - 0.5) * 0.055
                elif morph == "membrane_tension":
                    point.co.x = center.x + (source.x - center.x) * 0.94
                    point.co.y = center.y + (source.y - center.y) * 0.38
                    point.co.z = center.z + (source.z - center.z) * 1.025
                elif morph == "core_exposure":
                    point.co = center + (source - center) * 1.1
                    point.co.y -= 0.1
                elif morph == "balance_shift":
                    point.co.x = source.x + (normalized_z - 0.5) * 0.12
                    point.co.y = source.y + math.sin(normalized_z * math.pi) * 0.025
                elif morph == "signal_sweep":
                    point.co.x = source.x + math.sin(normalized_z * math.tau) * 0.045
                    point.co.y = source.y - 0.055 + normalized_z * 0.09

        obj.data.shape_keys.use_relative = True


def _look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def create_review_scene(collection=None):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.002, 0.004, 0.006)

    camera_data = bpy.data.cameras.new("LISTENER_REVIEW_CAMERA")
    camera = bpy.data.objects.new("LISTENER_REVIEW_CAMERA", camera_data)
    collection.objects.link(camera)
    camera.location = (9.4, -13.6, 4.6)
    camera.data.lens = 62
    _look_at(camera, (0.0, 0.0, 0.1))
    scene.camera = camera

    light_specs = (
        ("LISTENER_KEY_CYAN", "AREA", (-5.0, -5.0, 6.0), (0.22, 0.72, 0.88), 1150.0, 5.0),
        ("LISTENER_RIM_WHITE", "AREA", (5.2, 1.8, 5.6), (0.66, 0.84, 1.0), 900.0, 4.0),
        ("LISTENER_CORE_RED", "POINT", (0.4, -1.0, 0.1), (1.0, 0.018, 0.026), 180.0, 0.0),
    )
    for name, light_type, location, color, energy, size in light_specs:
        data = bpy.data.lights.new(name, light_type)
        data.color = color
        data.energy = energy
        if light_type == "AREA":
            data.shape = "DISK"
            data.size = size
        obj = bpy.data.objects.new(name, data)
        collection.objects.link(obj)
        obj.location = location
        _look_at(obj, (0.0, 0.0, 0.0))
    return camera


def _triangle_count(obj):
    if obj.type != "MESH":
        return 0
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


def _normalize_bounds(objects):
    minimum = Vector((float("inf"),) * 3)
    maximum = Vector((float("-inf"),) * 3)
    for obj in objects:
        for vertex in obj.data.vertices:
            minimum.x = min(minimum.x, vertex.co.x)
            minimum.y = min(minimum.y, vertex.co.y)
            minimum.z = min(minimum.z, vertex.co.z)
            maximum.x = max(maximum.x, vertex.co.x)
            maximum.y = max(maximum.y, vertex.co.y)
            maximum.z = max(maximum.z, vertex.co.z)
    center = (minimum + maximum) * 0.5
    dimensions = maximum - minimum
    target = Vector(ARTIFACT_SPEC["target_bounds"])
    scale = min(1.0, *(target[index] * 0.985 / max(dimensions[index], 1e-6) for index in range(3)))
    for obj in objects:
        for vertex in obj.data.vertices:
            vertex.co = (vertex.co - center) * scale
        obj.data.update()
    return scale


def _object_bounds(objects):
    minimum = Vector((float("inf"),) * 3)
    maximum = Vector((float("-inf"),) * 3)
    for obj in objects:
        for vertex in obj.data.vertices:
            minimum.x = min(minimum.x, vertex.co.x)
            minimum.y = min(minimum.y, vertex.co.y)
            minimum.z = min(minimum.z, vertex.co.z)
            maximum.x = max(maximum.x, vertex.co.x)
            maximum.y = max(maximum.y, vertex.co.y)
            maximum.z = max(maximum.z, vertex.co.z)
    return minimum, maximum, maximum - minimum


def build_artifact(lod="high"):
    if lod not in {"high", "low"}:
        raise ValueError(f"Unsupported Listener LOD: {lod}")

    if lod == "high":
        export_collection, form_collection, signal_collection, review_collection = reset_scene()
        materials = create_materials(TEXTURE_ROOT)
    else:
        export_collection, form_collection, signal_collection = create_lod_collections("low")
        review_collection = None
        materials = {
            "ceramic": bpy.data.materials["MAT_CERAMIC_SHELL"],
            "titanium": bpy.data.materials["MAT_TITANIUM_SPINE"],
            "membrane": bpy.data.materials["MAT_SIGNAL_MEMBRANE"],
            "core": bpy.data.materials["MAT_ARCHIVE_CORE"],
            "acid": bpy.data.materials["MAT_ACID_SIGNAL"],
        }
    root_name = ARTIFACT_SPEC["root"] if lod == "high" else "LISTENER_ARTIFACT_LOW_SOURCE"
    root = bpy.data.objects.new(root_name, None)
    export_collection.objects.link(root)
    root["asset_id"] = "listener-artifact"
    root["asset_stage"] = f"{lod}_source_morph_ready"
    root["export_root"] = ARTIFACT_SPEC["root"]
    root["authored_origin"] = "original_deterministic_blender_geometry"
    root["visual_reference"] = "assets/project-media/listener-concept.png"
    root["reference_usage"] = "silhouette_palette_only_not_mesh_source"
    root["required_controls"] = ",".join(ARTIFACT_SPEC["morphs"])

    shell_specs = (
        {
            "name": "LISTENER_Shell_01_LeftKeel",
            "points": ((-0.55, 0.05, -3.85), (-2.4, -0.05, -2.2), (-3.6, 0.12, 0.25), (-3.25, 0.18, 2.0)),
            "sections": ((0.0, 0.18, 0.11, 0.02), (0.2, 0.38, 0.15, 0.08), (0.47, 0.55, 0.18, 0.13), (0.74, 0.38, 0.13, 0.07), (1.0, 0.12, 0.07, 0.01)),
            "twist": -0.34,
            "phase": 0.2,
        },
        {
            "name": "LISTENER_Shell_02_LeftCrown",
            "points": ((-3.28, 0.12, 1.75), (-2.8, -0.12, 2.8), (-0.9, -0.25, 3.55), (0.18, -0.08, 3.94)),
            "sections": ((0.0, 0.12, 0.08, 0.02), (0.18, 0.28, 0.11, 0.08), (0.45, 0.5, 0.16, 0.12), (0.72, 0.42, 0.13, 0.09), (1.0, 0.16, 0.07, 0.02)),
            "twist": 0.42,
            "phase": 1.1,
        },
        {
            "name": "LISTENER_Shell_03_CentralReliquary",
            "points": ((-0.42, -0.18, -3.35), (-0.25, -0.55, -1.4), (0.62, -0.44, 1.65), (0.35, -0.02, 3.98)),
            "sections": ((0.0, 0.2, 0.1, 0.02), (0.2, 0.48, 0.17, 0.14), (0.46, 0.64, 0.21, 0.19), (0.72, 0.5, 0.16, 0.1), (1.0, 0.18, 0.08, 0.01)),
            "twist": -0.23,
            "phase": 2.4,
        },
        {
            "name": "LISTENER_Shell_04_RightMonolith",
            "points": ((1.0, 0.18, -3.0), (2.0, 0.48, -1.8), (3.25, 0.34, 1.2), (3.08, 0.18, 3.72)),
            "sections": ((0.0, 0.24, 0.12, 0.03), (0.22, 0.62, 0.2, 0.12), (0.48, 0.9, 0.24, 0.2), (0.76, 0.74, 0.19, 0.15), (1.0, 0.32, 0.1, 0.03)),
            "twist": 0.28,
            "phase": 3.3,
        },
        {
            "name": "LISTENER_Shell_05_RightInnerBlade",
            "points": ((0.55, -0.5, -2.72), (1.15, -0.86, -1.15), (1.5, -0.62, 1.7), (1.03, -0.3, 3.3)),
            "sections": ((0.0, 0.12, 0.08, 0.02), (0.16, 0.3, 0.12, 0.06), (0.44, 0.46, 0.15, 0.13), (0.7, 0.35, 0.11, 0.08), (1.0, 0.09, 0.055, 0.01)),
            "twist": -0.5,
            "phase": 4.7,
        },
        {
            "name": "LISTENER_Shell_06_LowerMandible",
            "points": ((-2.55, 0.46, -2.42), (-1.75, 0.72, -3.12), (0.05, 0.6, -3.67), (1.5, 0.36, -3.16)),
            "sections": ((0.0, 0.11, 0.065, 0.01), (0.24, 0.32, 0.11, 0.07), (0.5, 0.52, 0.16, 0.12), (0.77, 0.38, 0.12, 0.08), (1.0, 0.1, 0.06, 0.01)),
            "twist": 0.36,
            "phase": 5.5,
        },
        {
            "name": "LISTENER_Shell_07_ArchiveGuard",
            "points": ((-0.82, 0.72, -1.7), (-1.08, 0.94, -0.4), (-0.48, 0.88, 1.2), (0.22, 0.56, 2.25)),
            "sections": ((0.0, 0.1, 0.06, 0.01), (0.18, 0.24, 0.09, 0.05), (0.46, 0.42, 0.13, 0.11), (0.76, 0.31, 0.1, 0.07), (1.0, 0.08, 0.05, 0.01)),
            "twist": -0.38,
            "phase": 6.8,
        },
    )

    objects = []
    shells = []
    shell_resolution = (76, 32) if lod == "high" else (42, 18)
    for spec in shell_specs:
        spine = {"points": spec["points"], "twist": spec["twist"], "phase": spec["phase"]}
        shell = create_lofted_shell(
            spec["name"],
            spine,
            spec["sections"],
            shell_resolution,
            materials["ceramic"],
            form_collection,
            root,
        )
        shells.append(shell)
        objects.append(shell)

    main_spine_points = ((-0.24, 0.1, -3.62), (-0.5, -0.1, -1.35), (0.78, 0.02, 1.55), (0.35, 0.12, 3.82))
    spine = create_spine_ribbon(
        "LISTENER_TitaniumSpine",
        main_spine_points,
        {"base": 0.26, "tip": 0.34, "thickness": 0.13, "segments": 210 if lod == "high" else 108, "across": 6 if lod == "high" else 3, "phase": 0.7},
        materials["titanium"],
        form_collection,
        root,
    )
    objects.append(spine)

    fork_specs = (
        ((-0.2, 0.05, -2.6), (-1.1, 0.05, -2.25), (-2.0, 0.12, -1.35), (-2.58, 0.18, -0.62)),
        ((-0.34, -0.02, -1.4), (-1.2, -0.18, -0.55), (-2.6, -0.08, 0.25), (-3.18, 0.08, 1.48)),
        ((0.04, 0.0, -1.92), (0.8, 0.12, -1.7), (1.55, 0.24, -1.25), (2.28, 0.28, -0.52)),
        ((0.35, -0.05, -0.62), (1.22, -0.14, 0.05), (2.05, -0.02, 0.72), (2.65, 0.12, 1.55)),
        ((0.46, 0.0, 1.08), (-0.15, 0.08, 1.8), (-1.12, 0.06, 2.45), (-2.0, 0.14, 2.82)),
        ((0.52, 0.05, 1.55), (1.05, 0.16, 2.05), (1.82, 0.22, 2.52), (2.5, 0.2, 2.92)),
    )
    for index, points in enumerate(fork_specs):
        fork = create_spine_ribbon(
            f"LISTENER_RibFork_{index + 1:02d}",
            points,
            {"base": 0.11 - index * 0.006, "tip": 0.22, "thickness": 0.065, "segments": 82 if lod == "high" else 44, "across": 3 if lod == "high" else 2, "phase": index * 0.8},
            materials["titanium"],
            form_collection,
            root,
        )
        objects.append(fork)

    membrane_specs = (
        (
            "LISTENER_Membrane_01_ListeningSpan",
            {"points": ((-3.12, -0.05, 1.58), (-2.25, -0.3, 1.48), (-1.0, -0.48, 1.76), (-0.08, -0.35, 2.55)), "sag": -0.48, "phase": 0.2},
            {"points": ((-2.6, 0.0, -0.72), (-1.84, -0.18, -0.24), (-0.8, -0.32, 0.48), (0.02, -0.28, 1.24))},
        ),
        (
            "LISTENER_Membrane_02_ArchiveVeil",
            {"points": ((-0.68, -0.42, -2.05), (-0.62, -0.65, -0.9), (-0.35, -0.74, 0.48), (0.08, -0.48, 1.76)), "sag": -0.32, "phase": 2.1},
            {"points": ((0.62, -0.55, -2.38), (0.9, -0.72, -1.12), (1.08, -0.62, 0.38), (0.85, -0.38, 2.22))},
        ),
        (
            "LISTENER_Membrane_03_RightTendon",
            {"points": ((0.85, 0.08, -2.42), (1.48, -0.18, -1.2), (1.84, -0.22, 0.48), (1.52, -0.02, 2.38)), "sag": 0.27, "phase": 4.2},
            {"points": ((1.55, 0.12, -2.05), (2.2, 0.02, -0.92), (2.68, 0.08, 0.72), (2.72, 0.16, 2.72))},
        ),
    )
    for name, boundary_a, boundary_b in membrane_specs:
        membrane = create_tension_membrane(
            name,
            boundary_a,
            boundary_b,
            (88, 24) if lod == "high" else (44, 10),
            materials["membrane"],
            form_collection,
            root,
        )
        objects.append(membrane)

    core = create_archive_core(
        "LISTENER_ArchiveCore",
        (76, 36) if lod == "high" else (38, 18),
        (materials["core"], materials["acid"]),
        form_collection,
        root,
    )
    objects.append(core)

    fibre_anchors = ((-0.18, -0.02, -2.58), (-0.72, -0.1, -0.8), (0.62, -0.06, 0.86), (0.38, 0.02, 2.68))
    fibres = create_signal_fibres(
        "LISTENER_SignalFibre",
        fibre_anchors,
        22 if lod == "high" else 14,
        materials["acid"],
        signal_collection,
        root,
        segments=78 if lod == "high" else 44,
    )
    objects.extend(fibres)

    plates = []
    plate_count = 32 if lod == "high" else 24
    for plate_index in range(plate_count):
        source = shell_specs[(plate_index * 5 + 2) % len(shell_specs)]
        t = 0.11 + ((plate_index * 19) % 73) / 100.0
        plate = _create_subordinate_plate(
            form_collection,
            root,
            materials["ceramic"],
            f"LISTENER_SurfacePlate_{plate_index + 1:02d}",
            source["points"],
            t,
            0.11 + (plate_index % 5) * 0.025,
            0.12 + ((plate_index * 3) % 7) * 0.018,
            source["phase"] + plate_index * 0.47,
        )
        plates.append(plate)
        objects.append(plate)

    scale = _normalize_bounds(objects)
    for obj in objects:
        obj.hide_render = False
        obj.hide_viewport = False
        obj.rotation_euler = (0.0, 0.0, 0.0)
        obj.scale = (1.0, 1.0, 1.0)

    add_artifact_shape_keys(root)
    if review_collection is not None:
        create_review_scene(review_collection)
    return root, objects, scale


def _validate_source(root, objects, lod):
    triangles = sum(_triangle_count(obj) for obj in objects)
    visible_meshes = [obj for obj in objects if obj.type == "MESH" and not obj.hide_viewport and not obj.hide_render]
    minimum, maximum = ARTIFACT_SPEC[f"{lod}_triangles"]
    if not minimum <= triangles <= maximum:
        raise RuntimeError(f"{lod.title()} source has {triangles} triangles; expected {minimum}-{maximum}")
    minimum_meshes = 50 if lod == "high" else 38
    if len(visible_meshes) <= minimum_meshes:
        raise RuntimeError(f"{lod.title()} source has {len(visible_meshes)} visible meshes; expected more than {minimum_meshes}")

    material_names = sorted({slot.material.name for obj in visible_meshes for slot in obj.material_slots if slot.material})
    missing_materials = sorted(set(ARTIFACT_SPEC["materials"]) - set(material_names))
    if missing_materials:
        raise RuntimeError(f"Missing required materials: {missing_materials}")

    shell_count = sum(obj.get("source_role") == "unique_bezier_lofted_ceramic_shell" for obj in visible_meshes)
    membrane_count = sum(obj.get("source_role") == "curved_tension_membrane" for obj in visible_meshes)
    fibre_count = sum(obj.get("source_role") == "curved_internal_signal_fibre" for obj in visible_meshes)
    plate_count = sum(obj.get("source_role") == "curvature_following_subordinate_plate" for obj in visible_meshes)
    expected_fibres = 22 if lod == "high" else 14
    expected_plates = 32 if lod == "high" else 24
    if (shell_count, membrane_count, fibre_count, plate_count) != (7, 3, expected_fibres, expected_plates):
        raise RuntimeError(
            f"Source composition mismatch: shells={shell_count}, membranes={membrane_count}, fibres={fibre_count}, plates={plate_count}"
        )

    minimum_bound, maximum_bound, dimensions = _object_bounds(visible_meshes)
    target = Vector(ARTIFACT_SPEC["target_bounds"])
    if any(dimensions[index] > target[index] + 1e-5 for index in range(3)):
        raise RuntimeError(f"Bounds exceed contract: {tuple(round(value, 4) for value in dimensions)}")
    if root.location.length > 1e-6 or any(abs(value - 1.0) > 1e-6 for value in root.scale):
        raise RuntimeError("Root transform is not identity")
    return {
        "triangles": triangles,
        "visible_meshes": len(visible_meshes),
        "materials": material_names,
        "minimum": tuple(minimum_bound),
        "maximum": tuple(maximum_bound),
        "dimensions": tuple(dimensions),
        "shells": shell_count,
        "membranes": membrane_count,
        "fibres": fibre_count,
        "plates": plate_count,
    }


def main():
    high_root, high_objects, high_scale = build_artifact("high")
    low_root, low_objects, low_scale = build_artifact("low")
    high_metrics = _validate_source(high_root, high_objects, "high")
    low_metrics = _validate_source(low_root, low_objects, "low")
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.frame_start = 1
    scene.frame_end = 1
    scene.render.fps = 30
    scene["asset_id"] = "listener-artifact"
    scene["asset_stage"] = "task-4-morph-and-lod-source"
    scene["required_root"] = ARTIFACT_SPEC["root"]
    scene["required_controls"] = ",".join(ARTIFACT_SPEC["morphs"])
    scene["high_source_triangles"] = high_metrics["triangles"]
    scene["low_source_triangles"] = low_metrics["triangles"]
    scene["high_source_visible_meshes"] = high_metrics["visible_meshes"]
    scene["low_source_visible_meshes"] = low_metrics["visible_meshes"]
    scene["high_source_dimensions"] = ",".join(f"{value:.6f}" for value in high_metrics["dimensions"])
    scene["low_source_dimensions"] = ",".join(f"{value:.6f}" for value in low_metrics["dimensions"])
    scene["high_normalization_scale"] = high_scale
    scene["low_normalization_scale"] = low_scale

    OUTPUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND.resolve()), compress=True)

    print("Created Listener artifact source")
    print("LISTENER_SOURCE_BLEND", OUTPUT_BLEND.resolve())
    print("LISTENER_HIGH_SOURCE_TRIANGLES", high_metrics["triangles"])
    print("LISTENER_LOW_SOURCE_TRIANGLES", low_metrics["triangles"])
    print("LISTENER_HIGH_SOURCE_VISIBLE_MESHES", high_metrics["visible_meshes"])
    print("LISTENER_LOW_SOURCE_VISIBLE_MESHES", low_metrics["visible_meshes"])
    print("LISTENER_SOURCE_MATERIALS", high_metrics["materials"])
    print("LISTENER_HIGH_SOURCE_BOUNDS_MIN", tuple(round(value, 6) for value in high_metrics["minimum"]))
    print("LISTENER_LOW_SOURCE_BOUNDS_MIN", tuple(round(value, 6) for value in low_metrics["minimum"]))
    print("LISTENER_HIGH_SOURCE_BOUNDS_MAX", tuple(round(value, 6) for value in high_metrics["maximum"]))
    print("LISTENER_LOW_SOURCE_BOUNDS_MAX", tuple(round(value, 6) for value in low_metrics["maximum"]))
    print("LISTENER_HIGH_SOURCE_DIMENSIONS", tuple(round(value, 6) for value in high_metrics["dimensions"]))
    print("LISTENER_LOW_SOURCE_DIMENSIONS", tuple(round(value, 6) for value in low_metrics["dimensions"]))
    print(
        "LISTENER_HIGH_SOURCE_COMPOSITION",
        {key: high_metrics[key] for key in ("shells", "membranes", "fibres", "plates")},
    )
    print(
        "LISTENER_LOW_SOURCE_COMPOSITION",
        {key: low_metrics[key] for key in ("shells", "membranes", "fibres", "plates")},
    )


if __name__ == "__main__":
    main()
