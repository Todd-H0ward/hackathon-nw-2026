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

import { activeColonies, members, position, type Simulation } from './model';

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

const PACKET_GEOMETRY = new SphereGeometry(0.017, 6, 6);
const PACKET_MATERIAL = new MeshBasicMaterial({
  color: '#fff4c4',
  toneMapped: false,
});

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
  useFrame(({ clock }) => {
    const target = mesh.current;
    if (!target) return;
    visible.forEach((i, index) => {
      dummy.position.set(...position(i));
      dummy.lookAt(outward.copy(dummy.position).multiplyScalar(2));
      const age = simulation.tick - i.born;
      const birthScale = Math.min(1, (age + 1) / 8);
      const deathScale =
        i.dead === null ? 1 : Math.max(0, 1 - (simulation.tick - i.dead) / 16);
      const pulse = 1 + Math.sin(clock.elapsedTime * 2 + i.id) * 0.13;
      const scale =
        (i.colony === selected ? 1.2 : 1) * birthScale * deathScale * pulse;
      dummy.scale.set(0.027 * scale, 0.027 * scale, 0.048 * scale);
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
      {colonies.map((c) => {
        const group = members(simulation, c.id);
        const center = {
          lat: group.reduce((s, i) => s + i.lat, 0) / group.length,
          lon: group.reduce((s, i) => s + i.lon, 0) / group.length,
        };
        const boundary = Array.from({ length: 49 }, (_, k) =>
          position(
            {
              lat: center.lat + Math.sin((k / 48) * Math.PI * 2) * 0.2,
              lon: center.lon + Math.cos((k / 48) * Math.PI * 2) * 0.23,
            },
            2.35,
          ),
        );
        return (
          <group key={c.id}>
            <StableLine
              points={boundary}
              color={c.color}
              transparent
              opacity={selected === c.id ? 0.6 : 0.17}
              lineWidth={selected === c.id ? 1.3 : 0.6}
            />
            {showLinks &&
              group
                .slice(1)
                .map((i, j) => (
                  <StableLine
                    key={i.id}
                    points={arc(position(group[j]), position(i))}
                    color={c.color}
                    transparent
                    opacity={selected === c.id ? 0.43 : 0.18}
                    lineWidth={0.7}
                  />
                ))}
            {showLabels && (
              <Html
                position={position(
                  { lat: center.lat + 0.27, lon: center.lon },
                  2.45,
                )}
                center
                occlude={[occluder as RefObject<Object3D>]}
                zIndexRange={[9, 0]}
              >
                <button
                  type="button"
                  className={cn(
                    '[font:8px_monospace] tracking-[1px] text-[var(--colony-color)] border border-[#65868355] bg-[#0b161ee8] rounded-[4px] whitespace-nowrap py-1.5 px-[7px] flex items-center gap-1.5 shadow-[0_2px_15px_#0005]',
                    selected === c.id &&
                      'border-[var(--colony-color)] bg-[#19312cf0]',
                  )}
                  style={{ '--colony-color': c.color } as CSSProperties}
                  onClick={() => onSelect(c.id)}
                >
                  <span className="size-1 bg-[var(--colony-color)] rounded-full" />{' '}
                  C—{String(c.id).padStart(2, '0')}{' '}
                  <small className="text-[#9dafb8] border-l border-[#ffffff25] pl-[5px]">
                    {group.length}
                  </small>
                </button>
              </Html>
            )}
          </group>
        );
      })}
      {showLinks &&
        simulation.packets.slice(-35).map((p) => {
          const from = visible.find((i) => i.id === p.from),
            to = visible.find((i) => i.id === p.to);
          if (!from || !to) return null;
          const points = arc(position(from), position(to));
          const idx = Math.min(
            19,
            Math.floor(
              ((simulation.tick - p.sent) / (p.arrival - p.sent)) * 19,
            ),
          );
          return (
            <group key={`${p.from}-${p.to}-${p.sent}`}>
              <StableLine
                points={points}
                color="#ffffff"
                transparent
                opacity={0.45}
                lineWidth={1}
              />
              <mesh
                position={points[idx]}
                geometry={PACKET_GEOMETRY}
                material={PACKET_MATERIAL}
              />
            </group>
          );
        })}
    </group>
  );
}
