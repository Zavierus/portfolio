from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = REPOSITORY_ROOT / "assets" / "source" / "relic-01" / "base" / "polyhaven"
OUTPUT_BLEND = REPOSITORY_ROOT / "assets" / "source" / "relic-01" / "blender" / "relic-01.blend"
TEXTURE_ROOT = REPOSITORY_ROOT / "assets" / "source" / "relic-01" / "textures" / "baked"

SHELL_SOURCE = SOURCE_ROOT / "lambis_shell" / "lambis_shell_2k.blend"
EROSION_SOURCE = SOURCE_ROOT / "dead_quiver_branch_01" / "dead_quiver_branch_01_2k.blend"
INTERFACE_SOURCE = SOURCE_ROOT / "modular_electric_cables" / "modular_electric_cables_2k.blend"

TARGET_HIGH_TRIANGLES = 162_000
TARGET_CORE_TRIANGLES = 18_000


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    base = bpy.data.collections.get("Collection")
    if base:
        base.name = "RELIC_EXPORT"


def require_sources() -> None:
    missing = [path for path in (SHELL_SOURCE, EROSION_SOURCE, INTERFACE_SOURCE) if not path.exists()]
    if missing:
        joined = "\n".join(str(path) for path in missing)
        raise FileNotFoundError(f"RELIC//01 source packages are missing:\n{joined}")

    required_textures = [
        TEXTURE_ROOT / f"{material}-{role}.png"
        for material in ("bone", "alloy", "core", "membrane")
        for role in ("basecolor", "normal", "orm")
    ]
    missing_textures = [path for path in required_textures if not path.exists()]
    if missing_textures:
        joined = "\n".join(str(path) for path in missing_textures)
        raise FileNotFoundError(f"Run scripts/generate-relic-textures.mjs before authoring:\n{joined}")


def append_object(source_path: Path, object_name: str, collection: bpy.types.Collection) -> bpy.types.Object:
    with bpy.data.libraries.load(str(source_path), link=False) as (source, target):
        if object_name not in source.objects:
            raise KeyError(f"{object_name} is not present in {source_path}")
        target.objects = [object_name]
    obj = target.objects[0]
    for owner in list(obj.users_collection):
        owner.objects.unlink(obj)
    collection.objects.link(obj)
    obj.data = obj.data.copy()
    return obj


def material_principled(
    name: str,
    base_color: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
    alpha: float = 1.0,
    subsurface: float = 0.0,
    transmission: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = base_color
    material.metallic = metallic
    material.roughness = roughness
    nodes = material.node_tree.nodes
    principled = nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = base_color
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Alpha"].default_value = alpha
    if "Coat Weight" in principled.inputs:
        principled.inputs["Coat Weight"].default_value = 0.2 if metallic else 0.08
    if "Subsurface Weight" in principled.inputs:
        principled.inputs["Subsurface Weight"].default_value = subsurface
    if "Transmission Weight" in principled.inputs:
        principled.inputs["Transmission Weight"].default_value = transmission
    if emission:
        principled.inputs["Emission Color"].default_value = emission
        principled.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1.0:
        material.diffuse_color = (*base_color[:3], alpha)
        if hasattr(material, "surface_render_method"):
            material.surface_render_method = "DITHERED"
        material.use_transparency_overlap = False
    material.use_backface_culling = False
    return material


def add_surface_variation(material: bpy.types.Material, colors: tuple[tuple[float, ...], tuple[float, ...]], scale: float) -> None:
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    principled = nodes.get("Principled BSDF")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.name = f"{material.name}_Microstructure"
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 7.0
    noise.inputs["Roughness"].default_value = 0.72
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = colors[0]
    ramp.color_ramp.elements[1].color = colors[1]
    ramp.color_ramp.elements[0].position = 0.28
    ramp.color_ramp.elements[1].position = 0.76
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.24
    bump.inputs["Distance"].default_value = 0.035
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], principled.inputs["Base Color"])
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], principled.inputs["Normal"])


def enable_cycles_transparency(material: bpy.types.Material, opacity: float) -> None:
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    principled = nodes.get("Principled BSDF")
    output = nodes.get("Material Output")
    for link in list(output.inputs["Surface"].links):
        links.remove(link)
    transparent = nodes.new("ShaderNodeBsdfTransparent")
    mix = nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = opacity
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(principled.outputs["BSDF"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])


def attach_pbr_textures(material: bpy.types.Material, texture_id: str) -> None:
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    principled = nodes.get("Principled BSDF")
    base_image = bpy.data.images.load(str(TEXTURE_ROOT / f"{texture_id}-basecolor.png"), check_existing=True)
    normal_image = bpy.data.images.load(str(TEXTURE_ROOT / f"{texture_id}-normal.png"), check_existing=True)
    orm_image = bpy.data.images.load(str(TEXTURE_ROOT / f"{texture_id}-orm.png"), check_existing=True)
    base_image.colorspace_settings.name = "sRGB"
    normal_image.colorspace_settings.name = "Non-Color"
    orm_image.colorspace_settings.name = "Non-Color"

    base_node = nodes.new("ShaderNodeTexImage")
    base_node.name = f"{texture_id}_basecolor"
    base_node.label = "Base Color"
    base_node.image = base_image
    normal_node = nodes.new("ShaderNodeTexImage")
    normal_node.name = f"{texture_id}_normal"
    normal_node.label = "Normal"
    normal_node.image = normal_image
    orm_node = nodes.new("ShaderNodeTexImage")
    orm_node.name = f"{texture_id}_orm"
    orm_node.label = "Occlusion Roughness Metallic"
    orm_node.image = orm_image
    separate = nodes.new("ShaderNodeSeparateColor")
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.62 if texture_id in {"bone", "core"} else 0.48

    for socket in (principled.inputs["Base Color"], principled.inputs["Normal"], principled.inputs["Roughness"], principled.inputs["Metallic"]):
        for link in list(socket.links):
            links.remove(link)
    links.new(base_node.outputs["Color"], principled.inputs["Base Color"])
    links.new(normal_node.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], principled.inputs["Normal"])
    links.new(orm_node.outputs["Color"], separate.inputs["Color"])
    links.new(separate.outputs["Green"], principled.inputs["Roughness"])
    links.new(separate.outputs["Blue"], principled.inputs["Metallic"])


def smart_project_uv(obj: bpy.types.Object) -> None:
    if obj.type != "MESH" or not obj.data.polygons:
        return
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.008, area_weight=0.12)
    bpy.ops.object.mode_set(mode="OBJECT")


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(material)


def apply_modifier(obj: bpy.types.Object, modifier: bpy.types.Modifier) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def triangle_count(obj: bpy.types.Object) -> int:
    if obj.type != "MESH":
        return 0
    obj.data.calc_loop_triangles()
    return len(obj.data.loop_triangles)


def shade_smooth(obj: bpy.types.Object) -> None:
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def deform_shell(obj: bpy.types.Object) -> None:
    coordinates = [vertex.co.copy() for vertex in obj.data.vertices]
    minimum = Vector((min(v.x for v in coordinates), min(v.y for v in coordinates), min(v.z for v in coordinates)))
    maximum = Vector((max(v.x for v in coordinates), max(v.y for v in coordinates), max(v.z for v in coordinates)))
    center = (minimum + maximum) * 0.5
    span = maximum - minimum

    for vertex in obj.data.vertices:
        source = vertex.co.copy()
        t = (source.x - minimum.x) / span.x
        nx_raw = (source.z - center.z) / max(span.z * 0.5, 1e-6)
        ny_raw = (source.y - center.y) / max(span.y * 0.5, 1e-6)
        nx = math.tanh(nx_raw * 1.22) / math.tanh(1.22)
        ny = math.tanh(ny_raw * 1.18) / math.tanh(1.18)
        envelope = 0.56 + 0.5 * math.sin(math.pi * t) ** 0.82
        x = nx * 0.5 * envelope
        y = ny * 0.34 * (0.82 + 0.22 * math.cos(math.pi * (t + 0.12)))
        angle = -0.72 + 1.62 * t + 0.2 * math.sin(3.0 * math.pi * t)
        rotated_x = x * math.cos(angle) - y * math.sin(angle)
        rotated_y = x * math.sin(angle) + y * math.cos(angle)
        sway = 0.21 * math.sin(2.0 * math.pi * (t - 0.08)) + 0.12 * (t - 0.5)
        torsion = 0.038 * math.sin(source.y * 175.0 + source.z * 109.0)
        vertex.co = (
            rotated_x + sway + torsion * (0.25 + t),
            rotated_y - 0.05 * math.cos(2.0 * math.pi * t),
            (t - 0.5) * 2.82 + 0.055 * math.sin(source.z * 140.0),
        )

    obj.name = "RELIC_BoneShell"
    obj.data.name = "RELIC_BoneShell_High"
    obj["source_asset"] = "polyhaven:lambis_shell"
    obj["source_role"] = "primary_mass_deep_remesh"
    shade_smooth(obj)

    remesh = obj.modifiers.new("Shell volume rebuild", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = 0.0225
    remesh.adaptivity = 0.025
    remesh.use_remove_disconnected = True
    remesh.use_smooth_shade = True
    apply_modifier(obj, remesh)

    smooth = obj.modifiers.new("Source identity removal", "SMOOTH")
    smooth.factor = 0.42
    smooth.iterations = 4
    apply_modifier(obj, smooth)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1.0, location=(-0.03, -0.01, -0.02))
    cutter = bpy.context.object
    cutter.name = "RELIC_AUTHOR_IrregularVoid"
    for vertex in cutter.data.vertices:
        source = vertex.co.copy()
        irregularity = 1.0 + 0.1 * math.sin(source.z * 7.0 + source.x * 4.0)
        vertex.co.x *= 0.29 * irregularity
        vertex.co.y *= 0.72 * (1.0 + 0.06 * math.cos(source.x * 8.0))
        vertex.co.z *= 0.79 * (1.0 + 0.08 * math.sin(source.y * 6.0))
        vertex.co.x += 0.07 * source.z * source.z - 0.025
    boolean = obj.modifiers.new("Authored negative space", "BOOLEAN")
    boolean.operation = "DIFFERENCE"
    boolean.solver = "EXACT"
    boolean.object = cutter
    apply_modifier(obj, boolean)
    bpy.data.objects.remove(cutter, do_unlink=True)

    bevel = obj.modifiers.new("Void edge wear", "BEVEL")
    bevel.width = 0.018
    bevel.segments = 2
    bevel.limit_method = "ANGLE"
    apply_modifier(obj, bevel)

    subdivision = obj.modifiers.new("Sculpt density", "SUBSURF")
    subdivision.subdivision_type = "CATMULL_CLARK"
    subdivision.levels = 1
    subdivision.render_levels = 1
    apply_modifier(obj, subdivision)

    texture = bpy.data.textures.new("RELIC_Bone_Erosion", type="CLOUDS")
    texture.noise_scale = 0.085
    texture.noise_depth = 2
    displacement = obj.modifiers.new("Bone erosion", "DISPLACE")
    displacement.texture = texture
    displacement.texture_coords = "GLOBAL"
    displacement.strength = 0.027
    displacement.mid_level = 0.52
    apply_modifier(obj, displacement)

    settle = obj.modifiers.new("Erosion settle", "SMOOTH")
    settle.factor = 0.13
    settle.iterations = 2
    apply_modifier(obj, settle)


def make_membrane(collection: bpy.types.Collection, material: bpy.types.Material, root: bpy.types.Object) -> bpy.types.Object:
    across = 42
    vertical = 58
    vertices = []
    faces = []
    parameters = []
    for row in range(vertical + 1):
        t = row / vertical
        z = -0.82 + t * 1.72
        spread = math.sin(math.pi * t) ** 0.64
        center_x = -0.11 - 0.14 * t + 0.035 * math.sin(3.0 * math.pi * t)
        left_width = spread * (0.42 + 0.13 * t)
        right_width = spread * (0.27 - 0.04 * t)
        for column in range(across + 1):
            u = column / across * 2.0 - 1.0
            interpolation = (u + 1.0) * 0.5
            edge_falloff = math.cos(u * math.pi * 0.5) ** 0.7
            y = -0.045 + 0.052 * edge_falloff * math.sin(2.4 * math.pi * t + u * 0.9)
            y += 0.018 * u
            x = (center_x - left_width) * (1.0 - interpolation) + (center_x + right_width) * interpolation
            x += 0.015 * math.sin(13.0 * t + 2.0 * u) * edge_falloff
            vertices.append((x, y, z))
            parameters.append((u, t, y))
    for row in range(vertical):
        for column in range(across):
            a = row * (across + 1) + column
            b = a + 1
            c = a + across + 2
            d = a + across + 1
            faces.append((a, b, c, d))

    mesh = bpy.data.meshes.new("RELIC_TensionMembrane_High")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("RELIC_TensionMembrane", mesh)
    collection.objects.link(obj)
    obj.parent = root
    assign_material(obj, material)
    shade_smooth(obj)
    obj["source_role"] = "authored_tension_surface"

    obj.shape_key_add(name="Basis")
    tension = obj.shape_key_add(name="membrane_tension")
    for index, (u, t, relaxed_y) in enumerate(parameters):
        edge_falloff = math.cos(u * math.pi * 0.5) ** 0.7
        tension.data[index].co.x *= 1.025
        tension.data[index].co.y = -0.04 + (relaxed_y + 0.04) * 0.25
        tension.data[index].co.y += 0.009 * math.sin(9.0 * math.pi * t + u) * edge_falloff
    animate_shape_key(obj, "membrane_tension", [(1, 0.1), (42, 0.78), (84, 0.24)])
    return obj


def make_ribbons(collection: bpy.types.Collection, material: bpy.types.Material, root: bpy.types.Object) -> bpy.types.Object:
    ribbon_count = 7
    segments = 52
    collapsed = []
    revealed = []
    faces = []
    for ribbon in range(ribbon_count):
        offset = (ribbon - (ribbon_count - 1) * 0.5) * 0.052
        for segment in range(segments + 1):
            t = segment / segments
            z = -0.69 + t * 1.42
            center_x = -0.1 - 0.13 * t + 0.035 * math.sin(3.0 * math.pi * t)
            x = center_x + offset * math.sin(math.pi * t) * (1.25 + 0.08 * math.sin(t * 11.0 + ribbon))
            y = -0.072 + 0.011 * math.sin(t * 15.0 + ribbon * 1.7)
            width = 0.0045 + 0.0015 * ((ribbon + segment) % 3)
            revealed.extend([(x - width, y, z), (x + width, y, z)])
            reveal_t = min(1.0, max(0.0, t * 7.0))
            collapsed_z = -0.69 + reveal_t * 0.05
            collapsed.extend([(-0.045 - width, y, collapsed_z), (-0.045 + width, y, collapsed_z)])
        start = ribbon * (segments + 1) * 2
        for segment in range(segments):
            a = start + segment * 2
            faces.append((a, a + 1, a + 3, a + 2))

    mesh = bpy.data.meshes.new("RELIC_FibreBundle_High")
    mesh.from_pydata(collapsed, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("RELIC_FibreBundle", mesh)
    collection.objects.link(obj)
    obj.parent = root
    assign_material(obj, material)
    obj["source_role"] = "authored_membrane_fibres"
    obj.shape_key_add(name="Basis")
    reveal = obj.shape_key_add(name="fibre_reveal")
    for index, coordinate in enumerate(revealed):
        reveal.data[index].co = coordinate
    animate_shape_key(obj, "fibre_reveal", [(1, 0.0), (36, 0.0), (72, 1.0)])
    return obj


def compact_erosion_core(obj: bpy.types.Object) -> None:
    coordinates = [vertex.co.copy() for vertex in obj.data.vertices]
    minimum = Vector((min(v.x for v in coordinates), min(v.y for v in coordinates), min(v.z for v in coordinates)))
    maximum = Vector((max(v.x for v in coordinates), max(v.y for v in coordinates), max(v.z for v in coordinates)))
    center = (minimum + maximum) * 0.5
    span = maximum - minimum
    for vertex in obj.data.vertices:
        source = vertex.co.copy()
        nx = (source.x - center.x) / max(span.x * 0.5, 1e-6)
        ny = (source.y - center.y) / max(span.y * 0.5, 1e-6)
        nz = (source.z - center.z) / max(span.z * 0.5, 1e-6)
        radius = 0.9 + 0.15 * math.sin(nx * 5.3 + nz * 3.7)
        vertex.co = (
            -0.015 + nx * 0.25 * radius + 0.07 * nz + 0.035 * math.sin(nz * 4.0),
            -0.095 + ny * 0.18 + 0.025 * math.sin(nx * 6.0),
            -0.12 + nz * 0.32 * radius + 0.045 * nx * ny,
        )
    obj.name = "RELIC_IrregularCore"
    obj.data.name = "RELIC_IrregularCore_High"
    obj["source_asset"] = "polyhaven:dead_quiver_branch_01"
    obj["source_role"] = "fracture_volume_deep_remesh"

    remesh = obj.modifiers.new("Core union", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = 0.0075
    remesh.adaptivity = 0.015
    remesh.use_remove_disconnected = False
    remesh.use_smooth_shade = True
    apply_modifier(obj, remesh)

    smooth = obj.modifiers.new("Core tissue settle", "SMOOTH")
    smooth.factor = 0.34
    smooth.iterations = 3
    apply_modifier(obj, smooth)

    texture = bpy.data.textures.new("RELIC_Core_Microfold", type="CLOUDS")
    texture.noise_scale = 0.034
    texture.noise_depth = 3
    displacement = obj.modifiers.new("Core microfold", "DISPLACE")
    displacement.texture = texture
    displacement.texture_coords = "GLOBAL"
    displacement.strength = 0.014
    displacement.mid_level = 0.5
    apply_modifier(obj, displacement)

    current = triangle_count(obj)
    if current > TARGET_CORE_TRIANGLES:
        decimate = obj.modifiers.new("Core retopology target", "DECIMATE")
        decimate.decimate_type = "COLLAPSE"
        decimate.ratio = TARGET_CORE_TRIANGLES / current
        decimate.use_collapse_triangulate = True
        apply_modifier(obj, decimate)
    shade_smooth(obj)

    obj.shape_key_add(name="Basis")
    wake = obj.shape_key_add(name="core_wake")
    center_point = Vector((-0.015, -0.095, -0.12))
    for index, vertex in enumerate(wake.data):
        direction = vertex.co - center_point
        pulse = 1.055 + 0.025 * math.sin(index * 0.173)
        vertex.co = center_point + direction * pulse
    animate_shape_key(obj, "core_wake", [(1, 0.0), (32, 0.0), (61, 1.0), (88, 0.42)])


def blade_cross_section(tangent: Vector, width: float, depth: float) -> list[Vector]:
    reference = Vector((0.0, 1.0, 0.0))
    if abs(tangent.dot(reference)) > 0.9:
        reference = Vector((1.0, 0.0, 0.0))
    lateral = tangent.cross(reference).normalized()
    normal = tangent.cross(lateral).normalized()
    coordinates = [
        (1.0, 0.0),
        (0.55, 1.0),
        (-0.55, 1.0),
        (-1.0, 0.0),
        (-0.55, -1.0),
        (0.55, -1.0),
    ]
    return [lateral * width * x + normal * depth * y for x, y in coordinates]


def make_support(
    collection: bpy.types.Collection,
    name: str,
    points: list[tuple[float, float, float]],
    widths: list[float],
    depths: list[float],
    material: bpy.types.Material,
    root: bpy.types.Object,
) -> bpy.types.Object:
    path = [Vector(point) for point in points]
    ring_size = 6
    vertices = []
    for index, point in enumerate(path):
        if index == 0:
            tangent = (path[1] - point).normalized()
        elif index == len(path) - 1:
            tangent = (point - path[index - 1]).normalized()
        else:
            tangent = (path[index + 1] - path[index - 1]).normalized()
        for offset in blade_cross_section(tangent, widths[index], depths[index]):
            vertices.append(tuple(point + offset))

    faces = []
    for ring in range(len(path) - 1):
        start = ring * ring_size
        next_start = (ring + 1) * ring_size
        for side in range(ring_size):
            following = (side + 1) % ring_size
            faces.append((start + side, start + following, next_start + following, next_start + side))
    faces.append(tuple(reversed(range(ring_size))))
    last = (len(path) - 1) * ring_size
    faces.append(tuple(last + index for index in range(ring_size)))

    mesh = bpy.data.meshes.new(f"{name}_High")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.parent = root
    assign_material(obj, material)
    obj["source_role"] = "authored_asymmetric_alloy_support"
    bevel = obj.modifiers.new("Support edge language", "BEVEL")
    bevel.width = 0.016
    bevel.segments = 3
    bevel.limit_method = "ANGLE"
    apply_modifier(obj, bevel)
    shade_smooth(obj)
    return obj


def carve_support_slots(obj: bpy.types.Object) -> None:
    slots = [
        ((0.68, -0.015, -0.53), (0.22, 0.42, 0.052), -0.5),
        ((0.76, -0.005, 0.02), (0.19, 0.44, 0.047), -0.24),
        ((0.67, 0.01, 0.57), (0.23, 0.42, 0.05), 0.42),
    ]
    for index, (location, dimensions, rotation_y) in enumerate(slots, start=1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=(0.0, rotation_y, 0.0))
        cutter = bpy.context.object
        cutter.name = f"RELIC_AUTHOR_Slot_{index}"
        cutter.dimensions = dimensions
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        boolean = obj.modifiers.new(f"Integrated slot {index}", "BOOLEAN")
        boolean.operation = "DIFFERENCE"
        boolean.solver = "EXACT"
        boolean.object = cutter
        apply_modifier(obj, boolean)
        bpy.data.objects.remove(cutter, do_unlink=True)


def make_signal_trace(collection: bpy.types.Collection, material: bpy.types.Material, root: bpy.types.Object) -> bpy.types.Object:
    segments = 44
    path = []
    for index in range(segments + 1):
        t = index / segments
        path.append(Vector((
            -0.76 + 0.39 * t + 0.035 * math.sin(t * 8.0),
            -0.105 + 0.19 * t,
            -0.82 + 1.66 * t,
        )))
    basis = []
    target = []
    faces = []
    for index, point in enumerate(path):
        tangent = (path[min(index + 1, segments)] - path[max(index - 1, 0)]).normalized()
        side = tangent.cross(Vector((0.0, 1.0, 0.0))).normalized() * 0.009
        target.extend([tuple(point - side), tuple(point + side)])
        collapsed_point = path[0] + (point - path[0]) * 0.035
        basis.extend([tuple(collapsed_point - side), tuple(collapsed_point + side)])
    for index in range(segments):
        a = index * 2
        faces.append((a, a + 1, a + 3, a + 2))

    mesh = bpy.data.meshes.new("RELIC_SignalTrace_High")
    mesh.from_pydata(basis, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("RELIC_SignalTrace", mesh)
    collection.objects.link(obj)
    obj.parent = root
    assign_material(obj, material)
    obj["source_role"] = "authored_integrated_signal"
    obj.shape_key_add(name="Basis")
    sweep = obj.shape_key_add(name="signal_sweep")
    for index, coordinate in enumerate(target):
        sweep.data[index].co = coordinate
    animate_shape_key(obj, "signal_sweep", [(1, 0.0), (24, 0.0), (58, 1.0), (84, 0.18)])
    return obj


def animate_shape_key(obj: bpy.types.Object, key_name: str, keys: list[tuple[int, float]]) -> None:
    block = obj.data.shape_keys.key_blocks[key_name]
    for frame, value in keys:
        block.value = value
        block.keyframe_insert(data_path="value", frame=frame, group=key_name)
    action = obj.data.shape_keys.animation_data.action
    action.name = key_name
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "BEZIER"


def append_interface_donors(collection: bpy.types.Collection, material: bpy.types.Material, root: bpy.types.Object) -> list[bpy.types.Object]:
    placements = [
        ("cable_mount", "RELIC_Interface_A", (-0.57, -0.11, 0.98), (3.4, 2.7, 3.4), (1.55, 0.1, -0.62)),
        ("cable_double_mount", "RELIC_Interface_B", (0.58, -0.1, 0.38), (2.7, 2.2, 2.7), (1.28, -0.31, 0.86)),
        ("cable_box_turn", "RELIC_Interface_C", (-0.17, 0.2, -0.82), (0.62, 0.62, 0.62), (0.35, 1.1, -0.8)),
    ]
    donors = []
    for source_name, name, location, scale, rotation in placements:
        obj = append_object(INTERFACE_SOURCE, source_name, collection)
        obj.name = name
        obj.data.name = f"{name}_Edited"
        obj.location = location
        obj.scale = scale
        obj.rotation_euler = rotation
        obj.parent = root
        assign_material(obj, material)
        obj["source_asset"] = "polyhaven:modular_electric_cables"
        obj["source_role"] = "interface_topology_donor"
        shade_smooth(obj)
        donors.append(obj)
    return donors


def build() -> None:
    require_sources()
    reset_scene()
    collection = bpy.data.collections["RELIC_EXPORT"]

    root = bpy.data.objects.new("RELIC_ROOT", None)
    collection.objects.link(root)
    root["asset_id"] = "relic-01"
    root["asset_version"] = 1
    root["license_record"] = "projects/relic-01/assets/ATTRIBUTIONS.md"

    bone = material_principled("MAT_RELIC_Bone", (0.16, 0.145, 0.12, 1.0), 0.0, 0.58, subsurface=0.025)
    add_surface_variation(bone, ((0.018, 0.022, 0.021, 1.0), (0.24, 0.2, 0.155, 1.0)), 12.0)
    alloy = material_principled("MAT_RELIC_OxidizedAlloy", (0.045, 0.062, 0.067, 1.0), 0.93, 0.27)
    add_surface_variation(alloy, ((0.018, 0.026, 0.03, 1.0), (0.08, 0.18, 0.18, 1.0)), 18.0)
    membrane = material_principled("MAT_RELIC_Membrane", (0.025, 0.085, 0.11, 0.3), 0.0, 0.5, alpha=0.3, transmission=0.1)
    enable_cycles_transparency(membrane, 0.32)
    fibre = material_principled("MAT_RELIC_Fibre", (0.08, 0.018, 0.024, 1.0), 0.18, 0.4, (0.24, 0.008, 0.012, 1.0), 0.18)
    core_material = material_principled("MAT_RELIC_Core", (0.024, 0.001, 0.003, 1.0), 0.08, 0.4, (0.16, 0.001, 0.003, 1.0), 0.1, subsurface=0.02)
    signal = material_principled("MAT_RELIC_Signal", (0.18, 0.5, 0.015, 1.0), 0.15, 0.24, (0.46, 1.0, 0.04, 1.0), 7.0)
    attach_pbr_textures(bone, "bone")
    attach_pbr_textures(alloy, "alloy")
    attach_pbr_textures(core_material, "core")
    attach_pbr_textures(membrane, "membrane")

    shell = append_object(SHELL_SOURCE, "lambis_shell", collection)
    shell.parent = root
    deform_shell(shell)
    assign_material(shell, bone)

    tension_membrane = make_membrane(collection, membrane, root)
    fibres = make_ribbons(collection, fibre, root)

    core = append_object(EROSION_SOURCE, "dead_quiver_branch_01", collection)
    core.parent = root
    compact_erosion_core(core)
    assign_material(core, core_material)

    support_specs = [
        (
            "RELIC_AlloySupport_A",
            [(-0.52, 0.05, -1.13), (-0.85, 0.02, -0.64), (-0.97, -0.01, -0.08), (-0.82, -0.03, 0.54), (-0.52, -0.04, 1.13)],
            [0.07, 0.11, 0.15, 0.11, 0.045],
            [0.038, 0.048, 0.058, 0.047, 0.023],
        ),
        (
            "RELIC_AlloySupport_B",
            [(0.45, -0.08, -1.2), (0.7, -0.05, -0.66), (0.82, -0.02, -0.04), (0.75, 0.0, 0.61), (0.52, 0.01, 1.29)],
            [0.21, 0.29, 0.34, 0.29, 0.15],
            [0.08, 0.105, 0.12, 0.105, 0.062],
        ),
        (
            "RELIC_AlloySupport_C",
            [(-0.19, 0.31, -1.04), (0.08, 0.39, -0.53), (0.31, 0.35, 0.04), (0.14, 0.28, 0.58), (0.4, 0.19, 1.03)],
            [0.09, 0.12, 0.15, 0.12, 0.065],
            [0.045, 0.055, 0.064, 0.055, 0.031],
        ),
    ]
    supports = [make_support(collection, name, points, widths, depths, alloy, root) for name, points, widths, depths in support_specs]
    carve_support_slots(supports[1])
    interfaces = append_interface_donors(collection, alloy, root)
    trace = make_signal_trace(collection, signal, root)

    fixed_triangles = sum(
        triangle_count(obj)
        for obj in collection.objects
        if obj.type == "MESH" and obj != shell
    )
    shell_current = triangle_count(shell)
    shell_target = max(82_000, TARGET_HIGH_TRIANGLES - fixed_triangles)
    if shell_current > shell_target:
        decimate = shell.modifiers.new("Authored shell retopology", "DECIMATE")
        decimate.decimate_type = "COLLAPSE"
        decimate.ratio = shell_target / shell_current
        decimate.use_collapse_triangulate = True
        apply_modifier(shell, decimate)

    root.rotation_mode = "XYZ"
    root.rotation_euler = (0.0, 0.0, 0.0)
    root.keyframe_insert(data_path="rotation_euler", index=2, frame=1)
    root.rotation_euler.z = math.tau
    root.keyframe_insert(data_path="rotation_euler", index=2, frame=241)
    action = root.animation_data.action
    action.name = "turntable_idle"
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "LINEAR"

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 241
    bpy.context.scene.render.fps = 30
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.context.scene["asset_id"] = "relic-01"
    bpy.context.scene["source_record"] = "docs/assets/relic-01-source-record.md"
    bpy.context.scene["required_animations"] = "membrane_tension,fibre_reveal,core_wake,signal_sweep,turntable_idle"
    bpy.context.scene.frame_set(1)

    for obj in collection.objects:
        smart_project_uv(obj)

    for obj in (shell, tension_membrane, fibres, core, trace, *supports, *interfaces):
        obj.hide_render = False
        obj.hide_viewport = False

    bpy.ops.object.select_all(action="DESELECT")
    shell.select_set(True)
    bpy.context.view_layer.objects.active = shell

    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for material in list(bpy.data.materials):
        if material.users == 0:
            bpy.data.materials.remove(material)
    for texture in list(bpy.data.textures):
        if texture.users == 0:
            bpy.data.textures.remove(texture)
    for image in list(bpy.data.images):
        if image.users == 0 and image.type != "RENDER_RESULT":
            bpy.data.images.remove(image)

    OUTPUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND), compress=True)

    mesh_objects = [obj for obj in collection.objects if obj.type == "MESH"]
    print("RELIC_AUTHOR_OUTPUT", OUTPUT_BLEND)
    print("RELIC_AUTHOR_TRIANGLES", sum(triangle_count(obj) for obj in mesh_objects))
    print("RELIC_AUTHOR_BREAKDOWN", sorted((obj.name, triangle_count(obj)) for obj in mesh_objects))
    print("RELIC_AUTHOR_SHAPES", sorted(
        key.name
        for obj in mesh_objects
        if obj.data.shape_keys
        for key in obj.data.shape_keys.key_blocks
        if key.name != "Basis"
    ))


if __name__ == "__main__":
    build()
