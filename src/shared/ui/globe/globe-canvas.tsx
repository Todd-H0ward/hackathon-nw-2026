import { type ReactNode, useMemo } from 'react';

import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { GLOBE_MAPS, type GlobeBodyId, resolveGlobeConfig } from './bodies';
import { GLOBE_DEFAULTS } from './config';
import { Globe } from './globe';

const VIEW = {
  fov: 42,
  position: [0, 0, 8.6] as [number, number, number],
};

const GL = {
  alpha: true,
  antialias: false,
  powerPreference: 'high-performance' as const,
  precision: 'highp' as const,
};

export type GlobeCanvasProps = {
  body?: GlobeBodyId;
  /** World-space globe radius. Defaults to `GLOBE_DEFAULTS.RADIUS`. */
  radius?: number;
  children?: ReactNode;
  cameraReset?: number;
};

export const GlobeCanvas = ({
  body = 'earth',
  radius = GLOBE_DEFAULTS.RADIUS,
  children,
  cameraReset = 0,
}: GlobeCanvasProps) => {
  const config = useMemo(
    () =>
      resolveGlobeConfig(body, {
        RADIUS: radius,
        RESOLUTION: 256,
        BLOOM_INTENSITY: 0.65,
        BLOOM_THRESHOLD: 0.4,
      }),
    [body, radius],
  );
  const maps = useMemo(() => GLOBE_MAPS[body], [body]);

  return (
    <Canvas camera={VIEW} dpr={[1, 2]} gl={GL} className="h-full w-full">
      <ambientLight intensity={0.5} />
      <Stars
        radius={70}
        depth={30}
        count={1300}
        factor={2}
        saturation={0}
        fade
        speed={0.15}
      />
      <Globe config={config} colorUrl={maps.color} />
      <OrbitControls
        key={`${body}-${cameraReset}`}
        makeDefault
        enablePan={false}
        minDistance={3.4}
        maxDistance={12}
        enableDamping
      />
      {children}
    </Canvas>
  );
};
