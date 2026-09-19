import {
  downloadExperimentExport,
  type InterventionType,
  useCommand,
  useIntervention,
  useReplayExperiment,
  xenoApiEndpoints,
} from '@/shared/api/xenochoice';
import { useToast } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import {
  emptySimulation,
  logIntervention,
  type Settings,
} from '@/features/ecosystem/model';
import { getLabState } from '@/store';

import {
  applySnapshot,
  clampSeed,
  errorMessage,
  labRuntime,
  rememberExperiment,
  resetLabRuntime,
} from './lab-runtime';
import { useEnsureExperiment } from './use-ensure-experiment';

type UiIntervention = 'pulse' | 'storm' | 'scarcity';

const UI_TO_API: Record<UiIntervention, InterventionType> = {
  pulse: 'impulse',
  storm: 'perturbation',
  scarcity: 'depletion',
};

const INTERVENTION_LABELS: Record<UiIntervention, string> = {
  pulse: 'Импульс: приток ресурса усилен',
  storm: 'Возмущение: шум среды повышен',
  scarcity: 'Истощение: приток временно отключён',
};

const EFFECT_UNTIL = 60;
/** A range input fires on every drag step; the API budget is ~100 calls / 50 s. */
const SETTINGS_DEBOUNCE_MS = 300;

/**
 * Every lab command that talks to the API. Handlers read the store through
 * `getLabState()` rather than closing over render values, so they stay correct
 * when called from a stale callback.
 */
export const useLabActions = () => {
  const { toast: notify } = useToast();
  const command = useCommand();
  const intervention = useIntervention();
  const replay = useReplayExperiment();
  const ensureExperiment = useEnsureExperiment();

  const withExperiment = (fn: (id: string) => void | Promise<void>) => {
    const { body, experimentIds } = getLabState();
    if (getLabState().recording) {
      notify('Выйдите из просмотра записи, чтобы изменить опыт');
      return;
    }
    const id = experimentIds[body];
    if (!id) {
      notify('Эксперимент ещё не готов');
      return;
    }
    void fn(id);
  };

  /** Commands answer with the authoritative status — no optimistic guessing. */
  const runCommand = async (
    id: string,
    request: Parameters<typeof command.mutateAsync>[0],
    fallbackMessage: string,
  ) => {
    try {
      const result = await command.mutateAsync(request);
      const target = labRuntime.bodyByExperiment[id];
      if (!target) return;
      getLabState().patchSim(target, { status: result.status });
    } catch (error) {
      notify(errorMessage(error, fallbackMessage));
    }
  };

  const toggleRunning = () => {
    withExperiment(async (id) => {
      const { body, sims, speed } = getLabState();
      const status = sims[body].status;
      const next =
        status === 'running'
          ? 'pause'
          : status === 'ready'
            ? 'start'
            : 'resume';

      await runCommand(
        id,
        {
          experimentId: id,
          command: next,
          ...(next === 'start' ? { speed } : {}),
        },
        'Не удалось изменить состояние симуляции',
      );
    });
  };

  const setSpeed = (next: number) => {
    const value = (next === 2 || next === 5 ? next : 1) as 1 | 2 | 5;
    getLabState().setSpeed(value);
    withExperiment((id) =>
      runCommand(
        id,
        { experimentId: id, command: 'setSpeed', speed: value },
        'Не удалось изменить скорость',
      ),
    );
  };

  const step = () => {
    withExperiment((id) =>
      runCommand(
        id,
        { experimentId: id, command: 'step' },
        'Не удалось выполнить такт',
      ),
    );
  };

  const selectWorld = (next: GlobeBodyId) => {
    const { setBody, setSelected, setSeed } = getLabState();
    setBody(next);
    setSelected(null);
    setSeed(String(labRuntime.seedByBody[next] ?? clampSeed('')));
  };

  /** Coalesces slider drags into one request per setting. */
  const scheduleSetting = (
    key: keyof Settings,
    send: () => Promise<unknown>,
  ) => {
    const timers = labRuntime.settingsTimers;
    const pending = timers[key];
    if (pending) clearTimeout(pending);

    timers[key] = setTimeout(() => {
      delete timers[key];
      void send().catch((error: unknown) => {
        notify(errorMessage(error, 'Не удалось применить условия'));
      });
    }, SETTINGS_DEBOUNCE_MS);
  };

  const applySettings = (partial: Partial<Settings>) => {
    const { body, sims, patchSim } = getLabState();
    const sim = sims[body];
    const carry = labRuntime.carries[body];

    carry.settings = { ...sim.settings, ...partial };
    patchSim(body, { settings: carry.settings });

    withExperiment((id) => {
      if (partial.resource !== undefined) {
        const value = partial.resource / 50;
        scheduleSetting('resource', () => {
          logIntervention(carry, sim.tick, 'set_flow');
          return intervention.mutateAsync({
            experimentId: id,
            type: 'set_flow',
            targetId: body,
            value,
          });
        });
      }

      if (partial.noise !== undefined) {
        const value = partial.noise / 100;
        scheduleSetting('noise', () => {
          logIntervention(carry, sim.tick, 'set_noise');
          return intervention.mutateAsync({
            experimentId: id,
            type: 'set_noise',
            targetId: body,
            value,
          });
        });
      }

      if (partial.mutation !== undefined) {
        const value = partial.mutation ? 1 : 0;
        scheduleSetting('mutation', () => {
          logIntervention(carry, sim.tick, 'toggle_mutations');
          return intervention.mutateAsync({
            experimentId: id,
            type: 'toggle_mutations',
            targetId: body,
            value,
          });
        });
      }
    });
  };

  const applyIntervention = (payload: { type: UiIntervention }) => {
    const { body, sims, patchSim } = getLabState();
    const sim = sims[body];
    const carry = labRuntime.carries[body];
    const apiType = UI_TO_API[payload.type];

    carry.effect = { kind: payload.type, until: sim.tick + EFFECT_UNTIL };
    logIntervention(carry, sim.tick, apiType);
    patchSim(body, {
      effect: carry.effect,
      interventions: [...carry.interventions],
    });

    withExperiment(async (id) => {
      try {
        await intervention.mutateAsync({
          experimentId: id,
          type: apiType,
          targetId: body,
          value: payload.type === 'pulse' ? 2 : 1,
        });
        notify(INTERVENTION_LABELS[payload.type]);
      } catch (error) {
        notify(errorMessage(error, 'Воздействие не принято'));
      }
    });
  };

  const addColony = () => {
    getLabState().setColonyDraft({ lat: 20, lng: 10 });
  };

  const resetExperiment = async () => {
    const { body, seed, setModal, setSim, setSelected, setSeed } =
      getLabState();
    const nextSeed = clampSeed(seed);

    setModal(null);
    const oldId = getLabState().experimentIds[body];
    if (oldId)
      await command.mutateAsync({ experimentId: oldId, command: 'pause' });
    rememberExperiment(body, null);
    labRuntime.creating[body] = false;
    resetLabRuntime(body, nextSeed);
    setSim(body, emptySimulation(body, nextSeed));
    setSelected(null);
    setSeed(String(nextSeed));

    await ensureExperiment(body, nextSeed);

    if (getLabState().experimentIds[body]) {
      notify('Исходный эксперимент восстановлен');
    }
  };

  const runReplay = () => {
    withExperiment(async (id) => {
      try {
        await command.mutateAsync({ experimentId: id, command: 'pause' });
        // Freeze the comparison point only once the engine stopped advancing.
        const paused = await xenoApiEndpoints.getExperimentState(id);
        const replayed = await replay.mutateAsync({
          experimentId: id,
          targetTick: paused.tick,
        });

        applySnapshot(getLabState().body, replayed);
        notify(
          replayed.checksum === paused.checksum
            ? 'Совпадение 100%: эксперимент воспроизведён'
            : 'Обнаружено расхождение воспроизведения',
        );
        getLabState().setModal(null);
      } catch (error) {
        notify(errorMessage(error, 'Не удалось воспроизвести эксперимент'));
      }
    });
  };

  const exportExperiment = () => {
    withExperiment(async (id) => {
      try {
        await downloadExperimentExport(id, 'json');
        notify('Эксперимент экспортирован в JSON');
      } catch (error) {
        notify(errorMessage(error, 'Экспорт не удался'));
      }
    });
  };

  return {
    toggleRunning,
    setSpeed,
    step,
    selectWorld,
    applySettings,
    applyIntervention,
    addColony,
    resetExperiment,
    runReplay,
    exportExperiment,
    notify,
  };
};
