import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  downloadExperimentExport,
  type InterventionType,
  type StateSnapshot,
  type StreamStatus,
  useCommand,
  useCreateExperiment,
  useExperimentStatePolling,
  useExperimentStream,
  useIntervention,
  useReplayExperiment,
  useWorlds,
  xenoApiEndpoints,
} from '@/shared/api/xenochoice';
import { useToast } from '@/shared/ui';
import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import {
  type AdapterCarry,
  activeColonies,
  createAdapterCarry,
  emptySimulation,
  living,
  logIntervention,
  type Settings,
  type Simulation,
  snapshotToSimulation,
} from '@/features/ecosystem/model';
import { worldsToInfoMap } from '@/features/ecosystem/world-info';
import { useLabBody, useLabSetBody } from '@/store';

import type { LabModal } from './types';

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
const DEFAULT_SEED = 2048;
/** A range input fires on every drag step; the API budget is ~100 calls / 50 s. */
const SETTINGS_DEBOUNCE_MS = 300;

const clampSeed = (raw: string) =>
  Math.max(1, Math.min(999999, Math.floor(Number(raw) || DEFAULT_SEED)));

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const isPresent = <T>(value: T | undefined): value is T => value !== undefined;

const initialSims = (): Record<GlobeBodyId, Simulation> => ({
  earth: emptySimulation('earth'),
  mars: emptySimulation('mars'),
  venus: emptySimulation('venus'),
});

const initialCarries = (): Record<GlobeBodyId, AdapterCarry> => ({
  earth: createAdapterCarry(),
  mars: createAdapterCarry(),
  venus: createAdapterCarry(),
});

/** Builds lab UI + derived simulation state for LabProvider — backed by XenoChoice API. */
export const useLabState = () => {
  const { toast: notify } = useToast();

  const body = useLabBody();
  const setBody = useLabSetBody();

  const [speed, setSpeedState] = useState<1 | 2 | 5>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [showLinks, setShowLinks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [modal, setModal] = useState<LabModal>(null);
  const [cameraReset, setCameraReset] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [seed, setSeed] = useState(String(DEFAULT_SEED));

  const [sims, setSims] = useState(initialSims);
  const [experimentIds, setExperimentIds] = useState<
    Partial<Record<GlobeBodyId, string>>
  >({});
  const [booting, setBooting] = useState(false);

  const carriesRef = useRef(initialCarries());
  const creatingRef = useRef<Partial<Record<GlobeBodyId, boolean>>>({});
  /**
   * `experimentIds` also lives in a ref: async handlers (reset, bootstrap) read
   * it after queueing a state update, where the state copy is still stale.
   */
  const experimentIdsRef = useRef<Partial<Record<GlobeBodyId, string>>>({});
  /** Reverse lookup so a late snapshot is never attributed to the wrong world. */
  const bodyByExperimentRef = useRef<Record<string, GlobeBodyId>>({});
  const seedByBodyRef = useRef<Partial<Record<GlobeBodyId, number>>>({});
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const settingsTimersRef = useRef<
    Partial<Record<keyof Settings, ReturnType<typeof setTimeout>>>
  >({});

  const worldsQuery = useWorlds();
  const worldInfos = useMemo(
    () => worldsToInfoMap(worldsQuery.data),
    [worldsQuery.data],
  );
  /** Stable, ordered list of the planets the API actually returned. */
  const availableWorlds = useMemo(
    () => GLOBE_BODY_IDS.map((id) => worldInfos[id]).filter(isPresent),
    [worldInfos],
  );

  const createExperiment = useCreateExperiment();
  const command = useCommand();
  const intervention = useIntervention();
  const replay = useReplayExperiment();

  const experimentId = experimentIds[body] ?? null;
  const sim = sims[body];
  /** `undefined` until `/worlds` answers — there are no offline placeholders. */
  const world = worldInfos[body];
  const running = sim.status === 'running';

  useEffect(
    () => () => {
      for (const timer of Object.values(settingsTimersRef.current)) {
        if (timer) clearTimeout(timer);
      }
    },
    [],
  );

  const rememberExperiment = useCallback(
    (target: GlobeBodyId, id: string | null) => {
      const next = { ...experimentIdsRef.current };
      const previous = next[target];
      if (previous) delete bodyByExperimentRef.current[previous];

      if (id) {
        next[target] = id;
        bodyByExperimentRef.current[id] = target;
      } else {
        delete next[target];
      }

      experimentIdsRef.current = next;
      setExperimentIds(next);
    },
    [],
  );

  const applySnapshot = useCallback(
    (target: GlobeBodyId, snapshot: StateSnapshot) => {
      const carry = carriesRef.current[target];
      const seedValue = seedByBodyRef.current[target] ?? DEFAULT_SEED;
      const next = snapshotToSimulation(target, seedValue, snapshot, carry);

      setSims((prev) => ({ ...prev, [target]: next }));
      setSelected((current) => current ?? next.colonies[0]?.id ?? null);
    },
    [],
  );

  const ensureExperiment = useCallback(
    async (target: GlobeBodyId, seedValue: number) => {
      if (experimentIdsRef.current[target] || creatingRef.current[target]) {
        return;
      }
      creatingRef.current[target] = true;
      setBooting(true);

      try {
        const experiment = await createExperiment.mutateAsync({
          name: `Лаборатория · ${worldInfos[target]?.name ?? target}`,
          worldId: target,
          mode: 'adaptive',
          seed: seedValue,
        });

        carriesRef.current[target] = createAdapterCarry();
        seedByBodyRef.current[target] = experiment.seed;
        rememberExperiment(target, experiment.id);
        applySnapshot(target, experiment.initialSnapshot);
        setSeed(String(experiment.seed));

        await command.mutateAsync({
          experimentId: experiment.id,
          command: 'start',
          speed: speedRef.current,
        });
      } catch (error) {
        notify(errorMessage(error, 'Не удалось создать эксперимент'));
      } finally {
        creatingRef.current[target] = false;
        setBooting(false);
      }
    },
    [
      applySnapshot,
      command,
      createExperiment,
      notify,
      rememberExperiment,
      worldInfos,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap runs on a body switch or once worlds load; `seed` is read as the latest value on purpose.
  useEffect(() => {
    if (!worldsQuery.isSuccess) return;
    void ensureExperiment(body, clampSeed(seed));
  }, [body, worldsQuery.isSuccess]);

  const handleSnapshot = useCallback(
    (snapshot: StateSnapshot, sourceExperimentId: string) => {
      const target = bodyByExperimentRef.current[sourceExperimentId];
      if (!target) return;
      applySnapshot(target, snapshot);
    },
    [applySnapshot],
  );

  const streamStatus: StreamStatus = useExperimentStream(
    experimentId,
    experimentId !== null,
    handleSnapshot,
  );

  const streamDown =
    streamStatus === 'reconnecting' || streamStatus === 'failed';
  const statePolling = useExperimentStatePolling(experimentId, streamDown);

  useEffect(() => {
    if (!statePolling.data || !experimentId) return;
    handleSnapshot(statePolling.data, experimentId);
  }, [statePolling.data, experimentId, handleSnapshot]);

  const colonies = useMemo(() => activeColonies(sim), [sim]);
  const alive = useMemo(() => living(sim), [sim]);
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
  const history = useMemo(() => sim.history.slice(-70), [sim]);
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

  const withExperiment = (fn: (id: string) => void | Promise<void>) => {
    if (!experimentId) {
      notify('Эксперимент ещё не готов');
      return;
    }
    void fn(experimentId);
  };

  /** Commands answer with the authoritative status — no optimistic guessing. */
  const runCommand = async (
    id: string,
    request: Parameters<typeof command.mutateAsync>[0],
    fallbackMessage: string,
  ) => {
    try {
      const result = await command.mutateAsync(request);
      const target = bodyByExperimentRef.current[id];
      if (!target) return;
      setSims((prev) => ({
        ...prev,
        [target]: { ...prev[target], status: result.status },
      }));
    } catch (error) {
      notify(errorMessage(error, fallbackMessage));
    }
  };

  const toggleRunning = () => {
    withExperiment(async (id) => {
      const next =
        sim.status === 'running'
          ? 'pause'
          : sim.status === 'ready'
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
    setSpeedState(value);
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
    setBody(next);
    setSelected(null);
    setSeed(String(seedByBodyRef.current[next] ?? DEFAULT_SEED));
  };

  /** Coalesces slider drags into one request per setting. */
  const scheduleSetting = (
    key: keyof Settings,
    send: () => Promise<unknown>,
  ) => {
    const timers = settingsTimersRef.current;
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
    const nextSettings = { ...sim.settings, ...partial };
    const carry = carriesRef.current[body];
    carry.settings = nextSettings;
    setSims((prev) => ({
      ...prev,
      [body]: { ...prev[body], settings: nextSettings },
    }));

    withExperiment((id) => {
      const baseFlow = worldInfos[body]?.baseFlow ?? 1;

      if (partial.resource !== undefined) {
        const value = (partial.resource / 100) * Math.max(baseFlow, 1) * 2;
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
    const apiType = UI_TO_API[payload.type];
    const carry = carriesRef.current[body];
    carry.effect = { kind: payload.type, until: sim.tick + EFFECT_UNTIL };
    logIntervention(carry, sim.tick, apiType);

    setSims((prev) => ({
      ...prev,
      [body]: {
        ...prev[body],
        effect: carry.effect,
        interventions: [...carry.interventions],
      },
    }));

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
    if (!world) {
      notify('Параметры планеты ещё не загружены');
      return;
    }
    if (
      alive.length >= world.maxPopulation ||
      colonies.length >= world.maxColonies
    ) {
      notify(
        `Достигнут лимит: ${world.maxPopulation} особей или ${world.maxColonies} колоний`,
      );
      return;
    }

    withExperiment(async (id) => {
      try {
        await intervention.mutateAsync({
          experimentId: id,
          type: 'add_inoculum',
          targetId: body,
          value: 1,
        });
        logIntervention(carriesRef.current[body], sim.tick, 'add_inoculum');
        notify('Зародыш внесён. Внешний ресурс зарегистрирован.');
      } catch (error) {
        notify(errorMessage(error, 'Не удалось внести зародыш'));
      }
    });
  };

  const resetExperiment = async () => {
    const nextSeed = clampSeed(seed);

    setModal(null);
    rememberExperiment(body, null);
    creatingRef.current[body] = false;
    carriesRef.current[body] = createAdapterCarry();
    seedByBodyRef.current[body] = nextSeed;
    setSims((prev) => ({ ...prev, [body]: emptySimulation(body, nextSeed) }));
    setSelected(null);
    setSeed(String(nextSeed));

    await ensureExperiment(body, nextSeed);

    if (experimentIdsRef.current[body]) {
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

        applySnapshot(body, replayed);
        notify(
          replayed.checksum === paused.checksum
            ? 'Совпадение 100%: эксперимент воспроизведён'
            : 'Обнаружено расхождение воспроизведения',
        );
        setModal(null);
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
    body,
    sim,
    sims,
    world,
    worlds: worldInfos,
    availableWorlds,
    colonies,
    alive,
    colony,
    group,
    metrics,
    focused,
    history,
    running,
    toggleRunning,
    speed,
    setSpeed,
    selected,
    setSelected,
    showLinks,
    toggleShowLinks: () => setShowLinks((v) => !v),
    showLabels,
    toggleShowLabels: () => setShowLabels((v) => !v),
    modal,
    setModal,
    notify,
    cameraReset,
    bumpCameraReset: () => setCameraReset((n) => n + 1),
    expanded,
    toggleExpanded: () => setExpanded((v) => !v),
    seed,
    setSeed,
    booting,
    experimentId,
    streamStatus,
    worldsLoading: worldsQuery.isLoading,
    worldsError: worldsQuery.isError,
    step,
    selectWorld,
    settings: applySettings,
    intervene: applyIntervention,
    addColony,
    resetExperiment,
    runReplay,
    exportExperiment,
  };
};

export type LabState = ReturnType<typeof useLabState>;
