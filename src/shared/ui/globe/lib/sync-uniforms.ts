import type { Color, ShaderMaterial } from 'three';

import type { GlobeConfig } from '@/shared/ui/globe/config';

export const syncHazeUniforms = (
  material: ShaderMaterial,
  cfg: GlobeConfig,
) => {
  const u = material.uniforms;
  u.atmOpacity.value = cfg.HAZE_OPACITY;
  u.atmPowFactor.value = cfg.HAZE_POW;
  u.atmMultiplier.value = cfg.HAZE_MUL;
  (u.atmosphereColor.value as Color).set(cfg.HAZE_COLOR);
  u.atmColorDotDiv.value = cfg.HAZE_DOT_DIV;
  u.atmColorScale.value = cfg.HAZE_COLOR_SCALE;
};

export const syncSparkUniforms = (
  material: ShaderMaterial,
  cfg: GlobeConfig,
  positions: unknown,
) => {
  const u = material.uniforms;

  u.uPointSize.value = cfg.POINT_SIZE;
  u.uScreenScale.value = cfg.SCREEN_SCALE;
  u.uStrengthPow.value = cfg.STRENGTH_POW;
  u.uDepthMin.value = cfg.DEPTH_MIN;
  u.uDepthMax.value = cfg.DEPTH_MAX;
  u.uDepthRadius.value = cfg.DEPTH_RADIUS;
  u.uRadius.value = cfg.RADIUS;
  u.uSimSize.value = cfg.RESOLUTION;
  (u.uTint.value as Color).set(cfg.TINT);
  u.uEnvIntensity.value = cfg.ENV_FILL;
  u.uBrightness.value = cfg.PARTICLE_BRIGHTNESS;

  if (positions) {
    u.uPositions.value = positions;
  }
};
