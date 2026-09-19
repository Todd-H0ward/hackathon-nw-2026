import type { GlobeBodyId } from '@/shared/ui/globe';

import type { Simulation } from '@/features/ecosystem/model';
import { MODEL_VERSION } from '@/features/ecosystem/world-info';

export type { LabModal } from '@/store';

/** Planet texture as a round thumbnail background. */
export const WORLD_THUMB: Record<GlobeBodyId, string> = {
  earth: "bg-[url('/images/globe/earth_color.jpg')] bg-[position:35%_50%]",
  mars: "bg-[url('/images/globe/mars_color.jpg')]",
  venus: "bg-[url('/images/globe/venus_color.jpg')]",
};

export const pad = (n: number) => String(n).padStart(2, '0');

/** Local fallback download when the API export is unavailable. */
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
