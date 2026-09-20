/** Planet carousel — ring layout, swipe/drag, screen pose for ferry. */

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type Group, MathUtils, type PerspectiveCamera, Vector3 } from 'three';

import {
  GLOBE_BODY_IDS,
  GLOBE_MAPS,
  type GlobeBodyId,
  resolveGlobeConfig,
} from './bodies';
import { HOME_CAROUSEL_LOOK } from './carousel-look';
import { GLOBE_BLOOM_DPR, GLOBE_DEFAULTS, type GlobeConfig } from './config';
import { GlobeFx } from './fx/globe-composer';
import { Globe } from './globe';
import { type PlanetScreenPose, projectedRadius } from './lib/screen-pose';
import { Starfield } from './starfield';

import {
  resolveCarouselResolution,
} from '@/shared/lib/perf/device-tier';

// ═══════════════════════════════════════════
// CONSTANTS — CAMERA / GL / CAROUSEL
// ═══════════════════════════════════════════

/** Far plane must clear drei Stars (~2× spherical radius). */
const CAMERA = {
  fov: 32,
  near: 0.1,
  far: 1000,
  position: [0, 0.15, 9] as [number, number, number],
};

const GL = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance' as const,
  precision: 'highp' as const,
};

const BODY_COUNT = GLOBE_BODY_IDS.length;
const RING_HALF = BODY_COUNT / 2;
/** Side planets sit near the viewport edge so a bit peeks in. */
const SPACING = 5.8;
const SIDE_DEPTH = 1.2;
const ACTIVE_SCALE = 1;
const SIDE_SCALE = 0.62;
/** Start shrinking toward 0 past the side slot so the ring wrap is invisible. */
const EDGE_FADE_START = Math.max(1, RING_HALF - 0.45);
const SWIPE_PX = 56;
/** Ignore micro-jitter so a tap still counts as a click (esp. touch). */
const CLICK_CANCEL_MOVE_PX = 12;
const OFFSET_DAMP = 4.2;
const POSE_DAMP = 6.0;
/** If target X jumps farther than this, the ring wrapped — snap, don't lerp through center. */
const WRAP_SNAP_X = SPACING * (RING_HALF - 0.25);

// ═══════════════════════════════════════════
// UTILITIES — RING MATH
// ═══════════════════════════════════════════

/** Shortest signed step on a ring of `length` items. */
const shortestStep = (from: number, to: number, length: number) => {
  let diff = ((to - from) % length) + length;
  diff %= length;
  if (diff > length / 2) diff -= length;
  return diff;
};

/** Map value into (-length/2, length/2]. */
const wrapCentered = (value: number, length: number) => {
  let v = ((value % length) + length) % length;
  if (v > length / 2) v -= length;
  return v;
};

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

type MeasureBody = (body: GlobeBodyId) => PlanetScreenPose | null;

export type PlanetHoverPayload = {
  body: GlobeBodyId;
  clientX: number;
  clientY: number;
};

interface CarouselSceneProps {
  /** Continuous carousel offset; integer part aligns with active body. */
  offsetRef: RefObject<number>;
  targetOffsetRef: RefObject<number>;
  dragOffsetRef: RefObject<number>;
  fxConfigRef: RefObject<GlobeConfig>;
  onHoverPlanet?: (payload: PlanetHoverPayload | null) => void;
  hoveredBodyRef: RefObject<GlobeBodyId | null>;
  /** Set on mesh pointerdown — touch has no prior hover. */
  clickBodyRef: RefObject<GlobeBodyId | null>;
  hiddenBodyRef: RefObject<GlobeBodyId | null>;
  measureRef: RefObject<MeasureBody | null>;
}

// ═══════════════════════════════════════════
// COMPONENT — CAROUSEL 3D SCENE
// ═══════════════════════════════════════════

const CarouselScene = ({
  offsetRef,
  targetOffsetRef,
  dragOffsetRef,
  fxConfigRef,
  onHoverPlanet,
  hoveredBodyRef,
  clickBodyRef,
  hiddenBodyRef,
  measureRef,
}: CarouselSceneProps) => {
  const groupRefs = useRef<(Group | null)[]>([]);
  // Stable per-body flags — pose frame writes, usePositionSim (−1) reads.
  const simEnabledRefs = useRef(GLOBE_BODY_IDS.map(() => ({ current: true })));
  const ready = useRef(false);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const gl = useThree((state) => state.gl);

  // ── Screen pose: planet screen coords for ferry handoff ──
  // Screen pose of a planet — lets a page hand the exact on-screen globe to another canvas.
  measureRef.current = (body) => {
    const group = groupRefs.current[GLOBE_BODY_IDS.indexOf(body)];
    if (!group) return null;

    const world = group.getWorldPosition(new Vector3());
    const distance = world.distanceTo(camera.position);
    const ndc = world.clone().project(camera);
    const rect = gl.domElement.getBoundingClientRect();

    return {
      x: rect.left + ((ndc.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - ndc.y) / 2) * rect.height,
      radius: projectedRadius(
        GLOBE_DEFAULTS.RADIUS * group.scale.x,
        distance,
        camera.fov,
        rect.height,
      ),
      distance,
    };
  };

  // ── Pose frame (priority −2): position/scale/snap + simEnabled flags ──
  // Priority −2: run before usePositionSim (−1) so enabled flags are fresh.
  useFrame((_, delta) => {
    offsetRef.current = MathUtils.damp(
      offsetRef.current,
      targetOffsetRef.current,
      OFFSET_DAMP,
      delta,
    );

    const visualOffset = offsetRef.current + (dragOffsetRef.current ?? 0);
    const hidden = hiddenBodyRef.current;

    for (let index = 0; index < BODY_COUNT; index++) {
      const group = groupRefs.current[index];
      if (!group) continue;

      const body = GLOBE_BODY_IDS[index];
      const slot = wrapCentered(index - visualOffset, BODY_COUNT);
      const abs = Math.abs(slot);
      const coverAbs = Math.min(abs, 1.2);
      const targetX = slot * SPACING;
      const targetZ = -Math.min(abs, 1.5) * SIDE_DEPTH;

      let targetScale =
        ACTIVE_SCALE - Math.min(coverAbs, 1) * (ACTIVE_SCALE - SIDE_SCALE);
      // Fade out at the ring edge so the side-to-side teleport isn't seen.
      if (abs > EDGE_FADE_START) {
        const t = MathUtils.clamp(
          (abs - EDGE_FADE_START) / (RING_HALF - EDGE_FADE_START),
          0,
          1,
        );
        targetScale *= 1 - t * t;
      }

      // Ring wrap: slot jumps ±N/2 → targetX flips sides. Damping would slide
      // through the center — snap only while already faded out.
      const wrapped =
        ready.current &&
        abs > EDGE_FADE_START &&
        Math.abs(group.position.x - targetX) > WRAP_SNAP_X;

      if (!ready.current || wrapped) {
        group.position.set(targetX, 0, targetZ);
        group.scale.setScalar(targetScale);
        group.visible = targetScale > 0.03;
      } else {
        group.position.x = MathUtils.damp(
          group.position.x,
          targetX,
          POSE_DAMP,
          delta,
        );
        group.position.z = MathUtils.damp(
          group.position.z,
          targetZ,
          POSE_DAMP,
          delta,
        );
        const s = MathUtils.damp(group.scale.x, targetScale, POSE_DAMP, delta);
        group.scale.setScalar(s);
        group.visible = s > 0.03;
      }

      if (hidden === body) {
        group.visible = false;
      }

      // Side peek (SIDE_SCALE) stays drawn but freezes GPGPU — only the
      // active / approaching planet pays for an FBO evolve each frame.
      const scale = group.scale.x;
      simEnabledRefs.current[index].current =
        group.visible && scale > SIDE_SCALE + 0.04;
    }

    ready.current = true;
  }, -2);

  const bodyConfigs = useMemo(() => {
    const res = resolveCarouselResolution();
    return GLOBE_BODY_IDS.map((body) => ({
      body,
      config: resolveGlobeConfig(body, {
        RADIUS: GLOBE_DEFAULTS.RADIUS,
        RESOLUTION: res,
        ...HOME_CAROUSEL_LOOK[body],
      }),
      colorUrl: GLOBE_MAPS[body].color,
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={0.35} />
      <Starfield />

      {bodyConfigs.map(({ body, config, colorUrl }, index) => (
        <group
          key={body}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
        >
          <Globe
            config={config}
            colorUrl={colorUrl}
            enableFx={false}
            simEnabledRef={simEnabledRefs.current[index]}
          />
          {/* Invisible hit target — point cloud does not receive pointers. */}
          <mesh
            onPointerDown={(event) => {
              // Touch never gets pointerover before down — stamp the hit here.
              hoveredBodyRef.current = body;
              clickBodyRef.current = body;
              onHoverPlanet?.({
                body,
                clientX: event.clientX,
                clientY: event.clientY,
              });
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = 'pointer';
              hoveredBodyRef.current = body;
              onHoverPlanet?.({
                body,
                clientX: event.clientX,
                clientY: event.clientY,
              });
            }}
            onPointerMove={(event) => {
              if (hoveredBodyRef.current !== body) return;
              onHoverPlanet?.({
                body,
                clientX: event.clientX,
                clientY: event.clientY,
              });
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              document.body.style.cursor = '';
              if (hoveredBodyRef.current !== body) return;
              hoveredBodyRef.current = null;
              onHoverPlanet?.(null);
            }}
          >
            <sphereGeometry args={[config.RADIUS * 1.06, 24, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <GlobeFx configRef={fxConfigRef} />
    </>
  );
};

export interface GlobeCarouselCanvasProps {
  activeBody: GlobeBodyId;
  onBodyChange: (body: GlobeBodyId) => void;
  onHoverPlanet?: (payload: PlanetHoverPayload | null) => void;
  /** `pose` is the planet's current screen placement (for seamless handoff). */
  onPlanetClick?: (body: GlobeBodyId, pose: PlanetScreenPose | null) => void;
  /** Planet taken over by another canvas — not drawn here. */
  hiddenBody?: GlobeBodyId | null;
  /** Lets a parent read live screen poses (reverse transition landing). */
  poseMeasureRef?: RefObject<MeasureBody | null>;
  /**
   * Pause the WebGL loop (ferry opacity 0). Keep mounted so reverse landings
   * can re-enable without rebuilding three canvases.
   */
  paused?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════
// COMPONENT — CANVAS + GESTURES
// ═══════════════════════════════════════════

export const GlobeCarouselCanvas = ({
  activeBody,
  onBodyChange,
  onHoverPlanet,
  onPlanetClick,
  hiddenBody = null,
  poseMeasureRef,
  paused = false,
  className,
}: GlobeCarouselCanvasProps) => {
  const activeIndex = Math.max(0, GLOBE_BODY_IDS.indexOf(activeBody));

  const offsetRef = useRef(activeIndex);
  const targetOffsetRef = useRef(activeIndex);
  const dragOffsetRef = useRef(0);
  const pointerX = useRef<number | null>(null);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const hoveredBodyRef = useRef<GlobeBodyId | null>(null);
  const clickBodyRef = useRef<GlobeBodyId | null>(null);
  const hiddenBodyRef = useRef<GlobeBodyId | null>(hiddenBody);
  hiddenBodyRef.current = hiddenBody;
  const internalMeasureRef = useRef<MeasureBody | null>(null);
  const measureRef = poseMeasureRef ?? internalMeasureRef;
  const lastSwipeTimeRef = useRef(0);

  // Hit meshes set a pointer cursor; don't leak it past unmount (e.g. navigation on click).
  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  const fxConfigRef = useRef(
    resolveGlobeConfig(activeBody, HOME_CAROUSEL_LOOK[activeBody]),
  );
  useEffect(() => {
    fxConfigRef.current = resolveGlobeConfig(
      activeBody,
      HOME_CAROUSEL_LOOK[activeBody],
    );
  }, [activeBody]);

  // Keep continuous offset in sync with external activeBody (buttons / parent).
  useEffect(() => {
    const currentSlot =
      ((Math.round(targetOffsetRef.current) % BODY_COUNT) + BODY_COUNT) %
      BODY_COUNT;
    const step = shortestStep(currentSlot, activeIndex, BODY_COUNT);
    if (step !== 0) {
      targetOffsetRef.current += step;
    }
  }, [activeIndex]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerX.current = event.clientX;
    dragging.current = true;
    dragMoved.current = false;
    dragOffsetRef.current = 0;
    // Prefer mesh hit from R3F (set in onPointerDown); hover is desktop-only.
    if (!clickBodyRef.current) {
      clickBodyRef.current = hoveredBodyRef.current;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || pointerX.current === null) return;
    const deltaPx = event.clientX - pointerX.current;
    if (Math.abs(deltaPx) > CLICK_CANCEL_MOVE_PX) {
      dragMoved.current = true;
      clickBodyRef.current = null;
      onHoverPlanet?.(null);
    }
    dragOffsetRef.current = -deltaPx / 240;
  };

  const finishDrag = (clientX: number) => {
    if (!dragging.current || pointerX.current === null) {
      dragging.current = false;
      dragMoved.current = false;
      pointerX.current = null;
      dragOffsetRef.current = 0;
      clickBodyRef.current = null;
      return;
    }

    const deltaPx = clientX - pointerX.current;
    const clickedBody = clickBodyRef.current;
    const currentDragOffset = dragOffsetRef.current;
    const wasTap = !dragMoved.current && Math.abs(deltaPx) < SWIPE_PX;
    dragging.current = false;
    pointerX.current = null;

    // Smoothly absorb the drag offset into offsetRef so position is 100% continuous
    offsetRef.current += currentDragOffset;
    dragOffsetRef.current = 0;

    if (wasTap) {
      const fireClick = (body: GlobeBodyId) => {
        onPlanetClick?.(body, measureRef.current?.(body) ?? null);
        clickBodyRef.current = null;
      };

      if (clickedBody) {
        fireClick(clickedBody);
      } else {
        // Touch: R3F mesh pointerdown can land after this DOM handler.
        requestAnimationFrame(() => {
          const lateHit = clickBodyRef.current ?? hoveredBodyRef.current;
          if (lateHit) fireClick(lateHit);
          else clickBodyRef.current = null;
        });
      }
      dragMoved.current = false;
      return;
    }

    clickBodyRef.current = null;

    if (Math.abs(deltaPx) < SWIPE_PX) {
      dragMoved.current = false;
      return;
    }

    const now = Date.now();
    if (now - lastSwipeTimeRef.current < 280) {
      dragMoved.current = false;
      return;
    }
    lastSwipeTimeRef.current = now;

    const step = deltaPx < 0 ? 1 : -1;
    targetOffsetRef.current += step;
    const nextIndex =
      ((Math.round(targetOffsetRef.current) % BODY_COUNT) + BODY_COUNT) %
      BODY_COUNT;
    onBodyChange(GLOBE_BODY_IDS[nextIndex]);
    dragMoved.current = false;
    onHoverPlanet?.(null);
  };

  return (
    <div
      className={className}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishDrag(event.clientX)}
      onPointerCancel={() => {
        dragging.current = false;
        pointerX.current = null;
        dragOffsetRef.current = 0;
      }}
    >
      <Canvas
        camera={CAMERA}
        dpr={GLOBE_BLOOM_DPR}
        gl={GL}
        frameloop={paused ? 'never' : 'always'}
        className="absolute inset-0 !h-full !w-full"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CarouselScene
          offsetRef={offsetRef}
          targetOffsetRef={targetOffsetRef}
          dragOffsetRef={dragOffsetRef}
          fxConfigRef={fxConfigRef}
          onHoverPlanet={onHoverPlanet}
          hoveredBodyRef={hoveredBodyRef}
          clickBodyRef={clickBodyRef}
          hiddenBodyRef={hiddenBodyRef}
          measureRef={measureRef}
        />
      </Canvas>
    </div>
  );
};
