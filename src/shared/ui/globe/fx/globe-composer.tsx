import { type RefObject, useContext, useEffect, useMemo } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  EffectComposerContext,
  Noise,
} from '@react-three/postprocessing';
import {
  BlendFunction,
  BloomEffect,
  type Effect,
  EffectPass,
} from 'postprocessing';

import { getComposerFrameBufferType } from '@/shared/lib/webgl/texture-types';
import { GLOBE_DEFAULTS, type GlobeConfig } from '@/shared/ui/globe/config';

const NOISE = 0.028;

interface GlobeFxProps {
  configRef: RefObject<GlobeConfig>;
}

const passEffects = (pass: EffectPass): Effect[] =>
  (pass as unknown as { effects: Effect[] }).effects;

const syncBloom = (
  composer: { passes: readonly unknown[] },
  cfg: GlobeConfig,
) => {
  for (const pass of composer.passes) {
    if (!(pass instanceof EffectPass)) continue;
    pass.dithering = true;

    for (const effect of passEffects(pass)) {
      if (!(effect instanceof BloomEffect)) continue;
      effect.intensity = cfg.BLOOM_INTENSITY;
      effect.luminanceMaterial.threshold = cfg.BLOOM_THRESHOLD;
      effect.luminanceMaterial.smoothing = cfg.BLOOM_SMOOTHING;
      effect.mipmapBlurPass.radius = cfg.BLOOM_RADIUS;
    }
  }
};

const GlobeFxSync = ({ configRef }: GlobeFxProps) => {
  const { composer } = useContext(EffectComposerContext);
  const size = useThree((state) => state.size);

  // @react-three/postprocessing sizes a new composer from a module-level Vector2
  // shared by every canvas, so with two canvases mounted (e.g. the planet
  // transition overlay) one can inherit the other's size. Re-apply our own.
  useEffect(() => {
    if (!composer) return;
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  useFrame(() => {
    syncBloom(composer, configRef.current);
  });

  return null;
};

export const GlobeFx = ({ configRef }: GlobeFxProps) => {
  const gl = useThree((state) => state.gl);
  const frameBufferType = useMemo(() => getComposerFrameBufferType(gl), [gl]);
  const d = GLOBE_DEFAULTS;

  return (
    <EffectComposer frameBufferType={frameBufferType} multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={d.BLOOM_INTENSITY}
        luminanceThreshold={d.BLOOM_THRESHOLD}
        luminanceSmoothing={d.BLOOM_SMOOTHING}
        radius={d.BLOOM_RADIUS}
      />
      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={NOISE}
        premultiply
      />
      <GlobeFxSync configRef={configRef} />
    </EffectComposer>
  );
};
