import { WORLDS } from '@/features/ecosystem/model';

import type { LabStore } from './store';

export const selectBody = (s: LabStore) => s.body;
export const selectWorlds = (s: LabStore) => s.worlds;
export const selectSim = (s: LabStore) => s.worlds[s.body];
export const selectWorld = (s: LabStore) => WORLDS[s.body];

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
