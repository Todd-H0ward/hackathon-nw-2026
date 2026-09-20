import {
  type ComponentProps,
  type CSSProperties,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Html, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  type Group,
  type InstancedMesh,
  type Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';

import { cn } from '@/shared/lib/utils';

import type { Colony, Individual, Simulation } from './model';
import { LOW_ENERGY_THRESHOLD, SURFACE_MARKER } from './surface-markers';

type Vec3 = [number, number, number];

const ARC_STEPS = 20;
const BOUNDARY_STEPS = 49;
const DEFAULT_RADIUS = 2.33;
const BOUNDARY_RADIUS = 2.35;
const LABEL_RADIUS = 2.46;
/** Rebuild colony boundary/link polylines every N sim ticks (packets update every tick). */
const COLONY_GEOMETRY_STRIDE = 2;

const Z_AXIS = new Vector3(0, 0, 1);

/** Spherical → cartesian into a reusable tuple (no per-call array alloc). */
const writePosition = (
  out: Vec3,
  lat: number,
  lon: number,
  radius = DEFAULT_RADIUS,
) => {
  const cosLat = Math.cos(lat);
  out[0] = radius * cosLat * Math.sin(lon);
  out[1] = radius * Math.sin(lat);
  out[2] = radius * cosLat * Math.cos(lon);
  return out;
};

const makeArcBuffer = (): Vec3[] =>
  Array.from({ length: ARC_STEPS }, () => [0, 0, 0] as Vec3);

const makeBoundaryBuffer = (): Vec3[] =>
  Array.from({ length: BOUNDARY_STEPS }, () => [0, 0, 0] as Vec3);

const copyVec3Array = (dst: Vec3[], src: Vec3[]) => {
  for (let i = 0; i < src.length; i++) {
    const d = dst[i];
    const s = src[i];
    d[0] = s[0];
    d[1] = s[1];
    d[2] = s[2];
  }
};

const sameVec3Array = (a: Vec3[], b: Vec3[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      Math.abs(a[i][0] - b[i][0]) > 1e-5 ||
      Math.abs(a[i][1] - b[i][1]) > 1e-5 ||
      Math.abs(a[i][2] - b[i][2]) > 1e-5
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Publish scratch coords into a stable array identity. Returns the previous
 * published buffer when coordinates are unchanged so drei Line can skip work.
 */
const publishVec3Array = (
  cache: Map<string, Vec3[]>,
  key: string,
  scratch: Vec3[],
  factory: () => Vec3[],
): Vec3[] => {
  const prev = cache.get(key);
  if (prev && sameVec3Array(prev, scratch)) return prev;
  const out = prev ?? factory();
  copyVec3Array(out, scratch);
  if (!prev) cache.set(key, out);
  return out;
};

/**
 * Great-circle bump between two surface points. Writes into a caller-owned
 * buffer so a 10 Hz stream never allocates 20 Vector3s per link.
 */
const writeArc = (out: Vec3[], a: Vec3, b: Vec3) => {
  for (let i = 0; i < ARC_STEPS; i++) {
    const t = i / (ARC_STEPS - 1);
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const z = a[2] + (b[2] - a[2]) * t;
    const len = Math.hypot(x, y, z) || 1;
    const r = 2.36 + Math.sin(t * Math.PI) * 0.12;
    const point = out[i];
    point[0] = (x / len) * r;
    point[1] = (y / len) * r;
    point[2] = (z / len) * r;
  }
  return out;
};

type LinePoints = ComponentProps<typeof Line>['points'];

const coords = (
  p: LinePoints[number],
): readonly (number | undefined)[] | null => {
  if (p instanceof Vector3) return [p.x, p.y, p.z];
  return Array.isArray(p) ? p : null;
};

const samePoints = (a: LinePoints, b: LinePoints) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const pa = coords(a[i]);
    const pb = coords(b[i]);
    if (!pa || !pb || pa.length !== pb.length) return a[i] === b[i];
    for (let k = 0; k < pa.length; k++) {
      if (Math.abs((pa[k] ?? 0) - (pb[k] ?? 0)) > 1e-6) return false;
    }
  }
  return true;
};

/**
 * drei's Line rebuilds geometry when the `points` identity changes. We keep a
 * shadow copy of the last uploaded coords so in-place pool mutations still
 * trigger an update when values move, and skip when they don't.
 */
const StableLine = ({ points, ...rest }: ComponentProps<typeof Line>) => {
  const published = useRef(points);
  const shadow = useRef<LinePoints | null>(null);

  if (!shadow.current || !samePoints(shadow.current, points)) {
    // Clone tuples so drei sees a new identity when coordinates change.
    published.current = (points as Vec3[]).map(
      (p) => [p[0], p[1], p[2]] as Vec3,
    );
    shadow.current = published.current;
  }

  return <Line points={published.current} {...rest} />;
};

const PACKET_GEOMETRY = new SphereGeometry(0.028, 8, 8);
const PACKET_MATERIAL = new MeshBasicMaterial({
  color: SURFACE_MARKER.packet,
  toneMapped: false,
});

type ColonyView = {
  colony: Colony;
  group: Individual[];
  center: { lat: number; lon: number };
  centerPos: Vec3;
  boundary: Vec3[];
  links: { id: number; points: Vec3[] }[];
  labelPosition: Vec3;
};

type PacketView = {
  key: string;
  points: Vec3[];
  head: Vec3;
};

type SceneViewCache = {
  structureKey: string;
  colonyTick: number;
  packetTick: number;
  colonyViews: ColonyView[];
  packetViews: PacketView[];
  boundaryPool: Map<string, Vec3[]>;
  linkPool: Map<string, Vec3[]>;
  packetPool: Map<string, Vec3[]>;
  scratchA: Vec3;
  scratchB: Vec3;
  scratchArc: Vec3[];
  scratchBoundary: Vec3[];
};

const createSceneViewCache = (): SceneViewCache => ({
  structureKey: '',
  colonyTick: -1,
  packetTick: -1,
  colonyViews: [],
  packetViews: [],
  boundaryPool: new Map(),
  linkPool: new Map(),
  packetPool: new Map(),
  scratchA: [0, 0, 0],
  scratchB: [0, 0, 0],
  scratchArc: makeArcBuffer(),
  scratchBoundary: makeBoundaryBuffer(),
});

const structureKeyOf = (
  simulation: Simulation,
  showLinks: boolean,
  selected: number | null,
) => {
  let alive = 0;
  let dead = 0;
  for (const individual of simulation.individuals) {
    if (individual.dead === null) alive += 1;
    else dead += 1;
  }
  return `${simulation.body}|${selected}|${showLinks ? 1 : 0}|${simulation.colonies.length}|${alive}|${dead}|${simulation.packets.length}`;
};

const rebuildColonyViews = (
  cache: SceneViewCache,
  simulation: Simulation,
  showLinks: boolean,
  selected: number | null,
  byColony: Map<number, Individual[]>,
) => {
  const { scratchA, scratchB, scratchArc, scratchBoundary } = cache;
  const colonyViews: ColonyView[] = [];

  for (const colony of simulation.colonies) {
    const group = byColony.get(colony.id);
    if (!group || group.length === 0) continue;

    let latSum = 0;
    let lonSum = 0;
    for (const member of group) {
      latSum += member.lat;
      lonSum += member.lon;
    }
    const center = {
      lat: latSum / group.length,
      lon: lonSum / group.length,
    };

    const centerPos: Vec3 = [0, 0, 0];
    writePosition(centerPos, center.lat, center.lon, BOUNDARY_RADIUS);

    for (let k = 0; k < BOUNDARY_STEPS; k++) {
      writePosition(
        scratchBoundary[k],
        center.lat + Math.sin((k / (BOUNDARY_STEPS - 1)) * Math.PI * 2) * 0.2,
        center.lon + Math.cos((k / (BOUNDARY_STEPS - 1)) * Math.PI * 2) * 0.23,
        BOUNDARY_RADIUS,
      );
    }
    const boundary = publishVec3Array(
      cache.boundaryPool,
      `b:${colony.id}`,
      scratchBoundary,
      makeBoundaryBuffer,
    );

    const links: ColonyView['links'] = [];
    if (showLinks) {
      const maxLinks = selected === colony.id ? 16 : 5;
      const linkCount = Math.min(group.length - 1, maxLinks);
      for (let j = 1; j <= linkCount; j++) {
        writePosition(scratchA, group[j - 1].lat, group[j - 1].lon);
        writePosition(scratchB, group[j].lat, group[j].lon);
        writeArc(scratchArc, scratchA, scratchB);
        const points = publishVec3Array(
          cache.linkPool,
          `l:${colony.id}:${group[j].id}`,
          scratchArc,
          makeArcBuffer,
        );
        links.push({ id: group[j].id, points });
      }
    }

    const labelPosition: Vec3 = [0, 0, 0];
    writePosition(labelPosition, center.lat + 0.27, center.lon, LABEL_RADIUS);

    colonyViews.push({
      colony,
      group,
      center,
      centerPos,
      boundary,
      links,
      labelPosition,
    });
  }

  cache.colonyViews = colonyViews;
  cache.colonyTick = simulation.tick;
};

const rebuildPacketViews = (
  cache: SceneViewCache,
  simulation: Simulation,
  byId: Map<number, Individual>,
) => {
  const { scratchA, scratchB, scratchArc } = cache;
  const packetViews: PacketView[] = [];
  const packets = simulation.packets;
  const start = Math.max(0, packets.length - 35);

  for (let i = start; i < packets.length; i++) {
    const packet = packets[i];
    const from = byId.get(packet.from);
    const to = byId.get(packet.to);
    if (!from || !to) continue;

    writePosition(scratchA, from.lat, from.lon);
    writePosition(scratchB, to.lat, to.lon);
    writeArc(scratchArc, scratchA, scratchB);
    const key = `${packet.from}-${packet.to}-${packet.sent}`;
    const points = publishVec3Array(
      cache.packetPool,
      key,
      scratchArc,
      makeArcBuffer,
    );
    const travel = packet.arrival - packet.sent;
    const idx =
      travel <= 0
        ? 0
        : Math.min(
            ARC_STEPS - 1,
            Math.floor(
              ((simulation.tick - packet.sent) / travel) * (ARC_STEPS - 1),
            ),
          );

    packetViews.push({
      key,
      points,
      head: [points[idx][0], points[idx][1], points[idx][2]],
    });
  }

  cache.packetViews = packetViews;
  cache.packetTick = simulation.tick;
};

/**
 * Build / refresh colony + packet line geometry with pooled buffers.
 * Colony polylines throttle to every COLONY_GEOMETRY_STRIDE ticks unless the
 * membership/selection structure changes; packet heads refresh every tick.
 */
const syncSceneViews = (
  cache: SceneViewCache,
  simulation: Simulation,
  showLinks: boolean,
  selected: number | null,
): { colonyViews: ColonyView[]; packetViews: PacketView[] } => {
  const byColony = new Map<number, Individual[]>();
  const byId = new Map<number, Individual>();

  for (const individual of simulation.individuals) {
    if (individual.dead !== null) continue;
    byId.set(individual.id, individual);
    const list = byColony.get(individual.colony);
    if (list) list.push(individual);
    else byColony.set(individual.colony, [individual]);
  }

  const structureKey = structureKeyOf(simulation, showLinks, selected);
  const structureChanged = structureKey !== cache.structureKey;
  const colonyDue =
    structureChanged ||
    simulation.tick - cache.colonyTick >= COLONY_GEOMETRY_STRIDE ||
    cache.colonyTick < 0;

  if (colonyDue) {
    rebuildColonyViews(cache, simulation, showLinks, selected, byColony);
    cache.structureKey = structureKey;
  }

  if (showLinks) {
    if (structureChanged || simulation.tick !== cache.packetTick) {
      rebuildPacketViews(cache, simulation, byId);
    }
  } else if (cache.packetViews.length > 0) {
    cache.packetViews = [];
    cache.packetTick = simulation.tick;
  }

  return {
    colonyViews: cache.colonyViews,
    packetViews: cache.packetViews,
  };
};

interface SurfaceLifeProps {
  simulation: Simulation;
  selected: number | null;
  showLinks: boolean;
  showLabels: boolean;
  onSelect: (id: number) => void;
}

interface ColonyOverlayProps {
  view: ColonyView;
  selected: boolean;
  showLinks: boolean;
  showLabels: boolean;
  occluder: RefObject<Mesh | null>;
  onSelect: (id: number) => void;
}

/** Horizon occlusion + bright colony chrome; geometry comes from the parent memo. */
const ColonyOverlay = ({
  view,
  selected,
  showLinks,
  showLabels,
  occluder,
  onSelect,
}: ColonyOverlayProps) => {
  const { colony, group, centerPos, boundary, links, labelPosition } = view;
  const groupRef = useRef<Group>(null);
  const htmlRef = useRef<HTMLButtonElement>(null);
  const centerVec = useMemo(
    () => new Vector3(centerPos[0], centerPos[1], centerPos[2]),
    [centerPos],
  );

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    // Horizon occlusion: P · C − |P|² > −0.35 (margin so edges don't clip early).
    const pDotC = centerVec.dot(camera.position);
    const isVisible = pDotC - centerVec.lengthSq() > -0.35;

    if (groupRef.current.visible !== isVisible) {
      groupRef.current.visible = isVisible;
    }
    if (htmlRef.current) {
      const targetDisplay = isVisible ? 'flex' : 'none';
      if (htmlRef.current.style.display !== targetDisplay) {
        htmlRef.current.style.display = targetDisplay;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <StableLine
        points={boundary}
        color={colony.color}
        transparent
        opacity={selected ? 0.95 : 0.65}
        lineWidth={selected ? 2.8 : 1.8}
      />
      {showLinks &&
        links.map((link) => (
          <StableLine
            key={link.id}
            points={link.points}
            color={colony.color}
            transparent
            opacity={selected ? 0.9 : 0.6}
            lineWidth={selected ? 2.2 : 1.4}
          />
        ))}
      {showLabels && (
        <Html
          position={labelPosition}
          center
          occlude={[occluder as RefObject<Object3D>]}
          zIndexRange={[9, 0]}
        >
          <button
            ref={htmlRef}
            type="button"
            className={cn(
              '[font:10px_monospace] font-semibold tracking-[1.2px] text-[var(--colony-color)] border border-[var(--colony-color)]/60 bg-[#050b11f5] rounded-[5px] whitespace-nowrap py-1.5 px-[9px] flex items-center gap-2 shadow-[0_4px_25px_#000000dd] backdrop-blur-md transition-all hover:scale-105',
              selected &&
                'border-[var(--colony-color)] bg-[#0d221ffc] ring-1 ring-[var(--colony-color)]/90 scale-110',
            )}
            style={{ '--colony-color': colony.color } as CSSProperties}
            onClick={() => onSelect(colony.id)}
          >
            <span className="size-1.5 bg-[var(--colony-color)] rounded-full shadow-[0_0_10px_var(--colony-color)]" />{' '}
            C—{String(colony.id).padStart(2, '0')}{' '}
            <small className="text-[#b0c4cf] border-l border-[#ffffff35] pl-[6px] text-[9px] font-normal">
              {group.length}
            </small>
          </button>
        </Html>
      )}
    </group>
  );
};

interface PacketOverlayProps {
  view: PacketView;
}

const PacketOverlay = ({ view }: PacketOverlayProps) => {
  const groupRef = useRef<Group>(null);
  const headVec = useMemo(
    () => new Vector3(view.head[0], view.head[1], view.head[2]),
    [view.head],
  );

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const pDotC = headVec.dot(camera.position);
    const isVisible = pDotC - headVec.lengthSq() > -0.1;
    if (groupRef.current.visible !== isVisible) {
      groupRef.current.visible = isVisible;
    }
  });

  return (
    <group ref={groupRef}>
      <StableLine
        points={view.points}
        color={SURFACE_MARKER.packet}
        transparent
        opacity={0.8}
        lineWidth={1.6}
      />
      <mesh
        position={view.head}
        geometry={PACKET_GEOMETRY}
        material={PACKET_MATERIAL}
      />
    </group>
  );
};

export const SurfaceLife = ({
  simulation,
  selected,
  showLinks,
  showLabels,
  onSelect,
}: SurfaceLifeProps) => {
  const mesh = useRef<InstancedMesh>(null);
  // Cheap stand-in for the planet: label occlusion raycasts against this only,
  // not the whole scene (the globe's point cloud has 160k vertices).
  const occluder = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const outward = useMemo(() => new Vector3(), []);
  const color = useMemo(() => new Color(), []);
  const sceneCache = useRef(createSceneViewCache());
  const visible = simulation.individuals;
  const simRef = useRef(simulation);
  const visibleRef = useRef(visible);
  const selectedRef = useRef(selected);
  simRef.current = simulation;
  visibleRef.current = visible;
  selectedRef.current = selected;

  const colonyColorById = useMemo(() => {
    const map = new Map<number, string>();
    for (const colony of simulation.colonies) {
      map.set(colony.id, colony.color);
    }
    return map;
  }, [simulation.colonies]);

  const { colonyViews, packetViews } = useMemo(
    () => syncSceneViews(sceneCache.current, simulation, showLinks, selected),
    [simulation, showLinks, selected],
  );

  useEffect(() => {
    const target = mesh.current;
    if (!target) return;
    target.count = visible.length;
    for (let index = 0; index < visible.length; index++) {
      const individual = visible[index];
      target.setColorAt(
        index,
        color.set(
          individual.dead !== null
            ? SURFACE_MARKER.dead
            : individual.action === 'divide'
              ? SURFACE_MARKER.divide
              : individual.energy < LOW_ENERGY_THRESHOLD
                ? SURFACE_MARKER.lowEnergy
                : (colonyColorById.get(individual.colony) ??
                  SURFACE_MARKER.individual),
        ),
      );
    }
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, [visible, colonyColorById, color]);

  useFrame(({ clock, camera }) => {
    const target = mesh.current;
    if (!target) return;
    const individuals = visibleRef.current;
    const tick = simRef.current.tick;
    const selectedId = selectedRef.current;
    const t = clock.elapsedTime * 2;

    for (let index = 0; index < individuals.length; index++) {
      const individual = individuals[index];
      const cosLat = Math.cos(individual.lat);
      const x = DEFAULT_RADIUS * cosLat * Math.sin(individual.lon);
      const y = DEFAULT_RADIUS * Math.sin(individual.lat);
      const z = DEFAULT_RADIUS * cosLat * Math.cos(individual.lon);
      dummy.position.set(x, y, z);

      // Back-face cull: hide individuals on the far side of the sphere.
      const pDotC = dummy.position.dot(camera.position);
      if (pDotC - dummy.position.lengthSq() <= -0.05) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        target.setMatrixAt(index, dummy.matrix);
        continue;
      }

      // Orient along surface normal — cheaper than lookAt each instance.
      const len = Math.hypot(x, y, z) || 1;
      outward.set(x / len, y / len, z / len);
      dummy.quaternion.setFromUnitVectors(Z_AXIS, outward);

      const age = tick - individual.born;
      const birthScale = Math.min(1, (age + 1) / 8);
      const deathScale =
        individual.dead === null
          ? 1
          : Math.max(0, 1 - (tick - individual.dead) / 16);
      const pulse =
        individual.dead !== null ? 1 : 1 + Math.sin(t + individual.id) * 0.13;
      const scale =
        (individual.colony === selectedId ? 1.2 : 1) *
        birthScale *
        deathScale *
        pulse;
      dummy.scale.set(0.052 * scale, 0.052 * scale, 0.088 * scale);
      dummy.updateMatrix();
      target.setMatrixAt(index, dummy.matrix);
    }
    target.count = individuals.length;
    target.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.27, 48, 48]} />
        <meshBasicMaterial color="#05080d" />
      </mesh>
      <mesh ref={occluder} visible={false}>
        <sphereGeometry args={[2.3, 16, 12]} />
      </mesh>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Three.js mesh; equivalent keyboard controls are the colony list buttons. */}
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, 2500]}
        frustumCulled={false}
        onClick={(e) => {
          e.stopPropagation();
          const individual = visibleRef.current[e.instanceId ?? -1];
          if (!individual) return;
          const cosLat = Math.cos(individual.lat);
          dummy.position.set(
            DEFAULT_RADIUS * cosLat * Math.sin(individual.lon),
            DEFAULT_RADIUS * Math.sin(individual.lat),
            DEFAULT_RADIUS * cosLat * Math.cos(individual.lon),
          );
          if (
            dummy.position.dot(e.camera.position) - dummy.position.lengthSq() >
            -0.05
          ) {
            onSelect(individual.colony);
          }
        }}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {colonyViews.map((view) => (
        <ColonyOverlay
          key={view.colony.id}
          view={view}
          selected={selected === view.colony.id}
          showLinks={showLinks}
          showLabels={showLabels}
          occluder={occluder}
          onSelect={onSelect}
        />
      ))}
      {showLinks &&
        packetViews.map((view) => <PacketOverlay key={view.key} view={view} />)}
    </group>
  );
};
