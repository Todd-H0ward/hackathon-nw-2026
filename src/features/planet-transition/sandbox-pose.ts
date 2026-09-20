// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import type { PlanetScreenPose } from '@/shared/ui/globe';

// ═══════════════════════════════════════════
// SANDBOX POSE REGISTRY
// ═══════════════════════════════════════════

type PoseResolver = () => PlanetScreenPose | null;

let sandboxPose: PoseResolver | null = null;

/** Last successful measurement — kept when leaving analytics/atlas (viewport unmounted). */
let cachedPose: PlanetScreenPose | null = null;

/** PlanetViewport registers the live screen pose for the reverse home transition. */
export const registerSandboxPose = (resolve: PoseResolver | null) => {
  sandboxPose = resolve;
};

// ═══════════════════════════════════════════
// POSE READ
// ═══════════════════════════════════════════

/** Returns the live pose or the last cached one. */
export const readSandboxPose = (): PlanetScreenPose | null => {
  const live = sandboxPose?.() ?? null;
  if (live) cachedPose = live;
  return live ?? cachedPose;
};
