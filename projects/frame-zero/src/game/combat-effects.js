export const DEATH_FRAGMENT_INDICES = Object.freeze([0, 1, 2, 8]);
export const MAX_COMBAT_FRAGMENTS = 24;

export function isDeathFragmentIndex(index) {
  return DEATH_FRAGMENT_INDICES.includes(index);
}
