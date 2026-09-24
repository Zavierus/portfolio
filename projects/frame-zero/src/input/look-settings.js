import { LOOK_LEVELS, resolveLookSensitivity } from "./look-controller.js";

export const LOOK_SETTING_KEY = "frame-zero.look-level";

export function createLookSettings({
  storage = globalThis.localStorage,
  key = LOOK_SETTING_KEY,
  fallback = "medium",
} = {}) {
  resolveLookSensitivity(fallback);
  let current = fallback;

  return {
    load() {
      try {
        const stored = storage?.getItem?.(key);
        current = stored && Object.hasOwn(LOOK_LEVELS, stored) ? stored : current;
      } catch {
        // Storage can be unavailable in privacy modes; retain the in-memory choice.
      }
      return current;
    },
    save(level) {
      resolveLookSensitivity(level);
      current = level;
      try {
        storage?.setItem?.(key, level);
      } catch {
        // The current session still uses the selected level.
      }
      return current;
    },
    value() {
      return current;
    },
  };
}
