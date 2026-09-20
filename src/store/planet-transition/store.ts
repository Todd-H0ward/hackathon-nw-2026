// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { create } from 'zustand';

import type { GlobeBodyId, PlanetScreenPose } from '@/shared/ui/globe';

// ═══════════════════════════════════════════
// TRANSITION PHASES
// ═══════════════════════════════════════════

/**
 * idle    — nothing active
 * launch  — overlay mounted in source pose, waiting for first frames
 * handoff — overlay drawn; source hides planet and route changes
 * flight  — destination registered viewport; overlay flies there
 * land    — overlay fades into the destination canvas
 */
export type PlanetTransitionPhase =
  | 'idle'
  | 'launch'
  | 'handoff'
  | 'flight'
  | 'land';

/** Transition direction: forward (home → sandbox) or back. */
export type PlanetTransitionDirection = 'forward' | 'back';

// ═══════════════════════════════════════════
// STORE SCHEMA
// ═══════════════════════════════════════════

/** Animated planet transition state. */
export type PlanetTransitionStore = {
  phase: PlanetTransitionPhase;
  direction: PlanetTransitionDirection;
  body: GlobeBodyId | null;
  from: PlanetScreenPose | null;
  /** Live landing-pose resolver (re-read every frame). */
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

// ═══════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════

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
