export type { GlobeBodyId, GlobeMaps } from './bodies';
export {
  GLOBE_BODY_IDS,
  GLOBE_BODY_LABELS,
  GLOBE_MAPS,
  resolveGlobeConfig,
} from './bodies';
export { HOME_CAROUSEL_LOOK } from './carousel-look';
export {
  resolveCarouselResolution,
  /** @deprecated Prefer `resolveCarouselResolution()`. */
  resolveCarouselResolution as HOME_CAROUSEL_RESOLUTION,
} from '@/shared/lib/perf/device-tier';
export type { GlobeConfig } from './config';
export {
  GLOBE_BLOOM_DPR,
  GLOBE_DEFAULTS,
  GLOBE_TRANSITION_DPR,
} from './config';
export type { GlobeProps } from './globe';
export { Globe } from './globe';
export type { GlobeCanvasProps } from './globe-canvas';
export { GLOBE_FILL_CAMERA, GlobeCanvas } from './globe-canvas';
export type {
  GlobeCarouselCanvasProps,
  PlanetHoverPayload,
} from './globe-carousel-canvas';
export { GlobeCarouselCanvas } from './globe-carousel-canvas';
export { lerpGlobeConfig } from './lib/lerp-globe-config';
export type { PlanetScreenPose } from './lib/screen-pose';
export { projectedRadius } from './lib/screen-pose';
