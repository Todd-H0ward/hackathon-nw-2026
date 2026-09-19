import type { GlobeBodyId } from '@/shared/ui/globe';

import { MODEL_VERSION, type Simulation } from '@/features/ecosystem/model';

export type LabView = 'lab' | 'analytics';
export type LabModal = 'guide' | 'atlas' | 'reset' | 'replay' | null;

export const BODY_IDS: GlobeBodyId[] = ['earth', 'mars', 'venus'];

export const pad = (n: number) => String(n).padStart(2, '0');

export const downloadExperiment = (s: Simulation) => {
  const data = {
    modelVersion: MODEL_VERSION,
    body: s.body,
    seed: s.seed,
    tick: s.tick,
    interventions: s.interventions,
    state: s,
    note: 'Реальные справочные параметры планеты; гипотетическая модель небиологической жизни. EU — условная энергия.',
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `xenochoice-${s.body}-${s.seed}-${s.tick}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const worldCaseName = (name: string) => {
  if (name === 'Земля') return 'Земле';
  if (name === 'Марс') return 'Марсе';
  return 'Венере';
};
