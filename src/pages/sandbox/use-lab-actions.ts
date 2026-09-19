import {
  downloadExperimentExport,
  type InterventionType,
  useCommand,
  useReplayExperiment,
  xenoApiEndpoints,
} from '@/shared/api/xenochoice';
import { useToast } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';
import { announceAction } from '@/shared/voice/action-speech';

import {
  activeColonies,
  emptySimulation,
  living,
  type Settings,
  useWorldCatalog,
} from '@/features/ecosystem';
import { getLabState } from '@/store';

import {
  applySnapshot,
  clampSeed,
  errorMessage,
  labRuntime,
  rememberExperiment,
  resetLabRuntime,
} from './lab-runtime';
import { performIntervention } from './research-api';
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
  const worlds = useWorldCatalog();
  const command = useCommand();
  const replay = useReplayExperiment();
  const ensureExperiment = useEnsureExperiment();

  const withExperiment = (fn: (id: string) => void | Promise<void>) => {
    const { body, experimentIds, recording } = getLabState();
    if (recording) {
      notify('Сначала выйдите из записи');
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
      const messages: Record<string, string> = {
        pause: 'Эксперимент на паузе',
        start: 'Эксперимент запущен',
        resume: 'Эксперимент продолжен',
        step: 'Один такт выполнен',
        setSpeed: `Скорость ${request.speed}`,
      };
      announceAction(messages[request.command] ?? 'Готово');
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
    if (getLabState().recording) return;
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
    if (getLabState().recording) {
      notify('Сначала выйдите из записи');
      return;
    }
    const { setBody, setSelected, setSeed } = getLabState();
    setBody(next);
    announceAction(`Планета: ${worlds.catalog[next]?.name ?? next}`);
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
    if (getLabState().recording) return;
    const sanitized: Partial<Settings> = {
      ...partial,
      ...(partial.resource !== undefined
        ? { resource: Math.round(partial.resource) }
        : {}),
      ...(partial.noise !== undefined
        ? { noise: Math.round(partial.noise) }
        : {}),
    };
    const { body, sims, patchSim } = getLabState();
    const carry = labRuntime.carries[body];
    labRuntime.pendingSettings[body] = {
      ...labRuntime.pendingSettings[body],
      ...sanitized,
    };
    carry.settings = { ...sims[body].settings, ...sanitized };
    patchSim(body, { settings: carry.settings });
    for (const [key, value] of Object.entries(sanitized)) {
      scheduleSetting(key as keyof Settings, async () => {
        if (getLabState().body !== body || getLabState().recording) return;
        try {
          await performIntervention({
            type:
              key === 'resource'
                ? 'set_flow'
                : key === 'noise'
                  ? 'set_noise'
                  : 'toggle_mutations',
            targetId: body,
            value:
              key === 'resource'
                ? Number(value) / 50
                : key === 'noise'
                  ? Number(value) / 100
                  : value
                    ? 1
                    : 0,
          });
        } finally {
          const pending = labRuntime.pendingSettings[body];
          if (pending?.[key as keyof Settings] === value)
            delete pending[key as keyof Settings];
          const snapshot = getLabState().sims[body].snapshot;
          if (snapshot && !getLabState().recording)
            applySnapshot(body, snapshot);
        }
      });
    }
  };

  const applyIntervention = (payload: { type: UiIntervention }) => {
    withExperiment(async () => {
      try {
        await performIntervention({
          type: UI_TO_API[payload.type],
          targetId: getLabState().body,
          value: payload.type === 'pulse' ? 2 : 1,
          duration: EFFECT_UNTIL,
        });
        notify(INTERVENTION_LABELS[payload.type]);
      } catch (error) {
        notify(errorMessage(error, 'Воздействие не принято'));
      }
    });
  };

  const addColony = () => {
    const { body, sims } = getLabState();
    const sim = sims[body];
    const world = worlds.catalog[body];

    if (!world) {
      notify('Параметры планеты ещё не загружены');
      return;
    }
    if (
      living(sim).length >= world.maxPopulation ||
      activeColonies(sim).length >= world.maxColonies
    ) {
      notify(
        `Достигнут лимит: ${world.maxPopulation} особей или ${world.maxColonies} колоний`,
      );
      return;
    }

    withExperiment(() => {
      getLabState().setColonyDraft({ lat: 0, lng: 0 });
    });
  };

  const resetExperiment = async () => {
    if (getLabState().recording) return;
    const previous = getLabState().experimentIds[getLabState().body];
    if (previous) {
      try {
        await xenoApiEndpoints.postCommand(previous, { command: 'pause' });
      } catch (error) {
        notify(errorMessage(error, 'Не удалось остановить эксперимент'));
        return;
      }
    }
    const { body, seed, setModal, setSim, setSelected, setSeed } =
      getLabState();
    const nextSeed = clampSeed(seed);

    setModal(null);
    rememberExperiment(body, null);
    labRuntime.creating[body] = false;
    resetLabRuntime(body, nextSeed);
    setSim(body, emptySimulation(body, nextSeed));
    setSelected(null);
    setSeed(String(nextSeed));

    await ensureExperiment(body, nextSeed);

    if (getLabState().experimentIds[body]) {
      notify('Исходный эксперимент восстановлен');
      announceAction('Исходный эксперимент восстановлен');
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

  const exportExperiment = async () => {
    const state = getLabState();
    const id = state.recording?.id ?? state.experimentIds[state.body];
    if (!id) {
      notify('Эксперимент ещё не готов');
      return;
    }
    try {
      await downloadExperimentExport(id, 'json');
      notify('Эксперимент экспортирован в JSON');
      announceAction('Эксперимент экспортирован в JSON');
    } catch (error) {
      notify(errorMessage(error, 'Экспорт не удался'));
    }
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
