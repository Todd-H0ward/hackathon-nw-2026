// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { Suspense, useEffect, useMemo, useRef } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animate, motion } from 'motion/react';
import { type Group, MathUtils, type PerspectiveCamera } from 'three';

import {
  GLOBE_MAPS,
  GLOBE_TRANSITION_DPR,
  Globe,
  type GlobeBodyId,
  type GlobeConfig,
  HOME_CAROUSEL_LOOK,
  lerpGlobeConfig,
  type PlanetScreenPose,
  resolveGlobeConfig,
} from '@/shared/ui/globe';
import { resolveCarouselResolution } from '@/shared/lib/perf/device-tier';

import {
  getTransitionState,
  useTransitionBody,
  useTransitionDirection,
  useTransitionHasTarget,
  useTransitionPhase,
  useTransitionReset,
} from '@/store';

// ═══════════════════════════════════════════
// CONSTANTS — WEBGL / ANIMATION
// ═══════════════════════════════════════════

const GL = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance' as const,
  precision: 'highp' as const,
};

/** Frames before the source page may hide its planet. */
const READY_FRAMES = 4;
const FLIGHT = { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const };
const LAND_FADE = 0.45;
/** Timeout when the landing target never registers. */
const HANDOFF_TIMEOUT_MS = 2500;

// ═══════════════════════════════════════════
// POSE MATH
// ═══════════════════════════════════════════

/** Linear interpolation of the planet screen pose. */
const mixPose = (
  a: PlanetScreenPose,
  b: PlanetScreenPose,
  t: number,
): PlanetScreenPose => ({
  x: MathUtils.lerp(a.x, b.x, t),
  y: MathUtils.lerp(a.y, b.y, t),
  radius: MathUtils.lerp(a.radius, b.radius, t),
  distance: MathUtils.lerp(a.distance, b.distance, t),
});

/** Smoothstep for a smooth globe-config blend. */
const smoothstep = (t: number) => {
  const x = MathUtils.clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

// ═══════════════════════════════════════════
// FLIGHT SCENE
// ═══════════════════════════════════════════

interface FlightSceneProps {
  body: GlobeBodyId;
}

const FlightScene = ({ body }: FlightSceneProps) => {
  const groupRef = useRef<Group>(null);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const direction = useTransitionDirection();
  const hasTarget = useTransitionHasTarget();

  // ═══════════════════════════════════════════
  // GLOBE CONFIG
  // ═══════════════════════════════════════════

  // Forward: carousel motion → sandbox rest. Back: sandbox rest → carousel motion.
  // Stay on carousel density — dual bloom+GPGPU at full RES hitchs the handoff.
  const { fromConfig, toConfig, baseConfig } = useMemo(() => {
    const res = resolveCarouselResolution();
    const carousel = resolveGlobeConfig(body, {
      RESOLUTION: res,
      ...HOME_CAROUSEL_LOOK[body],
    });
    const sandbox = resolveGlobeConfig(body, {
      RESOLUTION: res,
    });
    if (direction === 'forward') {
      return { fromConfig: carousel, toConfig: sandbox, baseConfig: carousel };
    }
    return { fromConfig: sandbox, toConfig: carousel, baseConfig: sandbox };
  }, [body, direction]);

  const liveConfigRef = useRef<GlobeConfig>(baseConfig);
  const frames = useRef(0);
  const progress = useRef(0);
  const flightArmedRef = useRef(false);
  const flightControlsRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    liveConfigRef.current = baseConfig;
    frames.current = 0;
    progress.current = 0;
    flightArmedRef.current = false;
    flightControlsRef.current?.stop();
    flightControlsRef.current = null;
  }, [baseConfig]);

  // ═══════════════════════════════════════════
  // FLIGHT ARMING
  // ═══════════════════════════════════════════

  // Arm flight once from handoff. Ignore hasTarget flicker so animate never restarts.
  useEffect(() => {
    if (!hasTarget || flightArmedRef.current) return;
    const { phase, setPhase } = getTransitionState();
    if (phase !== 'handoff') return;

    flightArmedRef.current = true;
    setPhase('flight');
    progress.current = 0;
    flightControlsRef.current = animate(0, 1, {
      ...FLIGHT,
      onUpdate: (value) => {
        progress.current = value;
      },
      onComplete: () => getTransitionState().setPhase('land'),
    });
  }, [hasTarget]);

  useEffect(
    () => () => {
      flightControlsRef.current?.stop();
      flightControlsRef.current = null;
    },
    [],
  );

  // ═══════════════════════════════════════════
  // R3F FRAME
  // ═══════════════════════════════════════════

  useFrame(() => {
    const store = getTransitionState();
    const group = groupRef.current;
    if (!store.from || !group) return;

    if (store.phase === 'launch' && ++frames.current >= READY_FRAMES) {
      store.setPhase('handoff');
    }

    let blend = 0;
    if (store.phase === 'flight') blend = progress.current;
    else if (store.phase === 'land') blend = 1;
    liveConfigRef.current = lerpGlobeConfig(
      fromConfig,
      toConfig,
      smoothstep(blend),
    );

    let pose = store.from;
    if (store.phase === 'flight' || store.phase === 'land') {
      const target = store.resolveTarget?.();
      // Destination may need a frame after navigate (esp. reverse → home carousel).
      if (!target) return;
      pose = mixPose(store.from, target, progress.current);
    }

    const cfg = liveConfigRef.current;
    // Render as if from a camera centered on the planet (like the source and
    // target canvases) and crop the viewport out of that larger frame, so the
    // globe stays on-axis and lands without perspective skew. The eye distance
    // is kept (point sprites scale with it); the FOV yields the on-screen radius.
    const { width, height } = size;
    const fullWidth = 2 * Math.max(pose.x, width - pose.x, 1);
    const fullHeight = 2 * Math.max(pose.y, height - pose.y, 1);
    const alpha = Math.asin(Math.min(0.999, cfg.RADIUS / pose.distance));
    const tanHalf =
      (Math.tan(alpha) * fullHeight) / (2 * Math.max(1, pose.radius));
    camera.fov = MathUtils.radToDeg(2 * Math.atan(tanHalf));
    camera.aspect = fullWidth / fullHeight;
    camera.setViewOffset(
      fullWidth,
      fullHeight,
      fullWidth / 2 - pose.x,
      fullHeight / 2 - pose.y,
      width,
      height,
    );

    group.position.set(0, 0, -pose.distance);
  });

  return (
    <group ref={groupRef}>
      <Globe
        config={baseConfig}
        liveConfigRef={liveConfigRef}
        colorUrl={GLOBE_MAPS[body].color}
        // Carousel / sandbox already bloom — a third composer hitchs the handoff.
        enableFx={false}
      />
    </group>
  );
};

// ═══════════════════════════════════════════
// TRANSITION OVERLAY
// ═══════════════════════════════════════════

/**
 * Moves the planet between routes: a fullscreen canvas starts in the
 * source page pose, lands in the destination viewport, then fades out
 * while the destination canvas appears.
 */
export const PlanetTransitionOverlay = () => {
  const phase = useTransitionPhase();
  const body = useTransitionBody();
  const reset = useTransitionReset();

  useEffect(() => {
    if (phase !== 'handoff') return;
    const timer = window.setTimeout(reset, HANDOFF_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, reset]);

  if (phase === 'idle' || !body) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'land' ? 0 : 1 }}
      transition={{ duration: LAND_FADE, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (getTransitionState().phase === 'land') reset();
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], near: 0.1, far: 100 }}
        dpr={GLOBE_TRANSITION_DPR}
        gl={GL}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={0.55} />
        <Suspense fallback={null}>
          <FlightScene body={body} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
};
