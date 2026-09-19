export type GlobeConfig = {
  RESOLUTION: number;
  RADIUS: number;
  POINT_SIZE: number;
  SCREEN_SCALE: number;
  STRENGTH_POW: number;
  DEPTH_MIN: number;
  DEPTH_MAX: number;
  DEPTH_RADIUS: number;
  TINT: string;
  ENV_FILL: number;
  SPIN: number;
  JITTER: number;
  HAZE_OPACITY: number;
  HAZE_POW: number;
  HAZE_MUL: number;
  HAZE_COLOR: string;
  HAZE_DOT_DIV: number;
  HAZE_COLOR_SCALE: number;
  HAZE_RADIUS: number;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  BLOOM_SMOOTHING: number;
  BLOOM_RADIUS: number;
};

export const GLOBE_DEFAULTS: GlobeConfig = {
  RESOLUTION: 400,
  RADIUS: 2.3,
  POINT_SIZE: 11,
  SCREEN_SCALE: 1,
  STRENGTH_POW: 7,
  DEPTH_MIN: 0.3,
  DEPTH_MAX: 1,
  DEPTH_RADIUS: 1.15,
  TINT: '#f2f2f2',
  ENV_FILL: 0.35,
  SPIN: 0.0001,
  JITTER: 0.014,
  HAZE_OPACITY: 0.14,
  HAZE_POW: 4.1,
  HAZE_MUL: 10.5,
  HAZE_COLOR: '#6a8aaa',
  HAZE_DOT_DIV: 8.1,
  HAZE_COLOR_SCALE: 1.5,
  HAZE_RADIUS: 1.2,
  BLOOM_INTENSITY: 1.75,
  BLOOM_THRESHOLD: 0,
  BLOOM_SMOOTHING: 0.55,
  BLOOM_RADIUS: 0.68,
};
