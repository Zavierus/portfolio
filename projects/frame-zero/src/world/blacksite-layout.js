export const BLACKSITE_ZONES = Object.freeze([
  Object.freeze({
    id: "storm-approach",
    label: "外部运输栈桥",
    bounds: Object.freeze({ minX: -13, maxX: 13, minZ: -18, maxZ: 18 }),
    entry: Object.freeze({ x: 0, y: 1.7, z: 14 }),
    exit: Object.freeze({ x: 0, y: 1.7, z: -16 }),
    interactionId: "gantry-crane-release",
    routes: Object.freeze([
      Object.freeze({ id: "gantry-center", risk: "medium", reachesExit: true }),
      Object.freeze({ id: "gantry-service", risk: "low", reachesExit: true }),
      Object.freeze({ id: "gantry-crane-shortcut", risk: "high", reachesExit: true }),
    ]),
  }),
  Object.freeze({
    id: "red-breach",
    label: "应急供电区",
    bounds: Object.freeze({ minX: -15, maxX: 15, minZ: -52, maxZ: -18 }),
    entry: Object.freeze({ x: 0, y: 1.7, z: -20 }),
    exit: Object.freeze({ x: 0, y: 1.7, z: -50 }),
    interactionId: "auxiliary-breaker-bank",
    routes: Object.freeze([
      Object.freeze({ id: "breach-generator-floor", risk: "medium", reachesExit: true }),
      Object.freeze({ id: "breach-maintenance-loop", risk: "low", reachesExit: true }),
      Object.freeze({ id: "breach-live-bus", risk: "high", reachesExit: true }),
    ]),
  }),
  Object.freeze({
    id: "reactor-white",
    label: "涡轮大厅",
    bounds: Object.freeze({ minX: -21, maxX: 21, minZ: -92, maxZ: -52 }),
    entry: Object.freeze({ x: 0, y: 1.7, z: -54 }),
    exit: Object.freeze({ x: 0, y: 1.7, z: -90 }),
    interactionId: "reactor-lock-console",
    routes: Object.freeze([
      Object.freeze({ id: "reactor-turbine-floor", risk: "medium", reachesExit: true }),
      Object.freeze({ id: "reactor-upper-catwalk", risk: "low", reachesExit: true }),
      Object.freeze({ id: "reactor-steam-duct", risk: "high", reachesExit: true }),
    ]),
  }),
  Object.freeze({
    id: "dawn-extraction",
    label: "货运撤离平台",
    bounds: Object.freeze({ minX: -18, maxX: 18, minZ: -126, maxZ: -92 }),
    entry: Object.freeze({ x: 0, y: 1.7, z: -94 }),
    exit: Object.freeze({ x: 0, y: 1.7, z: -124 }),
    interactionId: "freight-platform-release",
    routes: Object.freeze([
      Object.freeze({ id: "extraction-container-lane", risk: "medium", reachesExit: true }),
      Object.freeze({ id: "extraction-control-walkway", risk: "low", reachesExit: true }),
      Object.freeze({ id: "extraction-open-deck", risk: "high", reachesExit: true }),
    ]),
  }),
]);

