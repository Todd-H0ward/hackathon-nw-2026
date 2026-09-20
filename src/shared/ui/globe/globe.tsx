import { type RefObject, useRef } from 'react';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  type Mesh,
  type ShaderMaterial,
} from 'three';

import { GLOBE_DEFAULTS, type GlobeConfig } from './config';
import { GlobeFx } from './fx/globe-composer';
import { usePointGrid } from './hooks/use-point-grid';
import { usePositionSim } from './hooks/use-position-sim';
import { syncHazeUniforms, syncSparkUniforms } from './lib/sync-uniforms';
import './materials/haze';
import './materials/spark';

export interface GlobeProps {
  config?: GlobeConfig;
  colorUrl?: string;
  enableFx?: boolean;
  /** When set, GPGPU position evolve follows this flag (carousel visibility). */
  simEnabledRef?: RefObject<boolean>;
  /**
   * Live look overrides read each frame (ferry morph). Falls back to `config`.
   */
  liveConfigRef?: RefObject<GlobeConfig>;
}

const DEFAULT_COLOR = '/images/globe/earth_color.jpg';

export const Globe = ({
  config = GLOBE_DEFAULTS,
  colorUrl = DEFAULT_COLOR,
  enableFx = true,
  simEnabledRef,
  liveConfigRef,
}: GlobeProps) => {
  const hazeRef = useRef<Mesh>(null);
  const hazeMat = useRef<ShaderMaterial>(null);
  const sparkMat = useRef<ShaderMaterial>(null);
  const live = useRef(config);
  const motion = useRef({ spin: config.SPIN, jitter: config.JITTER });
  live.current = liveConfigRef?.current ?? config;
  motion.current.spin = live.current.SPIN;
  motion.current.jitter = live.current.JITTER;

  const colorTex = useTexture(colorUrl);

  const geometry = usePointGrid(config.RESOLUTION);
  const sim = usePositionSim({
    size: config.RESOLUTION,
    spin: config.SPIN,
    jitter: config.JITTER,
    enabledRef: simEnabledRef,
    motionRef: motion,
  });

  useFrame(() => {
    if (liveConfigRef?.current) live.current = liveConfigRef.current;
    motion.current.spin = live.current.SPIN;
    motion.current.jitter = live.current.JITTER;
    const cfg = live.current;
    if (hazeMat.current && cfg.HAZE_OPACITY > 0)
      syncHazeUniforms(hazeMat.current, cfg);
    if (sparkMat.current) {
      syncSparkUniforms(sparkMat.current, cfg, sim.getPositions());
    }
  });

  return (
    <group>
      {config.HAZE_OPACITY > 0 && (
        <mesh ref={hazeRef} scale={config.RADIUS}>
          <sphereGeometry args={[config.HAZE_RADIUS, 64, 64]} />
          <hazeMaterial
            ref={hazeMat}
            transparent
            depthWrite={false}
            depthTest
            toneMapped={false}
            blending={AdditiveBlending}
            side={BackSide}
            atmOpacity={config.HAZE_OPACITY}
            atmPowFactor={config.HAZE_POW}
            atmMultiplier={config.HAZE_MUL}
          />
        </mesh>
      )}

      {sim.ready && sim.seedTexture ? (
        <points frustumCulled={false} geometry={geometry}>
          <sparkMaterial
            ref={sparkMat}
            depthWrite={false}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            uPositions={sim.seedTexture}
            uColor={colorTex}
            uPointSize={config.POINT_SIZE}
            uScreenScale={config.SCREEN_SCALE}
            uRadius={config.RADIUS}
            uSimSize={config.RESOLUTION}
          />
        </points>
      ) : null}

      {enableFx ? <GlobeFx configRef={live} /> : null}
    </group>
  );
};
