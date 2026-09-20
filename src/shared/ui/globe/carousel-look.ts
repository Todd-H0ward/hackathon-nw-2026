import type { GlobeBodyId } from './bodies';
import type { GlobeConfig } from './config';

/**
 * Home carousel / ferry look: soft motion + haze so entry doesn't pop from
 * a jittering planet to a frozen static cloud mid-handoff.
 */
export const HOME_CAROUSEL_LOOK: Record<GlobeBodyId, Partial<GlobeConfig>> = {
  earth: {
    HAZE_OPACITY: 0.065,
    HAZE_MUL: 4.5,
    BLOOM_INTENSITY: 0.72,
    BLOOM_THRESHOLD: 0.24,
    SPIN: 0.0001,
    JITTER: 0.014,
  },
  mars: {
    HAZE_OPACITY: 0.04,
    HAZE_MUL: 3.4,
    BLOOM_INTENSITY: 0.55,
    BLOOM_THRESHOLD: 0.26,
    SPIN: 0.00008,
    JITTER: 0.014,
  },
  venus: {
    HAZE_OPACITY: 0.11,
    HAZE_MUL: 5.8,
    BLOOM_INTENSITY: 0.85,
    BLOOM_THRESHOLD: 0.22,
    SPIN: 0.00004,
    JITTER: 0.014,
  },
};

/** Match carousel density so ferry GPGPU stays cheap during dual-canvas handoff. */
export const HOME_CAROUSEL_RESOLUTION = 280;
