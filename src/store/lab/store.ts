// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { create } from 'zustand';

import type { StreamStatus } from '@/shared/api/xenochoice';
import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import { emptySimulation, type Simulation } from '@/features/ecosystem';

import { syncLabSimRef } from './sim-ref';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

/** Lab modal identifier. */
export type LabModal = 'reset' | 'replay' | 'extinct' | null;

/** Default experiment seed. */
export const DEFAULT_SEED = 2048;

// ═══════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════

/** Empty simulations for each planet at startup. */
const initialSims = (): Record<GlobeBodyId, Simulation> =>
  Object.fromEntries(
    GLOBE_BODY_IDS.map((id) => [id, emptySimulation(id)]),
  ) as Record<GlobeBodyId, Simulation>;

// ═══════════════════════════════════════════
// STORE SCHEMA
// ═══════════════════════════════════════════

/**
 * Lab state: selected planet, latest snapshot per planet, and observer UI
 * choices. API orchestration lives in `pages/sandbox/use-lab-bootstrap`.
 */
export type LabStore = {
  recording: {
    id: string;
    maxTick: number;
    tick: number;
    playing: boolean;
  } | null;
  setRecording: (recording: LabStore['recording']) => void;
  colonyDraft: { lat: number; lng: number } | null;
  setColonyDraft: (draft: LabStore['colonyDraft']) => void;
  focusNonce: number;
  body: GlobeBodyId;
  sims: Record<GlobeBodyId, Simulation>;
  experimentIds: Partial<Record<GlobeBodyId, string>>;
  booting: boolean;
  streamStatus: StreamStatus;

  speed: 1 | 2 | 5;
  selected: number | null;
  showLinks: boolean;
  showLabels: boolean;
  modal: LabModal;
  cameraReset: number;
  expanded: boolean;
  seed: string;

  setBody: (body: GlobeBodyId) => void;
  setSim: (body: GlobeBodyId, sim: Simulation) => void;
  patchSim: (body: GlobeBodyId, patch: Partial<Simulation>) => void;
  setExperimentIds: (ids: Partial<Record<GlobeBodyId, string>>) => void;
  setBooting: (booting: boolean) => void;
  setStreamStatus: (status: StreamStatus) => void;

  setSpeed: (speed: 1 | 2 | 5) => void;
  setSelected: (selected: number | null) => void;
  /** Keeps the current selection or falls back to the first colony. */
  selectFallback: (colonyId: number | null) => void;
  toggleShowLinks: () => void;
  toggleShowLabels: () => void;
  setModal: (modal: LabModal) => void;
  bumpCameraReset: () => void;
  toggleExpanded: () => void;
  setSeed: (seed: string) => void;
};

// ═══════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════

export const useLabStore = create<LabStore>((set) => ({
  recording: null,
  setRecording: (recording) => set({ recording }),
  colonyDraft: null,
  setColonyDraft: (colonyDraft) => set({ colonyDraft }),
  focusNonce: 0,
  body: 'earth',
  sims: initialSims(),
  experimentIds: {},
  booting: false,
  streamStatus: 'idle',

  speed: 1,
  selected: null,
  showLinks: true,
  showLabels: false,
  modal: null,
  cameraReset: 0,
  expanded: false,
  seed: String(DEFAULT_SEED),

  setBody: (body) => set({ body }),
  setSim: (body, sim) =>
    set((state) => {
      const prev = state.sims[body];
      if (
        prev &&
        prev.tick === sim.tick &&
        prev.checksum === sim.checksum &&
        prev.status === sim.status
      ) {
        return state;
      }
      syncLabSimRef(body, sim);
      return { sims: { ...state.sims, [body]: sim } };
    }),
  patchSim: (body, patch) =>
    set((state) => {
      const next = { ...state.sims[body], ...patch };
      syncLabSimRef(body, next);
      return { sims: { ...state.sims, [body]: next } };
    }),
  setExperimentIds: (experimentIds) => set({ experimentIds }),
  setBooting: (booting) => set({ booting }),
  setStreamStatus: (streamStatus) => set({ streamStatus }),

  setSpeed: (speed) => set({ speed }),
  setSelected: (selected) =>
    set((state) => ({ selected, focusNonce: state.focusNonce + 1 })),
  selectFallback: (colonyId) =>
    set((state) => ({ selected: state.selected ?? colonyId })),
  toggleShowLinks: () => set((state) => ({ showLinks: !state.showLinks })),
  toggleShowLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setModal: (modal) => set({ modal }),
  bumpCameraReset: () =>
    set((state) => ({ cameraReset: state.cameraReset + 1 })),
  toggleExpanded: () => set((state) => ({ expanded: !state.expanded })),
  setSeed: (seed) => set({ seed }),
}));

// ═══════════════════════════════════════════
// REF SYNC
// ═══════════════════════════════════════════

// Keep refs aligned with the initial empty sims.
for (const id of GLOBE_BODY_IDS) {
  syncLabSimRef(id, useLabStore.getState().sims[id]);
}
