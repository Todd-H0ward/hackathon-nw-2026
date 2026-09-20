/** Planet ids, textures, and per-body look presets. */

import { GLOBE_DEFAULTS, type GlobeConfig } from './config';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export const GLOBE_BODY_IDS = ['earth', 'mars', 'venus'] as const;

export type GlobeBodyId = (typeof GLOBE_BODY_IDS)[number];

export type GlobeMaps = {
  color: string;
};

type BodyLook = Pick<
  GlobeConfig,
  | 'TINT'
  | 'HAZE_COLOR'
  | 'HAZE_OPACITY'
  | 'HAZE_POW'
  | 'HAZE_MUL'
  | 'HAZE_DOT_DIV'
  | 'HAZE_COLOR_SCALE'
  | 'HAZE_RADIUS'
  | 'BLOOM_INTENSITY'
  | 'BLOOM_THRESHOLD'
  | 'BLOOM_SMOOTHING'
  | 'BLOOM_RADIUS'
  | 'SPIN'
>;

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

export const GLOBE_BODY_LABELS: Record<GlobeBodyId, string> = {
  earth: 'Earth',
  mars: 'Mars',
  venus: 'Venus',
};

const ASSET = '/images/globe';

export const GLOBE_MAPS: Record<GlobeBodyId, GlobeMaps> = {
  earth: { color: `${ASSET}/earth_color.jpg` },
  mars: { color: `${ASSET}/mars_color.jpg` },
  venus: { color: `${ASSET}/venus_color.jpg` },
};

const LOOK: Record<GlobeBodyId, BodyLook> = {
  earth: {
    TINT: '#f2f2f2',
    HAZE_COLOR: '#6a8aaa',
    HAZE_OPACITY: 0.021,
    HAZE_POW: GLOBE_DEFAULTS.HAZE_POW,
    HAZE_MUL: 1.56,
    HAZE_DOT_DIV: GLOBE_DEFAULTS.HAZE_DOT_DIV,
    HAZE_COLOR_SCALE: GLOBE_DEFAULTS.HAZE_COLOR_SCALE,
    HAZE_RADIUS: GLOBE_DEFAULTS.HAZE_RADIUS,
    BLOOM_INTENSITY: 0.22,
    BLOOM_THRESHOLD: 0.22,
    BLOOM_SMOOTHING: GLOBE_DEFAULTS.BLOOM_SMOOTHING,
    BLOOM_RADIUS: GLOBE_DEFAULTS.BLOOM_RADIUS,
    SPIN: 0,
  },
  mars: {
    TINT: '#ffffff',
    HAZE_COLOR: '#e89a6a',
    HAZE_OPACITY: 0.012,
    HAZE_POW: 5.2,
    HAZE_MUL: 1.13,
    HAZE_DOT_DIV: 6.5,
    HAZE_COLOR_SCALE: 1.15,
    HAZE_RADIUS: 1.12,
    BLOOM_INTENSITY: 0.17,
    BLOOM_THRESHOLD: 0.24,
    BLOOM_SMOOTHING: 0.5,
    BLOOM_RADIUS: 0.55,
    SPIN: 0,
  },
  venus: {
    TINT: '#ffffff',
    HAZE_COLOR: '#f0d48a',
    HAZE_OPACITY: 0.026,
    HAZE_POW: 2.8,
    HAZE_MUL: 1.45,
    HAZE_DOT_DIV: 5.5,
    HAZE_COLOR_SCALE: 1.3,
    HAZE_RADIUS: 1.32,
    BLOOM_INTENSITY: 0.2,
    BLOOM_THRESHOLD: 0.2,
    BLOOM_SMOOTHING: 0.65,
    BLOOM_RADIUS: 0.75,
    SPIN: 0,
  },
};

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Merge GLOBE_DEFAULTS + per-body look + patch into final GlobeConfig. */
export const resolveGlobeConfig = (
  body: GlobeBodyId,
  patch: Partial<GlobeConfig> = {},
): GlobeConfig => ({
  ...GLOBE_DEFAULTS,
  ...LOOK[body],
  ...patch,
});
