import { useCallback } from 'react';

import { useCommand, useCreateExperiment } from '@/shared/api/xenochoice';
import { useToast } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import { useWorldCatalog } from '@/features/ecosystem';
import { getLabState } from '@/store';

import {
  applySnapshot,
  errorMessage,
  labRuntime,
  rememberExperiment,
  resetLabRuntime,
} from './lab-runtime';

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

/**
 * Creates and starts an experiment for a planet. Idempotent:
 * module-level `labRuntime.creating` guard — bootstrap and reset
 * cannot open two experiments for the same planet.
 */
export const useEnsureExperiment = () => {
  const { toast: notify } = useToast();
  const worlds = useWorldCatalog();
  const createExperiment = useCreateExperiment();
  const command = useCommand();

  return useCallback(
    async (target: GlobeBodyId, seedValue: number) => {
      const { experimentIds, setBooting, setSeed } = getLabState();
      if (experimentIds[target] || labRuntime.creating[target]) return;

      labRuntime.creating[target] = true;
      setBooting(true);

      try {
        const experiment = await createExperiment.mutateAsync({
          name: `Лаборатория · ${worlds.catalog[target]?.name ?? target}`,
          worldId: target,
          mode: 'evolutionary',
          seed: seedValue,
        });

        resetLabRuntime(target, experiment.seed);
        rememberExperiment(target, experiment.id);
        applySnapshot(target, experiment.initialSnapshot);
        if (getLabState().body === target) setSeed(String(experiment.seed));

        await command.mutateAsync({
          experimentId: experiment.id,
          command: 'start',
          speed: getLabState().speed,
        });
      } catch (error) {
        notify(errorMessage(error, 'Не удалось создать эксперимент'));
      } finally {
        labRuntime.creating[target] = false;
        getLabState().setBooting(false);
      }
    },
    [command, createExperiment, notify, worlds.catalog],
  );
};
