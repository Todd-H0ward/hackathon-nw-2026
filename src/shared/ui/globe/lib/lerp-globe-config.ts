import { MathUtils } from 'three';

import type { GlobeConfig } from '../config';

const lerpNum = (a: number, b: number, t: number) => MathUtils.lerp(a, b, t);

/** Blend two globe looks. RESOLUTION stays on `from` (changing it remounts the sim). */
export const lerpGlobeConfig = (
  from: GlobeConfig,
  to: GlobeConfig,
  t: number,
): GlobeConfig => {
  const k = MathUtils.clamp(t, 0, 1);
  return {
    ...to,
    RESOLUTION: from.RESOLUTION,
    RADIUS: lerpNum(from.RADIUS, to.RADIUS, k),
    POINT_SIZE: lerpNum(from.POINT_SIZE, to.POINT_SIZE, k),
    SCREEN_SCALE: lerpNum(from.SCREEN_SCALE, to.SCREEN_SCALE, k),
    STRENGTH_POW: lerpNum(from.STRENGTH_POW, to.STRENGTH_POW, k),
    DEPTH_MIN: lerpNum(from.DEPTH_MIN, to.DEPTH_MIN, k),
    DEPTH_MAX: lerpNum(from.DEPTH_MAX, to.DEPTH_MAX, k),
    DEPTH_RADIUS: lerpNum(from.DEPTH_RADIUS, to.DEPTH_RADIUS, k),
    TINT: k < 0.5 ? from.TINT : to.TINT,
    ENV_FILL: lerpNum(from.ENV_FILL, to.ENV_FILL, k),
    PARTICLE_BRIGHTNESS: lerpNum(
      from.PARTICLE_BRIGHTNESS,
      to.PARTICLE_BRIGHTNESS,
      k,
    ),
    SPIN: lerpNum(from.SPIN, to.SPIN, k),
    JITTER: lerpNum(from.JITTER, to.JITTER, k),
    HAZE_OPACITY: lerpNum(from.HAZE_OPACITY, to.HAZE_OPACITY, k),
    HAZE_POW: lerpNum(from.HAZE_POW, to.HAZE_POW, k),
    HAZE_MUL: lerpNum(from.HAZE_MUL, to.HAZE_MUL, k),
    HAZE_COLOR: k < 0.5 ? from.HAZE_COLOR : to.HAZE_COLOR,
    HAZE_DOT_DIV: lerpNum(from.HAZE_DOT_DIV, to.HAZE_DOT_DIV, k),
    HAZE_COLOR_SCALE: lerpNum(from.HAZE_COLOR_SCALE, to.HAZE_COLOR_SCALE, k),
    HAZE_RADIUS: lerpNum(from.HAZE_RADIUS, to.HAZE_RADIUS, k),
    BLOOM_INTENSITY: lerpNum(from.BLOOM_INTENSITY, to.BLOOM_INTENSITY, k),
    BLOOM_THRESHOLD: lerpNum(from.BLOOM_THRESHOLD, to.BLOOM_THRESHOLD, k),
    BLOOM_SMOOTHING: lerpNum(from.BLOOM_SMOOTHING, to.BLOOM_SMOOTHING, k),
    BLOOM_RADIUS: lerpNum(from.BLOOM_RADIUS, to.BLOOM_RADIUS, k),
  };
};
