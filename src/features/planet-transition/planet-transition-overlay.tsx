import { Suspense, useEffect, useMemo, useRef } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animate, motion } from 'motion/react';
import { type Group, MathUtils, type PerspectiveCamera } from 'three';

import {
  GLOBE_MAPS,
  Globe,
  type GlobeBodyId,
  type PlanetScreenPose,
  resolveGlobeConfig,
} from '@/shared/ui/globe';

import { usePlanetTransition } from './store';

const GL = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance' as const,
  precision: 'highp' as const,
};

/** Frames drawn before the source page may hide its own planet. */
const READY_FRAMES = 4;
const FLIGHT = { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const };
const LAND_FADE = 0.45;
/** Bail out if the destination never registers a landing spot. */
const HANDOFF_TIMEOUT_MS = 2500;

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

const FlightScene = ({ body }: { body: GlobeBodyId }) => {
  const groupRef = useRef<Group>(null);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const config = useMemo(() => resolveGlobeConfig(body), [body]);
  const hasTarget = usePlanetTransition((s) => s.resolveTarget !== null);

  const frames = useRef(0);
  const progress = useRef(0);

  // motion drives the timeline; the frame loop maps it onto the live target.
  useEffect(() => {
    if (!hasTarget) return;
    const { phase, setPhase } = usePlanetTransition.getState();
    if (phase !== 'handoff' && phase !== 'flight') return;

    setPhase('flight');
    progress.current = 0;
    const controls = animate(0, 1, {
      ...FLIGHT,
      onUpdate: (value) => {
        progress.current = value;
      },
      onComplete: () => usePlanetTransition.getState().setPhase('land'),
    });
    return () => controls.stop();
  }, [hasTarget]);

  useFrame(() => {
    const store = usePlanetTransition.getState();
    const group = groupRef.current;
    if (!store.from || !group) return;

    if (store.phase === 'launch' && ++frames.current >= READY_FRAMES) {
      store.setPhase('handoff');
    }

    let pose = store.from;
    if (store.phase === 'flight' || store.phase === 'land') {
      const target = store.resolveTarget?.();
      if (!target) {
        store.reset();
        return;
      }
      pose = mixPose(store.from, target, progress.current);
    }

    // Render as if from a camera centered on the planet (like the source and
    // target canvases) and crop the viewport out of that larger frame, so the
    // globe stays on-axis and lands without perspective skew. The eye distance
    // is kept (point sprites scale with it); the FOV yields the on-screen radius.
    const { width, height } = size;
    const fullWidth = 2 * Math.max(pose.x, width - pose.x, 1);
    const fullHeight = 2 * Math.max(pose.y, height - pose.y, 1);
    const alpha = Math.asin(Math.min(0.999, config.RADIUS / pose.distance));
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
      <Globe config={config} colorUrl={GLOBE_MAPS[body].color} />
    </group>
  );
};

/**
 * Carries a planet between routes: a fixed full-screen canvas that starts at the
 * source page's planet pose and lands on the destination viewport, then fades out
 * as the destination's own canvas fades in.
 */
export const PlanetTransitionOverlay = () => {
  const phase = usePlanetTransition((s) => s.phase);
  const body = usePlanetTransition((s) => s.body);
  const reset = usePlanetTransition((s) => s.reset);

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
        if (usePlanetTransition.getState().phase === 'land') reset();
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], near: 0.1, far: 100 }}
        dpr={[1, 2]}
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
