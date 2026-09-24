import argparse
import json
import sys
from pathlib import Path

import bpy


WORLD_CONTRACTS = {
    "signal-chrysalis": ("SIGNAL_CHRYSALIS_ROOT", ["shell_compress", "plate_split", "nerve_sweep", "scar_idle"]),
    "triune-gate": ("TRIUNE_GATE_ROOT", ["left_strike", "center_strike", "right_strike", "gate_lock", "cable_tension"]),
    "null-cathedral": ("NULL_CATHEDRAL_ROOT", ["shell_reveal", "void_cross", "scale_reveal", "relic_idle"]),
    "packet-bloom": ("PACKET_BLOOM_ROOT", ["lattice_bend", "cluster_break", "cluster_rebuild", "packet_idle"]),
}


def script_args():
    parser = argparse.ArgumentParser(description="Create a non-visible PULSE world authoring structure.")
    parser.add_argument("--world", choices=WORLD_CONTRACTS, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return parser.parse_args(args)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)


def ensure_collection(name, parent):
    collection = bpy.data.collections.new(name)
    parent.children.link(collection)
    return collection


def build_authoring_structure(world_id):
    root_name, controls = WORLD_CONTRACTS[world_id]
    reset_scene()
    scene_collection = bpy.context.scene.collection
    world_collection = ensure_collection(f"{root_name}_AUTHORING", scene_collection)
    for name in ("FORM", "SIGNAL", "RIG", "LIGHT_GUIDES", "EXPORT"):
        ensure_collection(name, world_collection)

    root = bpy.data.objects.new(root_name, None)
    world_collection.objects.link(root)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = 0.45
    root["pulse_world_id"] = world_id
    root["required_controls"] = json.dumps(controls)
    root["authoring_rule"] = "No visible proxy primitives: author and review the silhouette before export."
    return root


def main():
    args = script_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    build_authoring_structure(args.world)
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()))
    print(f"Created PULSE authoring structure: {args.world} -> {args.output}")


if __name__ == "__main__":
    main()
