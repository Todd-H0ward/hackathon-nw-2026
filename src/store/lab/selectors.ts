import { type LabStore, useLabStore } from './store';

export const useLabBody = () => useLabStore((store: LabStore) => store.body);
export const useLabSetBody = () =>
  useLabStore((store: LabStore) => store.setBody);

/** Latest snapshot for the selected planet — a stable reference per snapshot. */
export const useLabSim = () =>
  useLabStore((store: LabStore) => store.sims[store.body]);
export const useLabSims = () => useLabStore((store: LabStore) => store.sims);
export const useLabExperimentId = () =>
  useLabStore((store: LabStore) => store.experimentIds[store.body] ?? null);
export const useLabBooting = () =>
  useLabStore((store: LabStore) => store.booting);
export const useLabStreamStatus = () =>
  useLabStore((store: LabStore) => store.streamStatus);
export const useLabRunning = () =>
  useLabStore((store: LabStore) => store.sims[store.body].status === 'running');

export const useLabSpeed = () => useLabStore((store: LabStore) => store.speed);
export const useLabSelected = () =>
  useLabStore((store: LabStore) => store.selected);
export const useLabSetSelected = () =>
  useLabStore((store: LabStore) => store.setSelected);
export const useLabShowLinks = () =>
  useLabStore((store: LabStore) => store.showLinks);
export const useLabToggleShowLinks = () =>
  useLabStore((store: LabStore) => store.toggleShowLinks);
export const useLabShowLabels = () =>
  useLabStore((store: LabStore) => store.showLabels);
export const useLabToggleShowLabels = () =>
  useLabStore((store: LabStore) => store.toggleShowLabels);
export const useLabModal = () => useLabStore((store: LabStore) => store.modal);
export const useLabSetModal = () =>
  useLabStore((store: LabStore) => store.setModal);
export const useLabCameraReset = () =>
  useLabStore((store: LabStore) => store.cameraReset);
export const useLabBumpCameraReset = () =>
  useLabStore((store: LabStore) => store.bumpCameraReset);
export const useLabExpanded = () =>
  useLabStore((store: LabStore) => store.expanded);
export const useLabToggleExpanded = () =>
  useLabStore((store: LabStore) => store.toggleExpanded);
export const useLabSeed = () => useLabStore((store: LabStore) => store.seed);
export const useLabSetSeed = () =>
  useLabStore((store: LabStore) => store.setSeed);

/**
 * Non-reactive snapshot. Async handlers read it after queueing an update, where
 * a captured render value would already be stale.
 */
export const getLabState = () => useLabStore.getState();
