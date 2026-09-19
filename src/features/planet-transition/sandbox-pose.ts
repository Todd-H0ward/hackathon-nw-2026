import type { PlanetScreenPose } from '@/shared/ui/globe';

type PoseResolver = () => PlanetScreenPose | null;

let sandboxPose: PoseResolver | null = null;

/** PlanetViewport registers its live screen pose for reverse home transitions. */
export const registerSandboxPose = (resolve: PoseResolver | null) => {
  sandboxPose = resolve;
};

export const readSandboxPose = (): PlanetScreenPose | null =>
  sandboxPose?.() ?? null;
