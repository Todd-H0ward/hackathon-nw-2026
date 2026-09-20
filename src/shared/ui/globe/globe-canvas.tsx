/** R3F Canvas wrapper for single globe — sandbox / carousel slide. */

/** Canvas wrapper for single globe — sandbox, lab, and static slides. */

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';

import { resolveSandboxResolution } from '@/shared/lib/perf/device-tier';
import { cn } from '@/shared/lib/utils';

import { GLOBE_MAPS, type GlobeBodyId, resolveGlobeConfig } from './bodies';
import { GLOBE_BLOOM_DPR, GLOBE_DEFAULTS } from './config';
import { Globe } from './globe';
import { Starfield } from './starfield';

// ═══════════════════════════════════════════
// CONSTANTS — CAMERA / GL
// ═══════════════════════════════════════════

/** Far plane must clear drei Stars (~2× spherical radius). */
const CAMERA = {
  fov: 35,
  near: 0.1,
  far: 1000,
  position: [0, 0, 7] as [number, number, number],
};

/** Wider freer view for lab / sandbox full-bleed canvas. */
export const GLOBE_FILL_CAMERA = {
  fov: 42,
  near: 0.1,
  far: 1000,
  position: [0, 0, 8.6] as [number, number, number],
};

const GL = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance' as const,
  precision: 'highp' as const,
  preserveDrawingBuffer: false,
};

// ═══════════════════════════════════════════
// COMPONENT — CAMERA
// ═══════════════════════════════════════════

/** Keeps the projection matrix matching the real drawable aspect (avoids ellipse squash). */
const SquareCameraRig = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const side = Math.min(size.width, size.height);
    if (side <= 0) return;

    if ('aspect' in camera) {
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.height, size.width]);

  return null;
};

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface GlobeCanvasProps {
  body?: GlobeBodyId;
  /** World-space globe radius. Defaults to `GLOBE_DEFAULTS.RADIUS`. */
  radius?: number;
  /**
   * GPGPU / point resolution. Defaults to an adaptive sandbox value
   * (`resolveSandboxResolution`) when unset.
   */
  resolution?: number;
  /** Enable orbit drag. Off by default for carousel slides. */
  interactive?: boolean;
  /** Full-bleed canvas (lab/sandbox). Default keeps square letterboxed host. */
  fill?: boolean;
  /** Soft starfield background (typically with `fill`). */
  stars?: boolean;
  /** Spark particle brightness multiplier (1 = default look). */
  particleBrightness?: number;
  /** Remount orbit controls (e.g. after camera reset in lab). */
  cameraReset?: number;
  className?: string;
  children?: ReactNode;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const GlobeCanvas = ({
  body = 'earth',
  radius = GLOBE_DEFAULTS.RADIUS,
  resolution,
  interactive = false,
  fill = false,
  stars = false,
  particleBrightness = GLOBE_DEFAULTS.PARTICLE_BRIGHTNESS,
  cameraReset = 0,
  className,
  children,
}: GlobeCanvasProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [pixelSize, setPixelSize] = useState(0);
  // Capture once per mount — avoid mid-session RES swaps remounting GPGPU.
  const [sandboxResolution] = useState(
    () => resolution ?? resolveSandboxResolution(),
  );
  const resolvedResolution = resolution ?? sandboxResolution;

  const config = useMemo(
    () =>
      resolveGlobeConfig(body, {
        RADIUS: radius,
        RESOLUTION: resolvedResolution,
        PARTICLE_BRIGHTNESS: particleBrightness,
      }),
    [body, particleBrightness, radius, resolvedResolution],
  );
  const maps = useMemo(() => GLOBE_MAPS[body], [body]);

  useEffect(() => {
    if (fill) return;
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      setPixelSize(Math.max(1, Math.floor(Math.min(width, height))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [fill]);

  const scene = (
    <>
      <ambientLight intensity={fill ? 0.5 : 0.55} />
      {stars ? <Starfield dense={fill} /> : null}
      <Globe config={config} colorUrl={maps.color} />
      {interactive ? (
        fill ? (
          <OrbitControls
            key={`${body}-${cameraReset}`}
            makeDefault
            enablePan={false}
            minDistance={3.4}
            maxDistance={12}
            enableDamping
          />
        ) : (
          <OrbitControls enableZoom={false} enablePan={false} />
        )
      ) : null}
      {children}
    </>
  );

  if (fill) {
    return (
      <div ref={hostRef} className={cn('relative size-full', className)}>
        <Canvas
          camera={GLOBE_FILL_CAMERA}
          dpr={GLOBE_BLOOM_DPR}
          gl={GL}
          className="!block !h-full !w-full"
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
          flat={false}
        >
          {scene}
        </Canvas>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={cn(
        'relative flex aspect-square size-full max-h-full max-w-full items-center justify-center',
        className,
      )}
    >
      {pixelSize > 0 ? (
        <div
          className="relative overflow-hidden"
          style={{ width: pixelSize, height: pixelSize }}
        >
          <Canvas
            camera={CAMERA}
            dpr={interactive ? GLOBE_BLOOM_DPR : [1, 1.5]}
            gl={GL}
            className="!block !size-full"
            style={{ width: pixelSize, height: pixelSize, touchAction: 'none' }}
            flat={false}
          >
            <SquareCameraRig />
            {scene}
          </Canvas>
        </div>
      ) : null}
    </div>
  );
};
