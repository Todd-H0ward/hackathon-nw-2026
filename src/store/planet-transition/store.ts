import { create } from 'zustand';

import type { GlobeBodyId, PlanetScreenPose } from '@/shared/ui/globe';

/**
 * idle    — nothing happening
 * launch  — overlay mounted at the source pose, waiting for its first frames
 * handoff — overlay drawn; source hides its planet and the route changes
 * flight  — destination registered its viewport; overlay flies the planet there
 * land    — overlay crossfades into the destination's own canvas
 */
export type PlanetTransitionPhase =
  | 'idle'
  | 'launch'
  | 'handoff'
  | 'flight'
  | 'land';

export type PlanetTransitionDirection = 'forward' | 'back';

export type PlanetTransitionStore = {
  phase: PlanetTransitionPhase;
  direction: PlanetTransitionDirection;
  body: GlobeBodyId | null;
  from: PlanetScreenPose | null;
  /** Resolves the live landing pose (re-read every frame to follow layout shifts). */
  resolveTarget: (() => PlanetScreenPose | null) | null;
  launch: (
    body: GlobeBodyId,
    from: PlanetScreenPose,
    direction?: PlanetTransitionDirection,
  ) => void;
  setPhase: (phase: PlanetTransitionPhase) => void;
  setTarget: (resolve: (() => PlanetScreenPose | null) | null) => void;
  reset: () => void;
};

export const usePlanetTransition = create<PlanetTransitionStore>((set) => ({
  phase: 'idle',
  direction: 'forward',
  body: null,
  from: null,
  resolveTarget: null,
  launch: (body, from, direction = 'forward') =>
    set({ phase: 'launch', direction, body, from, resolveTarget: null }),
  setPhase: (phase) => set({ phase }),
  setTarget: (resolveTarget) => set({ resolveTarget }),
  reset: () =>
    set({
      phase: 'idle',
      direction: 'forward',
      body: null,
      from: null,
      resolveTarget: null,
    }),
}));
