const KEY = 'xenochoice.viewport.particleBrightness';

export const PARTICLE_BRIGHTNESS_MIN = 20;
export const PARTICLE_BRIGHTNESS_MAX = 200;
export const PARTICLE_BRIGHTNESS_DEFAULT = 100;

const clampPercent = (value: number) =>
  Math.min(
    PARTICLE_BRIGHTNESS_MAX,
    Math.max(PARTICLE_BRIGHTNESS_MIN, Math.round(value)),
  );

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

export const writeParticleBrightnessPercent = (percent: number): void => {
  try {
    localStorage.setItem(KEY, String(clampPercent(percent)));
  } catch {
    // Private mode / quota — ignore.
  }
};

export const percentToBrightness = (percent: number): number =>
  clampPercent(percent) / 100;
