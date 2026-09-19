import { create } from 'zustand';

import type { GlobeBodyId } from '@/shared/ui/globe';

import {
  createSimulation,
  type Intervention,
  intervene,
  replay,
  type Settings,
  type Simulation,
  step,
} from '@/features/ecosystem/model';

const initialWorlds = (): Record<GlobeBodyId, Simulation> => ({
  earth: createSimulation('earth'),
  mars: createSimulation('mars'),
  venus: createSimulation('venus'),
});

export type LabState = {
  body: GlobeBodyId;
  worlds: Record<GlobeBodyId, Simulation>;
};

export type LabActions = {
  setBody: (body: GlobeBodyId) => void;
  updateCurrent: (fn: (sim: Simulation) => Simulation) => void;
  stepCurrent: (times?: number) => void;
  applySettings: (settings: Partial<Settings>) => void;
  applyIntervention: (
    intervention: Omit<Intervention, 'tick'> | Intervention,
  ) => void;
  seedColony: () => number | null;
  resetCurrent: (seed: number) => void;
  replayCurrent: () => { equal: boolean };
};

export type LabStore = LabState & LabActions;

export const useLabStore = create<LabStore>((set, get) => ({
  body: 'earth',
  worlds: initialWorlds(),

  setBody: (body) => set({ body }),

  updateCurrent: (fn) => {
    const { body, worlds } = get();
    set({ worlds: { ...worlds, [body]: fn(worlds[body]) } });
  },

  stepCurrent: (times = 1) => {
    const { body, worlds } = get();
    let next = worlds[body];
    for (let i = 0; i < times; i++) next = step(next);
    set({ worlds: { ...worlds, [body]: next } });
  },

  applySettings: (partial) => {
    const { body, worlds } = get();
    const sim = worlds[body];
    set({
      worlds: {
        ...worlds,
        [body]: intervene(sim, {
          type: 'settings',
          settings: { ...sim.settings, ...partial },
        }),
      },
    });
  },

  applyIntervention: (intervention) => {
    const { body, worlds } = get();
    set({
      worlds: {
        ...worlds,
        [body]: intervene(worlds[body], intervention as Intervention),
      },
    });
  },

  seedColony: () => {
    const { body, worlds } = get();
    const sim = worlds[body];
    const id = sim.nextColony;
    set({
      worlds: {
        ...worlds,
        [body]: intervene(sim, { type: 'seed' }),
      },
    });
    return id;
  },

  resetCurrent: (seed) => {
    const { body, worlds } = get();
    set({
      worlds: {
        ...worlds,
        [body]: createSimulation(body, seed),
      },
    });
  },

  replayCurrent: () => {
    const { body, worlds } = get();
    const sim = worlds[body];
    const rebuilt = replay(body, sim.seed, sim.interventions, sim.tick);
    return { equal: JSON.stringify(rebuilt) === JSON.stringify(sim) };
  },
}));
