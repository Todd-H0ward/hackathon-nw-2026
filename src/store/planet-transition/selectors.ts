import { type PlanetTransitionStore, usePlanetTransition } from './store';

export const useTransitionPhase = () =>
  usePlanetTransition((store: PlanetTransitionStore) => store.phase);
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
export const getTransitionState = () => usePlanetTransition.getState();
