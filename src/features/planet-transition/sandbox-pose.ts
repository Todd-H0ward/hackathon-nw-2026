import type { PlanetScreenPose } from '@/shared/ui/globe';

type PoseResolver = () => PlanetScreenPose | null;

let sandboxPose: PoseResolver | null = null;
/** Last successful measure — used when leaving analytics/atlas (viewport unmounted). */
let cachedPose: PlanetScreenPose | null = null;

/** PlanetViewport registers its live screen pose for reverse home transitions. */
export const registerSandboxPose = (resolve: PoseResolver | null) => {
  sandboxPose = resolve;
};

export const readSandboxPose = (): PlanetScreenPose | null => {
  const live = sandboxPose?.() ?? null;
  if (live) cachedPose = live;
  return live ?? cachedPose;
};
