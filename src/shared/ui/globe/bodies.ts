import { GLOBE_DEFAULTS, type GlobeConfig } from './config';

export const GLOBE_BODY_IDS = ['earth', 'mars', 'venus'] as const;

export type GlobeBodyId = (typeof GLOBE_BODY_IDS)[number];

export const GLOBE_BODY_LABELS: Record<GlobeBodyId, string> = {
  earth: 'Earth',
  mars: 'Mars',
  venus: 'Venus',
};

export type GlobeMaps = {
  color: string;
};

const ASSET = '/images/globe';

export const GLOBE_MAPS: Record<GlobeBodyId, GlobeMaps> = {
  earth: { color: `${ASSET}/earth_color.jpg` },
  mars: { color: `${ASSET}/mars_color.jpg` },
  venus: { color: `${ASSET}/venus_color.jpg` },
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

const LOOK: Record<GlobeBodyId, BodyLook> = {
  earth: {
    TINT: '#f2f2f2',
    HAZE_COLOR: '#6a8aaa',
    HAZE_OPACITY: GLOBE_DEFAULTS.HAZE_OPACITY,
    HAZE_POW: GLOBE_DEFAULTS.HAZE_POW,
    HAZE_MUL: GLOBE_DEFAULTS.HAZE_MUL,
    HAZE_DOT_DIV: GLOBE_DEFAULTS.HAZE_DOT_DIV,
    HAZE_COLOR_SCALE: GLOBE_DEFAULTS.HAZE_COLOR_SCALE,
    HAZE_RADIUS: GLOBE_DEFAULTS.HAZE_RADIUS,
    BLOOM_INTENSITY: GLOBE_DEFAULTS.BLOOM_INTENSITY,
    BLOOM_THRESHOLD: GLOBE_DEFAULTS.BLOOM_THRESHOLD,
    BLOOM_SMOOTHING: GLOBE_DEFAULTS.BLOOM_SMOOTHING,
    BLOOM_RADIUS: GLOBE_DEFAULTS.BLOOM_RADIUS,
    SPIN: 0.0001,
  },
  mars: {
    TINT: '#ffffff',
    HAZE_COLOR: '#e89a6a',
    HAZE_OPACITY: 0.08,
    HAZE_POW: 5.2,
    HAZE_MUL: 7.5,
    HAZE_DOT_DIV: 6.5,
    HAZE_COLOR_SCALE: 1.15,
    HAZE_RADIUS: 1.12,
    BLOOM_INTENSITY: 1.35,
    BLOOM_THRESHOLD: 0.05,
    BLOOM_SMOOTHING: 0.5,
    BLOOM_RADIUS: 0.55,
    SPIN: 0.00008,
  },
  venus: {
    TINT: '#ffffff',
    HAZE_COLOR: '#f0d48a',
    HAZE_OPACITY: 0.28,
    HAZE_POW: 2.8,
    HAZE_MUL: 14,
    HAZE_DOT_DIV: 5.5,
    HAZE_COLOR_SCALE: 1.8,
    HAZE_RADIUS: 1.32,
    BLOOM_INTENSITY: 2.2,
    BLOOM_THRESHOLD: 0,
    BLOOM_SMOOTHING: 0.65,
    BLOOM_RADIUS: 0.75,
    SPIN: 0.00004,
  },
};

export const resolveGlobeConfig = (
  body: GlobeBodyId,
  patch: Partial<GlobeConfig> = {},
): GlobeConfig => ({
  ...GLOBE_DEFAULTS,
  ...LOOK[body],
  ...patch,
});
