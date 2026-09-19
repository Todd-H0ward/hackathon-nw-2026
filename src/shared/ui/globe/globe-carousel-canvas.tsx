import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  type Group,
  MathUtils,
  type PerspectiveCamera,
  Vector3,
} from 'three';

import {
  GLOBE_BODY_IDS,
  GLOBE_MAPS,
  type GlobeBodyId,
  resolveGlobeConfig,
} from './bodies';
import { GLOBE_DEFAULTS, type GlobeConfig } from './config';
import { GlobeFx } from './fx/globe-composer';
import { Globe } from './globe';
import { type PlanetScreenPose, projectedRadius } from './lib/screen-pose';

const CAMERA = {
  fov: 32,
  near: 0.1,
  far: 80,
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
const OFFSET_DAMP = 3.2;
const POSE_DAMP = 5.5;
/** If target X jumps farther than this, the ring wrapped — snap, don't lerp through center. */
const WRAP_SNAP_X = SPACING * (RING_HALF - 0.25);

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

type MeasureBody = (body: GlobeBodyId) => PlanetScreenPose | null;

export type PlanetHoverPayload = {
  body: GlobeBodyId;
  clientX: number;
  clientY: number;
};

type CarouselSceneProps = {
  /** Continuous carousel offset; integer part aligns with active body. */
  offsetRef: RefObject<number>;
  targetOffsetRef: RefObject<number>;
  dragOffsetRef: RefObject<number>;
  fxConfigRef: RefObject<GlobeConfig>;
  onHoverPlanet?: (payload: PlanetHoverPayload | null) => void;
  hoveredBodyRef: RefObject<GlobeBodyId | null>;
  hiddenBodyRef: RefObject<GlobeBodyId | null>;
  measureRef: RefObject<MeasureBody | null>;
};

const CarouselScene = ({
  offsetRef,
  targetOffsetRef,
  dragOffsetRef,
  fxConfigRef,
  onHoverPlanet,
  hoveredBodyRef,
  hiddenBodyRef,
  measureRef,
}: CarouselSceneProps) => {
  const groupRefs = useRef<(Group | null)[]>([]);
  const ready = useRef(false);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const gl = useThree((state) => state.gl);

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

  useFrame((_, delta) => {
    offsetRef.current = MathUtils.damp(
      offsetRef.current,
      targetOffsetRef.current,
      OFFSET_DAMP,
      delta,
    );

    const visualOffset = offsetRef.current + (dragOffsetRef.current ?? 0);

    for (let index = 0; index < BODY_COUNT; index++) {
      const group = groupRefs.current[index];
      if (!group) continue;

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
      // through the center — snap while already faded out.
      const wrapped =
        ready.current && Math.abs(group.position.x - targetX) > WRAP_SNAP_X;

      if (!ready.current || wrapped) {
        group.position.set(targetX, 0, targetZ);
        group.scale.setScalar(targetScale);
        group.visible = targetScale > 0.03;
        continue;
      }

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

    const hidden = hiddenBodyRef.current;
    if (hidden) {
      const group = groupRefs.current[GLOBE_BODY_IDS.indexOf(hidden)];
      if (group) group.visible = false;
    }

    ready.current = true;
  });

  const bodyConfigs = useMemo(
    () =>
      GLOBE_BODY_IDS.map((body) => ({
        body,
        config: resolveGlobeConfig(body, {
          RADIUS: GLOBE_DEFAULTS.RADIUS,
          RESOLUTION: 280,
        }),
        colorUrl: GLOBE_MAPS[body].color,
      })),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={0.35} />

      {bodyConfigs.map(({ body, config, colorUrl }, index) => (
        <group
          key={body}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
        >
          <Globe config={config} colorUrl={colorUrl} enableFx={false} />
          {/* Invisible hit target — point cloud does not receive pointers. */}
          <mesh
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

export type GlobeCarouselCanvasProps = {
  activeBody: GlobeBodyId;
  onBodyChange: (body: GlobeBodyId) => void;
  onHoverPlanet?: (payload: PlanetHoverPayload | null) => void;
  /** `pose` is the planet's current screen placement (for seamless handoff). */
  onPlanetClick?: (body: GlobeBodyId, pose: PlanetScreenPose | null) => void;
  /** Planet taken over by another canvas — not drawn here. */
  hiddenBody?: GlobeBodyId | null;
  className?: string;
};

export const GlobeCarouselCanvas = ({
  activeBody,
  onBodyChange,
  onHoverPlanet,
  onPlanetClick,
  hiddenBody = null,
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
  const measureRef = useRef<MeasureBody | null>(null);

  // Hit meshes set a pointer cursor; don't leak it past unmount (e.g. navigation on click).
  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  const fxConfigRef = useRef(resolveGlobeConfig(activeBody));
  useEffect(() => {
    fxConfigRef.current = resolveGlobeConfig(activeBody);
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
    clickBodyRef.current = hoveredBodyRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || pointerX.current === null) return;
    const deltaPx = event.clientX - pointerX.current;
    if (Math.abs(deltaPx) > 6) {
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
    dragging.current = false;
    pointerX.current = null;
    dragOffsetRef.current = 0;
    clickBodyRef.current = null;

    if (Math.abs(deltaPx) < SWIPE_PX) {
      if (!dragMoved.current && clickedBody) {
        onPlanetClick?.(clickedBody, measureRef.current?.(clickedBody) ?? null);
      }
      dragMoved.current = false;
      return;
    }

    // Snap to the next slot — no residual drag / damp coast.
    const step = deltaPx < 0 ? 1 : -1;
    targetOffsetRef.current += step;
    offsetRef.current = targetOffsetRef.current;
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
        dpr={[1, 2]}
        gl={GL}
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
          hiddenBodyRef={hiddenBodyRef}
          measureRef={measureRef}
        />
      </Canvas>
    </div>
  );
};
