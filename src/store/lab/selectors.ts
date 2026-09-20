import { useShallow } from 'zustand/react/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import type { Metric, Settings, Simulation } from '@/features/ecosystem';

import { type LabStore, useLabStore } from './store';

export const useLabBody = () => useLabStore((store: LabStore) => store.body);
export const useLabSetBody = () =>
  useLabStore((store: LabStore) => store.setBody);

/** Latest snapshot for the selected planet — a stable reference per snapshot. */
export const useLabSim = () =>
  useLabStore((store: LabStore) => store.sims[store.body]);
export const useLabSims = () => useLabStore((store: LabStore) => store.sims);
export const useLabExperimentId = () =>
  useLabStore((store: LabStore) => store.experimentIds[store.body] ?? null);
export const useLabBooting = () =>
  useLabStore((store: LabStore) => store.booting);
export const useLabStreamStatus = () =>
  useLabStore((store: LabStore) => store.streamStatus);
export const useLabRunning = () =>
  useLabStore((store: LabStore) => store.sims[store.body].status === 'running');

/** Scalar fields — avoid re-rendering chrome on every individuals/history replace. */
export const useLabSimSeed = () =>
  useLabStore((store: LabStore) => store.sims[store.body].seed);
export const useLabSimTick = () =>
  useLabStore((store: LabStore) => store.sims[store.body].tick);
export const useLabSimSettings = () =>
  useLabStore(
    useShallow((store: LabStore): Settings => store.sims[store.body].settings),
  );
export const useLabSimEffect = () =>
  useLabStore((store: LabStore) => store.sims[store.body].effect);

const EMPTY_METRIC: Metric = {
  tick: 0,
  population: 0,
  colonies: 0,
  power: 0,
  efficiency: 0,
  entropy: 0,
  delay: null,
};

type MetricsStrip = { history: Metric[]; tip: Metric };

/** Sparkline + metric cards — equality on tip values, not individuals. */
export const useLabMetricsStrip = (tail = 70): MetricsStrip =>
  useStoreWithEqualityFn(
    useLabStore,
    (store): MetricsStrip => {
      const history = store.sims[store.body].history;
      const tip = history.at(-1) ?? EMPTY_METRIC;
      return { history: history.slice(-tail), tip };
    },
    (a, b) =>
      a.history.length === b.history.length &&
      a.tip.tick === b.tip.tick &&
      a.tip.population === b.tip.population &&
      a.tip.power === b.tip.power &&
      a.tip.efficiency === b.tip.efficiency &&
      a.tip.entropy === b.tip.entropy &&
      a.tip.delay === b.tip.delay &&
      a.tip.colonies === b.tip.colonies,
  );

/** Extinct / replay dialog stats — no individuals array. */
export const useLabSimDialogStats = () =>
  useLabStore(
    useShallow((store: LabStore) => {
      const sim = store.sims[store.body];
      return {
        seed: sim.seed,
        tick: sim.tick,
        births: sim.births,
        deaths: sim.deaths,
        splits: sim.splits,
        interventionCount: sim.interventions.length,
      };
    }),
  );

/**
 * Full sim with equality on identity fields — skips re-render when only
 * nested arrays are replaced with the same tick/checksum/status/snapshot.
 */
export const useLabSimStable = () =>
  useStoreWithEqualityFn(
    useLabStore,
    (store): Simulation => store.sims[store.body],
    (a, b) =>
      a.tick === b.tick &&
      a.checksum === b.checksum &&
      a.status === b.status &&
      a.snapshot === b.snapshot,
  );

export const useLabSpeed = () => useLabStore((store: LabStore) => store.speed);
export const useLabSelected = () =>
  useLabStore((store: LabStore) => store.selected);
export const useLabSetSelected = () =>
  useLabStore((store: LabStore) => store.setSelected);
export const useLabShowLinks = () =>
  useLabStore((store: LabStore) => store.showLinks);
export const useLabToggleShowLinks = () =>
  useLabStore((store: LabStore) => store.toggleShowLinks);
export const useLabShowLabels = () =>
  useLabStore((store: LabStore) => store.showLabels);
export const useLabToggleShowLabels = () =>
  useLabStore((store: LabStore) => store.toggleShowLabels);
export const useLabModal = () => useLabStore((store: LabStore) => store.modal);
export const useLabSetModal = () =>
  useLabStore((store: LabStore) => store.setModal);
export const useLabCameraReset = () =>
  useLabStore((store: LabStore) => store.cameraReset);
export const useLabBumpCameraReset = () =>
  useLabStore((store: LabStore) => store.bumpCameraReset);
export const useLabExpanded = () =>
  useLabStore((store: LabStore) => store.expanded);
export const useLabToggleExpanded = () =>
  useLabStore((store: LabStore) => store.toggleExpanded);
export const useLabSeed = () => useLabStore((store: LabStore) => store.seed);
export const useLabSetSeed = () =>
  useLabStore((store: LabStore) => store.setSeed);

/**
 * Non-reactive snapshot. Async handlers read it after queueing an update, where
 * a captured render value would already be stale.
 */
export const getLabState = () => useLabStore.getState();
