import type { StateSnapshot } from '@/shared/api/xenochoice';
import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import {
  type AdapterCarry,
  createAdapterCarry,
  type Settings,
  snapshotToSimulation,
} from '@/features/ecosystem';
import { DEFAULT_SEED, getLabState } from '@/store';

/** Module-level lab state outside React — snapshot adapter, debounced settings, play/pause. */

// ═══════════════════════════════════════════
// HELPERS (INIT)
// ═══════════════════════════════════════════

const initialCarries = () =>
  Object.fromEntries(
    GLOBE_BODY_IDS.map((id) => [id, createAdapterCarry()]),
  ) as Record<GlobeBodyId, AdapterCarry>;

// ═══════════════════════════════════════════
// RUNTIME STORE
// ═══════════════════════════════════════════

/**
 * Per-planet state, intentionally outside React: nothing re-renders,
 * the adapter mutates carry each frame. Keeping it out of the store
 * avoids 10 Hz updates with no subscribers.
 */
export const labRuntime = {
  /** Inter-tick adapter state (death fade, journal, history). */
  carries: initialCarries(),
  pendingSettings: {} as Partial<Record<GlobeBodyId, Partial<Settings>>>,
  /** Guards against a second create request for the same planet. */
  creating: {} as Partial<Record<GlobeBodyId, boolean>>,
  /** Reverse lookup — late snapshot cannot land on the wrong planet. */
  bodyByExperiment: {} as Record<string, GlobeBodyId>,
  seedByBody: {} as Partial<Record<GlobeBodyId, number>>,
  /** Pending debounced setting change. */
  settingsTimers: {} as Partial<Record<string, ReturnType<typeof setTimeout>>>,
  /**
   * In-flight play/pause — ignore duplicates until the command responds.
   * `awaitingStatus` prevents WS snapshots from reverting the button.
   */
  playToggleInflight: false,
  awaitingStatus: null as null | 'running' | 'paused',
};

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

/** Resets accumulated adapter state for a new experiment. */
export const resetLabRuntime = (body: GlobeBodyId, seed: number) => {
  delete labRuntime.pendingSettings[body];
  labRuntime.carries[body] = createAdapterCarry();
  labRuntime.seedByBody[body] = seed;
  labRuntime.awaitingStatus = null;
  labRuntime.playToggleInflight = false;
};

/** Registers (or forgets) the experiment owning a planet. */
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

/** Adapts a backend snapshot and publishes simulation to the store. */
export const applySnapshot = (body: GlobeBodyId, snapshot: StateSnapshot) => {
  const { setSim, selectFallback } = getLabState();
  const seed = labRuntime.seedByBody[body] ?? DEFAULT_SEED;
  const sim = snapshotToSimulation(
    body,
    seed,
    snapshot,
    labRuntime.carries[body],
  );

  // Hold optimistic play/pause until the stream catches up — otherwise a stale
  // frame can flip the button back before the command response lands.
  const awaiting = labRuntime.awaitingStatus;
  if (awaiting) {
    if (snapshot.status === awaiting) labRuntime.awaitingStatus = null;
    else sim.status = awaiting;
  }

  if (!getLabState().recording)
    sim.settings = { ...sim.settings, ...labRuntime.pendingSettings[body] };
  setSim(body, sim);
  if (getLabState().body === body) selectFallback(sim.colonies[0]?.id ?? null);
};

/** Clamps seed to the 1–999999 range. */
export const clampSeed = (raw: string) =>
  Math.max(1, Math.min(999999, Math.floor(Number(raw) || DEFAULT_SEED)));

/** Extracts an error message or returns the fallback. */
export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;
