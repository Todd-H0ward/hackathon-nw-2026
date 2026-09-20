import { useEffect, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Sphere, Vector2, Vector3 } from 'three';

import { position, type Simulation } from '@/features/ecosystem/model';
import { SURFACE_MARKER } from '@/features/ecosystem/surface-markers';
import { useLabStore } from '@/store/lab/store';

/** R3F research scene: camera to colony, drag-and-drop colony draft. */

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const ResearchScene = ({
  sim,
  selected,
  reset,
}: {
  sim: Simulation;
  selected: number | null;
  reset: number;
}) => {
  const { camera, gl, controls } = useThree();
  const focus = useLabStore((s) => s.focusNonce);
  const draft = useLabStore((s) => s.colonyDraft);
  const destination = useRef<Vector3 | null>(null);
  const orbit = controls as unknown as
    | {
        enabled: boolean;
        target: Vector3;
        update: () => void;
        addEventListener: (event: string, fn: () => void) => void;
        removeEventListener: (event: string, fn: () => void) => void;
      }
    | undefined;
  const simRef = useRef(sim);
  simRef.current = sim;
  // biome-ignore lint/correctness/useExhaustiveDependencies: clicking the same colony requests another camera flight.
  useEffect(() => {
    const group = simRef.current.individuals.filter(
      (i) => i.colony === selected && i.dead === null,
    );
    if (!group.length) return;
    const center = new Vector3();
    for (const ind of group) center.add(new Vector3(...position(ind, 1)));
    destination.current = center.normalize().multiplyScalar(4.6);
  }, [selected, focus]);
  useEffect(() => {
    if (reset > 0) destination.current = new Vector3(0, 0, 8.6);
  }, [reset]);
  useEffect(() => {
    const stop = () => {
      destination.current = null;
    };
    orbit?.addEventListener('start', stop);
    return () => orbit?.removeEventListener('start', stop);
  }, [orbit]);
  useFrame((_, dt) => {
    if (destination.current) {
      camera.position.lerp(destination.current, 1 - Math.exp(-5 * dt));
      orbit?.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      orbit?.update();
      if (camera.position.distanceTo(destination.current) < 0.005)
        destination.current = null;
    }
  });
  useEffect(() => {
    const canvas = gl.domElement;
    const drop = (e: DragEvent) => {
      if (!useLabStore.getState().colonyDraft) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const ray = new Raycaster();
      ray.setFromCamera(
        new Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.ray.intersectSphere(
        new Sphere(new Vector3(), 2.33),
        new Vector3(),
      );
      if (hit) {
        hit.normalize();
        useLabStore.getState().setColonyDraft({
          lat: (Math.asin(hit.y) * 180) / Math.PI,
          lng: (Math.atan2(hit.x, hit.z) * 180) / Math.PI,
        });
      }
    };
    const over = (e: DragEvent) => {
      if (useLabStore.getState().colonyDraft) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      }
    };
    canvas.addEventListener('dragover', over);
    canvas.addEventListener('drop', drop);
    return () => {
      canvas.removeEventListener('dragover', over);
      canvas.removeEventListener('drop', drop);
    };
  }, [camera, gl]);
  if (!draft) return null;
  return (
    <mesh
      position={position(
        { lat: (draft.lat * Math.PI) / 180, lon: (draft.lng * Math.PI) / 180 },
        2.37,
      )}
    >
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial color={SURFACE_MARKER.draft} />
    </mesh>
  );
};
