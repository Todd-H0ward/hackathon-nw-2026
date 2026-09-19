import type { StateSnapshot } from '@/shared/api/xenochoice';
import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import {
  type AdapterCarry,
  createAdapterCarry,
  type Settings,
  snapshotToSimulation,
} from '@/features/ecosystem';
import { DEFAULT_SEED, getLabState } from '@/store';

const initialCarries = () =>
  Object.fromEntries(
    GLOBE_BODY_IDS.map((id) => [id, createAdapterCarry()]),
  ) as Record<GlobeBodyId, AdapterCarry>;

/**
 * Per-planet bookkeeping that is deliberately not React state: nothing here is
 * rendered, and the snapshot adapter mutates it on every frame. Keeping it out
 * of the store also keeps the store free of values that change 10× per second
 * without anyone subscribing to them.
 */
export const labRuntime = {
  /** Cross-tick adapter state (death fade, event log, accumulated history). */
  carries: initialCarries(),
  pendingSettings: {} as Partial<Record<GlobeBodyId, Partial<Settings>>>,
  /** Guards against a second create request for the same planet. */
  creating: {} as Partial<Record<GlobeBodyId, boolean>>,
  /** Reverse lookup so a late snapshot is never applied to the wrong planet. */
  bodyByExperiment: {} as Record<string, GlobeBodyId>,
  seedByBody: {} as Partial<Record<GlobeBodyId, number>>,
  /** Pending debounced intervention per setting. */
  settingsTimers: {} as Partial<
    Record<keyof Settings, ReturnType<typeof setTimeout>>
  >,
};

/** Drops accumulated adapter state so a fresh experiment starts from zero. */
export const resetLabRuntime = (body: GlobeBodyId, seed: number) => {
  delete labRuntime.pendingSettings[body];
  labRuntime.carries[body] = createAdapterCarry();
  labRuntime.seedByBody[body] = seed;
};

/** Registers (or forgets) the experiment that owns a planet. */
export const rememberExperiment = (
  body: GlobeBodyId,
  experimentId: string | null,
) => {
  const { experimentIds, setExperimentIds } = getLabState();
  const next = { ...experimentIds };
  const previous = next[body];
  if (previous) delete labRuntime.bodyByExperiment[previous];

  if (experimentId) {
    next[body] = experimentId;
    labRuntime.bodyByExperiment[experimentId] = body;
  } else {
    delete next[body];
  }

  setExperimentIds(next);
};

/** Adapts a backend snapshot and publishes it to the store. */
export const applySnapshot = (body: GlobeBodyId, snapshot: StateSnapshot) => {
  const { setSim, selectFallback } = getLabState();
  const seed = labRuntime.seedByBody[body] ?? DEFAULT_SEED;
  const sim = snapshotToSimulation(
    body,
    seed,
    snapshot,
    labRuntime.carries[body],
  );

  if (!getLabState().recording)
    sim.settings = { ...sim.settings, ...labRuntime.pendingSettings[body] };
  setSim(body, sim);
  selectFallback(sim.colonies[0]?.id ?? null);
};

export const clampSeed = (raw: string) =>
  Math.max(1, Math.min(999999, Math.floor(Number(raw) || DEFAULT_SEED)));

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
