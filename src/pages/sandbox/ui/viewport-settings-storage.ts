/** Viewport settings persistence (localStorage): globe particle brightness. */

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const KEY = 'xenochoice.viewport.particleBrightness';

export const PARTICLE_BRIGHTNESS_MIN = 20;
export const PARTICLE_BRIGHTNESS_MAX = 200;
export const PARTICLE_BRIGHTNESS_DEFAULT = 100;

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

/** Clamps brightness percentage to the valid range. */
const clampPercent = (value: number) =>
  Math.min(
    PARTICLE_BRIGHTNESS_MAX,
    Math.max(PARTICLE_BRIGHTNESS_MIN, Math.round(value)),
  );

/** Reads saved particle brightness or returns the default. */
export const readParticleBrightnessPercent = (): number => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return PARTICLE_BRIGHTNESS_DEFAULT;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return PARTICLE_BRIGHTNESS_DEFAULT;
    return clampPercent(parsed);
  } catch {
    return PARTICLE_BRIGHTNESS_DEFAULT;
  }
};

/** Saves particle brightness to localStorage. */
export const writeParticleBrightnessPercent = (percent: number): void => {
  try {
    localStorage.setItem(KEY, String(clampPercent(percent)));
  } catch {
    // Private mode / quota — ignore.
  }
};

/** Converts brightness percentage to a render multiplier (0.2–2.0). */
export const percentToBrightness = (percent: number): number =>
  clampPercent(percent) / 100;
