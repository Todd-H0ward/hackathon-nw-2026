import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import { emptySimulation, type Simulation } from '@/features/ecosystem';

/**
 * Mutable per-body simulation handles. Updated synchronously from `setSim` /
 * `patchSim` so imperative code and R3F frames can read the latest snapshot
 * without waiting for a React subscribe.
 */
export const labSimRefs = Object.fromEntries(
  GLOBE_BODY_IDS.map((id) => [id, { current: emptySimulation(id) }]),
) as Record<GlobeBodyId, { current: Simulation }>;

export const syncLabSimRef = (body: GlobeBodyId, sim: Simulation): void => {
  labSimRefs[body].current = sim;
};

export const readLabSimRef = (body: GlobeBodyId): Simulation =>
  labSimRefs[body].current;
