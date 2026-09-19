import { type ReactNode, useMemo } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { GLOBE_MAPS, type GlobeBodyId, resolveGlobeConfig } from './bodies';
import { GLOBE_DEFAULTS } from './config';
import { Globe } from './globe';

const VIEW = {
  fov: 36,
  position: [0, 0, 6] as [number, number, number],
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
};

export const GlobeCanvas = ({
  body = 'earth',
  radius = GLOBE_DEFAULTS.RADIUS,
  children,
}: GlobeCanvasProps) => {
  const config = useMemo(
    () => resolveGlobeConfig(body, { RADIUS: radius }),
    [body, radius],
  );
  const maps = useMemo(() => GLOBE_MAPS[body], [body]);

  return (
    <Canvas camera={VIEW} dpr={[1, 2]} gl={GL} className="h-full w-full">
      <ambientLight intensity={0.5} />
      <Globe config={config} colorUrl={maps.color} />
      <OrbitControls />
      {children}
    </Canvas>
  );
};
