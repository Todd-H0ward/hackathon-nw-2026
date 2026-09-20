// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import { emptySimulation, type Simulation } from '@/features/ecosystem';

// ═══════════════════════════════════════════
// MUTABLE SIMULATION REFS
// ═══════════════════════════════════════════

/**
 * Mutable simulation handles per planet. Updated synchronously from `setSim` /
 * `patchSim` so imperative code and R3F frames read the latest snapshot
 * without waiting for a React subscription.
 */
export const labSimRefs = Object.fromEntries(
  GLOBE_BODY_IDS.map((id) => [id, { current: emptySimulation(id) }]),
) as Record<GlobeBodyId, { current: Simulation }>;

// ═══════════════════════════════════════════
// SYNC & READ
// ═══════════════════════════════════════════

/** Writes sim into the ref for body. */
export const syncLabSimRef = (body: GlobeBodyId, sim: Simulation): void => {
  labSimRefs[body].current = sim;
};

/** Reads the latest sim from ref without subscribing. */
export const readLabSimRef = (body: GlobeBodyId): Simulation =>
  labSimRefs[body].current;
