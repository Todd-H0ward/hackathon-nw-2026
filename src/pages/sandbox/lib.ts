import { MODEL_VERSION, type Simulation } from '@/features/ecosystem';

/** Sandbox utilities: formatting and local experiment export. */

// ═══════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════

export type { LabModal } from '@/store';

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

/** Zero-pads a number to two digits (for colony labels). */
export const pad = (n: number) => String(n).padStart(2, '0');

/** Local JSON download when API export is unavailable. */
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
