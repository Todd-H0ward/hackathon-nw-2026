import { create } from 'zustand';

import type { GlobeBodyId } from '@/shared/ui/globe';

/**
 * Which planet is selected. Simulation state itself lives in the XenoChoice
 * API + `useLabState` — this store only tracks the pick, shared between the
 * home page (which sets it before navigating) and the sandbox route tree.
 */
export type LabStore = {
  body: GlobeBodyId;
  setBody: (body: GlobeBodyId) => void;
};

export const useLabStore = create<LabStore>((set) => ({
  body: 'earth',
  setBody: (body) => set({ body }),
}));
