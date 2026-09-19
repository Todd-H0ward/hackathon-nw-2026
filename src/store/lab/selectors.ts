import {
  activeColonies,
  living,
  members,
  WORLDS,
} from '@/features/ecosystem/model';

import type { LabStore } from './store';

export const selectBody = (s: LabStore) => s.body;
export const selectWorlds = (s: LabStore) => s.worlds;
export const selectSim = (s: LabStore) => s.worlds[s.body];
export const selectWorld = (s: LabStore) => WORLDS[s.body];
export const selectColonies = (s: LabStore) => activeColonies(selectSim(s));
export const selectAlive = (s: LabStore) => living(selectSim(s));

export const selectMetrics = (s: LabStore) =>
  selectSim(s).history.at(-1) ?? {
    population: 0,
    power: 0,
    efficiency: 0,
    entropy: 0,
    delay: null,
  };

export const selectHistory = (s: LabStore) => selectSim(s).history.slice(-70);

export const selectColonyById =
  (id: number | null) => (s: LabStore) =>
    id === null ? undefined : selectSim(s).colonies.find((c) => c.id === id);

export const selectGroup =
  (id: number | null) => (s: LabStore) =>
    id === null ? [] : members(selectSim(s), id);

export const selectLabActions = (s: LabStore) => ({
  setBody: s.setBody,
  updateCurrent: s.updateCurrent,
  stepCurrent: s.stepCurrent,
  applySettings: s.applySettings,
  applyIntervention: s.applyIntervention,
  seedColony: s.seedColony,
  resetCurrent: s.resetCurrent,
  replayCurrent: s.replayCurrent,
});
