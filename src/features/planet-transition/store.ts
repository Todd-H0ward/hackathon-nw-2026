import { create } from 'zustand';

import type { GlobeBodyId, PlanetScreenPose } from '@/shared/ui/globe';

/**
 * idle    — nothing happening
 * launch  — overlay mounted at the home pose, waiting for its first frames
 * handoff — overlay drawn; home hides its planet and fades out, then navigates
 * flight  — sandbox registered its viewport; overlay flies the planet there
 * land    — overlay crossfades into the sandbox's own canvas
 */
export type PlanetTransitionPhase =
  | 'idle'
  | 'launch'
  | 'handoff'
  | 'flight'
  | 'land';

type PlanetTransitionStore = {
  phase: PlanetTransitionPhase;
  body: GlobeBodyId | null;
  from: PlanetScreenPose | null;
  /** Resolves the live landing pose (re-read every frame to follow layout shifts). */
  resolveTarget: (() => PlanetScreenPose | null) | null;
  launch: (body: GlobeBodyId, from: PlanetScreenPose) => void;
  setPhase: (phase: PlanetTransitionPhase) => void;
  setTarget: (resolve: (() => PlanetScreenPose | null) | null) => void;
  reset: () => void;
};

export const usePlanetTransition = create<PlanetTransitionStore>((set) => ({
  phase: 'idle',
  body: null,
  from: null,
  resolveTarget: null,
  launch: (body, from) =>
    set({ phase: 'launch', body, from, resolveTarget: null }),
  setPhase: (phase) => set({ phase }),
  setTarget: (resolveTarget) => set({ resolveTarget }),
  reset: () =>
    set({ phase: 'idle', body: null, from: null, resolveTarget: null }),
}));
