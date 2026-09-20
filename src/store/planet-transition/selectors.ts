// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { type PlanetTransitionStore, usePlanetTransition } from './store';

// ═══════════════════════════════════════════
// SELECTOR HOOKS
// ═══════════════════════════════════════════

export const useTransitionPhase = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.phase);
export const useTransitionDirection = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.direction);
export const useTransitionBody = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.body);
export const useTransitionFrom = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.from);
export const useTransitionHasTarget = () =>
  usePlanetTransition(
    (store: PlanetTransitionStore) => store.resolveTarget !== null,
  );
export const useTransitionLaunch = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.launch);
export const useTransitionSetPhase = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.setPhase);
export const useTransitionSetTarget = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.setTarget);
export const useTransitionReset = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.reset);

// ═══════════════════════════════════════════
// IMPERATIVE ACCESS
// ═══════════════════════════════════════════

/** Non-reactive store snapshot — for R3F useFrame and motion callbacks. */
export const getTransitionState = () => usePlanetTransition.getState();
