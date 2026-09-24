# PULSE ROOM Asset Attributions

Runtime status: all four authored PULSE worlds are published as local high and low GLBs.

## Authored worlds

- Design, modeling, materials, animation, LODs, and runtime integration: Ziaver / Wang Zeyuan
- License: custom permissive portfolio use
- Source records: `assets/source/pulse-room/worlds/*.source.json`
- Published runtime: local high and low Meshopt/KTX2 GLBs under `assets/runtime/pulse-room/models/`

### SIGNAL CHRYSALIS

- Source: `assets/source/pulse-room/blender/signal-chrysalis.blend`
- High LOD: 99,592 triangles, 964,504 bytes
- Low LOD: 29,296 triangles, 359,476 bytes
- Materials: authored 1K titanium and violet-polymer PBR maps, chartreuse emissive nerve
- Required controls: `shell_compress`, `plate_split`, `nerve_sweep`, `scar_idle`

### TRIUNE GATE

- Source: `assets/source/pulse-room/blender/triune-gate.blend`
- High LOD: 81,768 triangles, 2,106,600 bytes
- Low LOD: 27,452 triangles, 764,896 bytes
- Materials: local titanium, violet ceramic, bone alloy, black cable, and red emissive lock signal
- Required controls: `left_strike`, `center_strike`, `right_strike`, `gate_lock`, `cable_tension`

### NULL CATHEDRAL

- Source: `assets/source/pulse-room/blender/null-cathedral.blend`
- High LOD: 106,464 triangles, 1,172,344 bytes
- Low LOD: 28,736 triangles, 587,216 bytes
- Materials: authored pale alloy, violet/cyan transmissive shells, cyan scale lights, and a sparse crossing veil
- Required controls: `shell_reveal`, `void_cross`, `scale_reveal`, `relic_idle`

### PACKET BLOOM

- Source: `assets/source/pulse-room/blender/packet-bloom.blend`
- High LOD: 86,084 triangles, 1,196,368 bytes
- Low LOD: 26,668 triangles, 511,400 bytes
- Materials: authored dark titanium lattice, pale braces, cyan/vermilion packet clusters, and chartreuse signal fibres
- Required controls: `lattice_bend`, `cluster_break`, `cluster_rebuild`, `packet_idle`

The four forms are original: SIGNAL CHRYSALIS, TRIUNE GATE, NULL CATHEDRAL, and PACKET BLOOM. Any external donor geometry or material introduced during production must be listed here with creator, source URL, license, modifications, and the exact world that uses it before publication.
