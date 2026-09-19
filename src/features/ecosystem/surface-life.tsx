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
  type InstancedMesh,
  type Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';

import { cn } from '@/shared/lib/utils';

import {
  activeColonies,
  type Colony,
  type Individual,
  type Simulation,
} from './model';

type Vec3 = [number, number, number];

const ARC_STEPS = 20;
const DEFAULT_RADIUS = 2.33;
const BOUNDARY_RADIUS = 2.35;
const LABEL_RADIUS = 2.45;

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

/**
 * Great-circle bump between two surface points. Writes into a caller-owned
 * buffer so a 10 Hz stream never allocates 20 Vector3s per link.
 */
const writeArc = (out: Vec3[], a: Vec3, b: Vec3) => {
  for (let i = 0; i < ARC_STEPS; i++) {
    const t = i / (ARC_STEPS - 1);
    let x = a[0] + (b[0] - a[0]) * t;
    let y = a[1] + (b[1] - a[1]) * t;
    let z = a[2] + (b[2] - a[2]) * t;
    const len = Math.hypot(x, y, z) || 1;
    const r = 2.36 + Math.sin(t * Math.PI) * 0.12;
    const point = out[i];
    point[0] = (x / len) * r;
    point[1] = (y / len) * r;
    point[2] = (z / len) * r;
  }
  return out;
};

/** Copy an arc buffer into a fresh tuple array for StableLine / drei. */
const snapshotArc = (buf: Vec3[]): Vec3[] =>
  buf.map((p) => [p[0], p[1], p[2]] as Vec3);

type LinePoints = ComponentProps<typeof Line>['points'];

const coords = (
  p: LinePoints[number],
): readonly (number | undefined)[] | null => {
  if (p instanceof Vector3) return [p.x, p.y, p.z];
  return Array.isArray(p) ? p : null;
};

const samePoints = (a: LinePoints, b: LinePoints) => {
  if (a === b) return true;
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
 * drei's Line rebuilds its geometry (and disposes its material) whenever the
 * `points` array identity changes. Points here are rebuilt every simulation
 * tick, so keep the previous array while the coordinates are unchanged —
 * otherwise every tick re-uploads all line buffers and relinks the shader.
 */
const StableLine = ({ points, ...rest }: ComponentProps<typeof Line>) => {
  const stable = useRef(points);
  if (!samePoints(stable.current, points)) stable.current = points;
  return <Line points={stable.current} {...rest} />;
};

const PACKET_GEOMETRY = new SphereGeometry(0.017, 6, 6);
const PACKET_MATERIAL = new MeshBasicMaterial({
  color: '#fff4c4',
  toneMapped: false,
});

type ColonyView = {
  colony: Colony;
  group: Individual[];
  center: { lat: number; lon: number };
  boundary: Vec3[];
  links: { id: number; points: Vec3[] }[];
  labelPosition: Vec3;
};

type PacketView = {
  key: string;
  points: Vec3[];
  head: Vec3;
};

type SurfaceLifeProps = {
  simulation: Simulation;
  selected: number | null;
  showLinks: boolean;
  showLabels: boolean;
  onSelect: (id: number) => void;
};

/**
 * Build the per-colony / per-packet line geometry in one O(n) pass. The WS
 * stream replaces `simulation` up to 10 Hz, so this still runs that often —
 * but never O(colonies × living) with a fresh `living()` filter each time.
 */
const buildSceneViews = (
  simulation: Simulation,
  showLinks: boolean,
): { colonyViews: ColonyView[]; packetViews: PacketView[] } => {
  const alive = simulation.individuals.filter((i) => i.dead === null);
  const byColony = new Map<number, Individual[]>();
  const byId = new Map<number, Individual>();

  for (const individual of alive) {
    byId.set(individual.id, individual);
    const list = byColony.get(individual.colony);
    if (list) list.push(individual);
    else byColony.set(individual.colony, [individual]);
  }

  const scratchA: Vec3 = [0, 0, 0];
  const scratchB: Vec3 = [0, 0, 0];
  const scratchArc = makeArcBuffer();

  const colonyViews: ColonyView[] = [];
  for (const colony of activeColonies(simulation)) {
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

    const boundary: Vec3[] = Array.from({ length: 49 }, (_, k) => {
      const point: Vec3 = [0, 0, 0];
      writePosition(
        point,
        center.lat + Math.sin((k / 48) * Math.PI * 2) * 0.2,
        center.lon + Math.cos((k / 48) * Math.PI * 2) * 0.23,
        BOUNDARY_RADIUS,
      );
      return point;
    });

    const links: ColonyView['links'] = [];
    if (showLinks) {
      for (let j = 1; j < group.length; j++) {
        writePosition(scratchA, group[j - 1].lat, group[j - 1].lon);
        writePosition(scratchB, group[j].lat, group[j].lon);
        writeArc(scratchArc, scratchA, scratchB);
        links.push({ id: group[j].id, points: snapshotArc(scratchArc) });
      }
    }

    const labelPosition: Vec3 = [0, 0, 0];
    writePosition(
      labelPosition,
      center.lat + 0.27,
      center.lon,
      LABEL_RADIUS,
    );

    colonyViews.push({
      colony,
      group,
      center,
      boundary,
      links,
      labelPosition,
    });
  }

  const packetViews: PacketView[] = [];
  if (showLinks) {
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
      const points = snapshotArc(scratchArc);
      const travel = packet.arrival - packet.sent;
      const idx =
        travel <= 0
          ? 0
          : Math.min(
              ARC_STEPS - 1,
              Math.floor(((simulation.tick - packet.sent) / travel) * (ARC_STEPS - 1)),
            );

      packetViews.push({
        key: `${packet.from}-${packet.to}-${packet.sent}`,
        points,
        head: points[idx],
      });
    }
  }

  return { colonyViews, packetViews };
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
  const visible = simulation.individuals;

  const colonyColorById = useMemo(() => {
    const map = new Map<number, string>();
    for (const colony of simulation.colonies) {
      map.set(colony.id, colony.color);
    }
    return map;
  }, [simulation.colonies]);

  const { colonyViews, packetViews } = useMemo(
    () => buildSceneViews(simulation, showLinks),
    [simulation, showLinks],
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
            ? '#ff5d66'
            : individual.action === 'divide'
              ? '#ffffff'
              : individual.energy < 18
                ? '#ff805e'
                : (colonyColorById.get(individual.colony) ?? '#70e0c4'),
        ),
      );
    }
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, [visible, colonyColorById, color]);

  useFrame(({ clock }) => {
    const target = mesh.current;
    if (!target) return;
    const tick = simulation.tick;
    for (let index = 0; index < visible.length; index++) {
      const individual = visible[index];
      // Write cartesian coords straight into the Object3D — no per-frame array.
      const cosLat = Math.cos(individual.lat);
      dummy.position.set(
        DEFAULT_RADIUS * cosLat * Math.sin(individual.lon),
        DEFAULT_RADIUS * Math.sin(individual.lat),
        DEFAULT_RADIUS * cosLat * Math.cos(individual.lon),
      );
      dummy.lookAt(outward.copy(dummy.position).multiplyScalar(2));
      const age = tick - individual.born;
      const birthScale = Math.min(1, (age + 1) / 8);
      const deathScale =
        individual.dead === null
          ? 1
          : Math.max(0, 1 - (tick - individual.dead) / 16);
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + individual.id) * 0.13;
      const scale =
        (individual.colony === selected ? 1.2 : 1) *
        birthScale *
        deathScale *
        pulse;
      dummy.scale.set(0.027 * scale, 0.027 * scale, 0.048 * scale);
      dummy.updateMatrix();
      target.setMatrixAt(index, dummy.matrix);
    }
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
        args={[undefined, undefined, 220]}
        frustumCulled={false}
        onClick={(e) => {
          e.stopPropagation();
          const individual = visible[e.instanceId ?? -1];
          if (individual) onSelect(individual.colony);
        }}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {colonyViews.map(
        ({ colony, group, boundary, links, labelPosition }) => (
          <group key={colony.id}>
            <StableLine
              points={boundary}
              color={colony.color}
              transparent
              opacity={selected === colony.id ? 0.6 : 0.17}
              lineWidth={selected === colony.id ? 1.3 : 0.6}
            />
            {showLinks &&
              links.map((link) => (
                <StableLine
                  key={link.id}
                  points={link.points}
                  color={colony.color}
                  transparent
                  opacity={selected === colony.id ? 0.43 : 0.18}
                  lineWidth={0.7}
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
                  type="button"
                  className={cn(
                    '[font:8px_monospace] tracking-[1px] text-[var(--colony-color)] border border-[#65868355] bg-[#0b161ee8] rounded-[4px] whitespace-nowrap py-1.5 px-[7px] flex items-center gap-1.5 shadow-[0_2px_15px_#0005]',
                    selected === colony.id &&
                      'border-[var(--colony-color)] bg-[#19312cf0]',
                  )}
                  style={{ '--colony-color': colony.color } as CSSProperties}
                  onClick={() => onSelect(colony.id)}
                >
                  <span className="size-1 bg-[var(--colony-color)] rounded-full" />{' '}
                  C—{String(colony.id).padStart(2, '0')}{' '}
                  <small className="text-[#9dafb8] border-l border-[#ffffff25] pl-[5px]">
                    {group.length}
                  </small>
                </button>
              </Html>
            )}
          </group>
        ),
      )}
      {showLinks &&
        packetViews.map((packet) => (
          <group key={packet.key}>
            <StableLine
              points={packet.points}
              color="#ffffff"
              transparent
              opacity={0.45}
              lineWidth={1}
            />
            <mesh
              position={packet.head}
              geometry={PACKET_GEOMETRY}
              material={PACKET_MATERIAL}
            />
          </group>
        ))}
    </group>
  );
};
