export const BLACKSITE_ENCOUNTERS = Object.freeze([
  Object.freeze({
    id: "gantry-contact",
    zoneId: "storm-approach",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "rifleman", count: 2, routeId: "gantry-center" }),
      Object.freeze({ archetype: "breacher", count: 1, routeId: "gantry-crane-shortcut" }),
    ]),
  }),
  Object.freeze({
    id: "breach-crossfire",
    zoneId: "red-breach",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "rifleman", count: 2, routeId: "breach-generator-floor" }),
      Object.freeze({ archetype: "rifleman", count: 2, routeId: "breach-maintenance-loop" }),
    ]),
  }),
  Object.freeze({
    id: "auxiliary-defense",
    zoneId: "red-breach",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "breacher", count: 2, routeId: "breach-live-bus" }),
      Object.freeze({ archetype: "rifleman", count: 1, routeId: "breach-generator-floor" }),
    ]),
  }),
  Object.freeze({
    id: "turbine-awakening",
    zoneId: "reactor-white",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "rifleman", count: 3, routeId: "reactor-upper-catwalk" }),
      Object.freeze({ archetype: "breacher", count: 1, routeId: "reactor-steam-duct" }),
    ]),
  }),
  Object.freeze({
    id: "reactor-lock",
    zoneId: "reactor-white",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "heavy", count: 1, routeId: "reactor-turbine-floor" }),
      Object.freeze({ archetype: "rifleman", count: 2, routeId: "reactor-upper-catwalk" }),
    ]),
  }),
  Object.freeze({
    id: "extraction-hold",
    zoneId: "dawn-extraction",
    repeat: false,
    groups: Object.freeze([
      Object.freeze({ archetype: "rifleman", count: 2, routeId: "extraction-container-lane" }),
      Object.freeze({ archetype: "breacher", count: 2, routeId: "extraction-open-deck" }),
      Object.freeze({ archetype: "heavy", count: 1, routeId: "extraction-control-walkway" }),
    ]),
  }),
]);
