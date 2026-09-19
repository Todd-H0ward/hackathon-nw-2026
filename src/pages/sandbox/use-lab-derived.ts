import { useMemo } from 'react';

import { activeColonies, living } from '@/features/ecosystem/model';
import { useLabSelected, useLabSim } from '@/store';

/**
 * Values derived from the latest snapshot. Kept in one hook so the panels are
 * not each re-deriving the same lists, and memoised on the snapshot reference —
 * the stream replaces it up to 10× per second.
 */
export const useLabDerived = () => {
  const sim = useLabSim();
  const selected = useLabSelected();

  const colonies = useMemo(() => activeColonies(sim), [sim]);
  const alive = useMemo(() => living(sim), [sim]);
  const history = useMemo(() => sim.history.slice(-70), [sim]);
  const metrics = useMemo(
    () =>
      sim.history.at(-1) ?? {
        population: 0,
        power: 0,
        efficiency: 0,
        entropy: 0,
        delay: null,
      },
    [sim],
  );
  const colony = useMemo(
    () => sim.colonies.find((c) => c.id === selected),
    [sim, selected],
  );
  const group = useMemo(
    () =>
      selected === null
        ? []
        : sim.individuals.filter(
            (i) => i.dead === null && i.colony === selected,
          ),
    [sim, selected],
  );
  const focused = useMemo(
    () =>
      group.find((i) => i.action === 'divide') ??
      group.find((i) => i.action === 'signal') ??
      group[0],
    [group],
  );

  return {
    sim,
    selected,
    colonies,
    alive,
    history,
    metrics,
    colony,
    group,
    focused,
  };
};
