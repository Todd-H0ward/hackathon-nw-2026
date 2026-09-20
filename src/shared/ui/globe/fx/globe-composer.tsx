import { type RefObject, useContext, useEffect, useMemo, useRef } from 'react';

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

import { shouldEnableComposerNoise } from '@/shared/lib/perf/device-tier';
import { getComposerFrameBufferType } from '@/shared/lib/webgl/texture-types';
import { GLOBE_DEFAULTS, type GlobeConfig } from '@/shared/ui/globe/config';

const NOISE = 0.028;

interface GlobeFxProps {
  configRef: RefObject<GlobeConfig>;
}

type BloomParams = {
  intensity: number;
  threshold: number;
  smoothing: number;
  radius: number;
};

const passEffects = (pass: EffectPass): Effect[] =>
  (pass as unknown as { effects: Effect[] }).effects;

const findBloom = (composer: {
  passes: readonly unknown[];
}): BloomEffect | null => {
  for (const pass of composer.passes) {
    if (!(pass instanceof EffectPass)) continue;
    pass.dithering = true;
    for (const effect of passEffects(pass)) {
      if (effect instanceof BloomEffect) return effect;
    }
  }
  return null;
};

const applyBloom = (bloom: BloomEffect, params: BloomParams) => {
  bloom.intensity = params.intensity;
  bloom.luminanceMaterial.threshold = params.threshold;
  bloom.luminanceMaterial.smoothing = params.smoothing;
  bloom.mipmapBlurPass.radius = params.radius;
};

const bloomParamsFrom = (cfg: GlobeConfig): BloomParams => ({
  intensity: cfg.BLOOM_INTENSITY,
  threshold: cfg.BLOOM_THRESHOLD,
  smoothing: cfg.BLOOM_SMOOTHING,
  radius: cfg.BLOOM_RADIUS,
});

const bloomParamsEqual = (a: BloomParams, b: BloomParams) =>
  a.intensity === b.intensity &&
  a.threshold === b.threshold &&
  a.smoothing === b.smoothing &&
  a.radius === b.radius;

const GlobeFxSync = ({ configRef }: GlobeFxProps) => {
  const { composer } = useContext(EffectComposerContext);
  const size = useThree((state) => state.size);
  const bloomRef = useRef<BloomEffect | null>(null);
  const appliedRef = useRef<BloomParams | null>(null);

  // @react-three/postprocessing sizes a new composer from a module-level Vector2
  // shared by every canvas, so with two canvases mounted (e.g. the planet
  // transition overlay) one can inherit the other's size. Re-apply our own.
  useEffect(() => {
    if (!composer) return;
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  // Bloom knobs change only on planet switch — skip the pass walk otherwise.
  useFrame(() => {
    if (!composer) return;
    const next = bloomParamsFrom(configRef.current);
    const applied = appliedRef.current;
    if (applied && bloomParamsEqual(applied, next) && bloomRef.current) return;

    const bloom = bloomRef.current ?? findBloom(composer);
    if (!bloom) return;
    bloomRef.current = bloom;
    applyBloom(bloom, next);
    appliedRef.current = next;
  });

  return null;
};

export const GlobeFx = ({ configRef }: GlobeFxProps) => {
  const gl = useThree((state) => state.gl);
  const frameBufferType = useMemo(() => getComposerFrameBufferType(gl), [gl]);
  const d = GLOBE_DEFAULTS;
  const enableNoise = shouldEnableComposerNoise();

  return (
    <EffectComposer frameBufferType={frameBufferType} multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={d.BLOOM_INTENSITY}
        luminanceThreshold={d.BLOOM_THRESHOLD}
        luminanceSmoothing={d.BLOOM_SMOOTHING}
        radius={d.BLOOM_RADIUS}
      />
      {enableNoise ? (
        <Noise
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={NOISE}
          premultiply
        />
      ) : null}
      <GlobeFxSync configRef={configRef} />
    </EffectComposer>
  );
};
