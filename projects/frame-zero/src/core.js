export const WAVE_LAYOUT = [
  [[-4.7, -6.5], [0.2, -10.2], [4.5, -5.4]],
  [[-6.7, -28.5], [6.2, -38.5]],
  [[-5.5, -68], [5.8, -80.5]],
  [[-5.2, -101.5], [0.4, -113], [5.2, -101.5]],
];

export const WAVE_POWER_STATES = Object.freeze([
  Object.freeze(["external-link"]),
  Object.freeze(["external-link", "auxiliary-a"]),
  Object.freeze(["external-link", "auxiliary-a", "auxiliary-b"]),
  Object.freeze(["external-link", "auxiliary-a", "auxiliary-b", "reactor", "extraction"]),
]);

export const PROJECTILE_BOUNDS = Object.freeze({
  minX: -16,
  maxX: 16,
  minZ: -132,
  maxZ: 16,
});

export { createTaskScheduler } from "./core/task-scheduler.js";

export function circleIntersectsAabb(position, radius, obstacle) {
  if (obstacle.active === false) return false;
  const nearestX = Math.max(obstacle.minX, Math.min(position.x, obstacle.maxX));
  const nearestZ = Math.max(obstacle.minZ, Math.min(position.z, obstacle.maxZ));
  const deltaX = position.x - nearestX;
  const deltaZ = position.z - nearestZ;
  return deltaX * deltaX + deltaZ * deltaZ < radius * radius;
}

export function resolvePlayerMovement(position, delta, radius, obstacles) {
  const resolved = { x: position.x, z: position.z };
  const nextX = { x: position.x + delta.x, z: position.z };
  if (!obstacles.some((obstacle) => circleIntersectsAabb(nextX, radius, obstacle))) {
    resolved.x = nextX.x;
  }

  const nextZ = { x: resolved.x, z: position.z + delta.z };
  if (!obstacles.some((obstacle) => circleIntersectsAabb(nextZ, radius, obstacle))) {
    resolved.z = nextZ.z;
  }
  return resolved;
}

export function segmentIntersectsAabb(start, end, obstacle) {
  if (obstacle.active === false) return false;
  const deltaX = end.x - start.x;
  const deltaZ = end.z - start.z;
  let near = 0;
  let far = 1;

  for (const [origin, delta, minimum, maximum] of [
    [start.x, deltaX, obstacle.minX, obstacle.maxX],
    [start.z, deltaZ, obstacle.minZ, obstacle.maxZ],
  ]) {
    if (Math.abs(delta) < 1e-8) {
      if (origin < minimum || origin > maximum) return false;
      continue;
    }
    const inverse = 1 / delta;
    let axisNear = (minimum - origin) * inverse;
    let axisFar = (maximum - origin) * inverse;
    if (axisNear > axisFar) [axisNear, axisFar] = [axisFar, axisNear];
    near = Math.max(near, axisNear);
    far = Math.min(far, axisFar);
    if (near > far) return false;
  }
  return far >= 0 && near <= 1;
}

export function isProjectileOutOfBounds(position, bounds = PROJECTILE_BOUNDS) {
  return position.x < bounds.minX || position.x > bounds.maxX || position.z < bounds.minZ || position.z > bounds.maxZ;
}
