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

import {
  activeColonies,
  type Colony,
  type Individual,
  type Packet,
  position,
  type Simulation,
} from './model';

function arc(a: [number, number, number], b: [number, number, number]) {
  const start = new Vector3(...a),
    end = new Vector3(...b);
  return Array.from({ length: 20 }, (_, i) =>
    start
      .clone()
      .lerp(end, i / 19)
      .normalize()
      .multiplyScalar(2.36 + Math.sin((i / 19) * Math.PI) * 0.12),
  );
}

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

const PACKET_GEOMETRY = new SphereGeometry(0.028, 8, 8);
const PACKET_MATERIAL = new MeshBasicMaterial({
  color: '#ffffff',
  toneMapped: false,
});

type ColonyItemProps = {
  colony: Colony;
  group: Individual[];
  selected: boolean;
  showLinks: boolean;
  showLabels: boolean;
  occluder: RefObject<Mesh | null>;
  onSelect: (id: number) => void;
};

function ColonyItem({
  colony,
  group,
  selected,
  showLinks,
  showLabels,
  occluder,
  onSelect,
}: ColonyItemProps) {
  const groupRef = useRef<Group>(null);
  const htmlRef = useRef<HTMLButtonElement>(null);

  const center = useMemo(() => {
    const len = group.length || 1;
    return {
      lat: group.reduce((s, i) => s + i.lat, 0) / len,
      lon: group.reduce((s, i) => s + i.lon, 0) / len,
    };
  }, [group]);

  const centerPos = useMemo(
    () => new Vector3(...position(center, 2.35)),
    [center],
  );

  const boundary = useMemo(
    () =>
      Array.from({ length: 49 }, (_, k) =>
        position(
          {
            lat: center.lat + Math.sin((k / 48) * Math.PI * 2) * 0.2,
            lon: center.lon + Math.cos((k / 48) * Math.PI * 2) * 0.23,
          },
          2.35,
        ),
      ),
    [center],
  );

  const maxLinks = selected ? 16 : 5;
  const linkArcs = useMemo(() => {
    if (!showLinks) return [];
    return group.slice(1, maxLinks + 1).map((i, j) => ({
      id: i.id,
      points: arc(position(group[j]), position(i)),
    }));
  }, [group, showLinks, maxLinks]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    // Horizon occlusion test: P . C - |P|^2 > -0.35
    // Margin of -0.35 ensures colony edge doesn't clip prematurely.
    const pDotC = centerPos.dot(camera.position);
    const isVisible = pDotC - centerPos.lengthSq() > -0.35;

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
      {linkArcs.map(({ id, points }) => (
        <StableLine
          key={id}
          points={points}
          color={colony.color}
          transparent
          opacity={selected ? 0.9 : 0.6}
          lineWidth={selected ? 2.2 : 1.4}
        />
      ))}
      {showLabels && (
        <Html
          position={position(
            { lat: center.lat + 0.27, lon: center.lon },
            2.46,
          )}
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
}

function PacketItem({
  packet,
  fromInd,
  toInd,
  tick,
}: {
  packet: Packet;
  fromInd: Individual;
  toInd: Individual;
  tick: number;
}) {
  const groupRef = useRef<Group>(null);
  const fromPos = useMemo(() => position(fromInd), [fromInd]);
  const toPos = useMemo(() => position(toInd), [toInd]);
  const points = useMemo(() => arc(fromPos, toPos), [fromPos, toPos]);

  const idx = Math.min(
    19,
    Math.floor(
      ((tick - packet.sent) / (packet.arrival - packet.sent || 1)) * 19,
    ),
  );
  const currentPos = points[idx];

  useFrame(({ camera }) => {
    if (!groupRef.current || !currentPos) return;
    const pDotC = currentPos.dot(camera.position);
    const isVisible = pDotC - currentPos.lengthSq() > -0.1;
    if (groupRef.current.visible !== isVisible) {
      groupRef.current.visible = isVisible;
    }
  });

  return (
    <group ref={groupRef}>
      <StableLine
        points={points}
        color="#ffffff"
        transparent
        opacity={0.8}
        lineWidth={1.6}
      />
      {currentPos && (
        <mesh
          position={currentPos}
          geometry={PACKET_GEOMETRY}
          material={PACKET_MATERIAL}
        />
      )}
    </group>
  );
}

export function SurfaceLife({
  simulation,
  selected,
  showLinks,
  showLabels,
  onSelect,
}: {
  simulation: Simulation;
  selected: number | null;
  showLinks: boolean;
  showLabels: boolean;
  onSelect: (id: number) => void;
}) {
  const mesh = useRef<InstancedMesh>(null);
  // Cheap stand-in for the planet: label occlusion raycasts against this only,
  // not the whole scene (the globe's point cloud has 160k vertices).
  const occluder = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const outward = useMemo(() => new Vector3(), []);
  const color = useMemo(() => new Color(), []);
  const visible = simulation.individuals;

  useEffect(() => {
    const target = mesh.current;
    if (!target) return;
    target.count = visible.length;
    visible.forEach((i, index) => {
      const colony = simulation.colonies.find((c) => c.id === i.colony);
      target.setColorAt(
        index,
        color.set(
          i.dead !== null
            ? '#ff5d66'
            : i.action === 'divide'
              ? '#ffffff'
              : i.energy < 18
                ? '#ff805e'
                : (colony?.color ?? '#70e0c4'),
        ),
      );
    });
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, [visible, simulation.colonies, color]);

  const positions = useMemo(
    () => visible.map((i) => position(i)),
    [visible],
  );

  const colonyMembers = useMemo(() => {
    const map = new Map<number, Individual[]>();
    for (const i of simulation.individuals) {
      if (i.dead !== null) continue;
      let arr = map.get(i.colony);
      if (!arr) {
        arr = [];
        map.set(i.colony, arr);
      }
      arr.push(i);
    }
    return map;
  }, [simulation.individuals]);

  useFrame(({ clock, camera }) => {
    const target = mesh.current;
    if (!target) return;
    visible.forEach((i, index) => {
      const pos = positions[index];
      if (!pos) return;
      dummy.position.set(pos[0], pos[1], pos[2]);

      // Occlusion culling: if individual is on back side of sphere, set scale 0 and skip
      const pDotC = dummy.position.dot(camera.position);
      if (pDotC - dummy.position.lengthSq() <= -0.05) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        target.setMatrixAt(index, dummy.matrix);
        return;
      }

      dummy.lookAt(outward.copy(dummy.position).multiplyScalar(2));
      const age = simulation.tick - i.born;
      const birthScale = Math.min(1, (age + 1) / 8);
      const deathScale =
        i.dead === null ? 1 : Math.max(0, 1 - (simulation.tick - i.dead) / 16);
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + i.id) * 0.13;
      const scale =
        (i.colony === selected ? 1.2 : 1) * birthScale * deathScale * pulse;
      dummy.scale.set(0.052 * scale, 0.052 * scale, 0.088 * scale);
      dummy.updateMatrix();
      target.setMatrixAt(index, dummy.matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  });

  const colonies = activeColonies(simulation);

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
          const individual = visible[e.instanceId ?? -1];
          if (!individual) return;
          const pos = positions[e.instanceId ?? -1] ?? position(individual);
          dummy.position.set(pos[0], pos[1], pos[2]);
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
      {colonies.map((c) => (
        <ColonyItem
          key={c.id}
          colony={c}
          group={colonyMembers.get(c.id) ?? []}
          selected={selected === c.id}
          showLinks={showLinks}
          showLabels={showLabels}
          occluder={occluder}
          onSelect={onSelect}
        />
      ))}
      {showLinks &&
        simulation.packets.slice(-35).map((p) => {
          const from = visible.find((i) => i.id === p.from);
          const to = visible.find((i) => i.id === p.to);
          if (!from || !to) return null;
          return (
            <PacketItem
              key={`${p.from}-${p.to}-${p.sent}`}
              packet={p}
              fromInd={from}
              toInd={to}
              tick={simulation.tick}
            />
          );
        })}
    </group>
  );
}
