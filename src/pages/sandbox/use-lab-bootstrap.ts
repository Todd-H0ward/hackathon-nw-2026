import { useCallback, useEffect } from 'react';

import {
  type StateSnapshot,
  useExperimentStatePolling,
  useExperimentStream,
} from '@/shared/api/xenochoice';

import { useWorldCatalog } from '@/features/ecosystem';
import { getLabState, useLabBody, useLabExperimentId } from '@/store';
import { useLabStore } from '@/store/lab/store';

import { applySnapshot, clampSeed, labRuntime } from './lab-runtime';
import { useEnsureExperiment } from './use-ensure-experiment';

/**
 * Owns everything with a lifecycle: creating the experiment for the selected
 * planet, holding the WebSocket stream and falling back to REST polling.
 *
 * Must be mounted exactly once (SandboxLayout). There is no context around it —
 * the single call site is what guarantees one experiment and one socket.
 */
export const useLabBootstrap = () => {
  const body = useLabBody();
  const recording = useLabStore((s) => s.recording !== null);
  const experimentId = useLabExperimentId();
  const worlds = useWorldCatalog();
  const ensureExperiment = useEnsureExperiment();

  // biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap runs on a planet switch or once worlds load; the seed is read as its latest value on purpose.
  useEffect(() => {
    if (!worlds.isSuccess || recording) return;
    void ensureExperiment(body, clampSeed(getLabState().seed));
  }, [body, worlds.isSuccess, recording]);

  const handleSnapshot = useCallback(
    (snapshot: StateSnapshot, sourceExperimentId: string) => {
      if (getLabState().recording) return;
      const target = labRuntime.bodyByExperiment[sourceExperimentId];
      if (!target) return;
      applySnapshot(target, snapshot);
    },
    [],
  );

  const streamStatus = useExperimentStream(
    experimentId,
    experimentId !== null && !recording,
    handleSnapshot,
  );

  useEffect(() => {
    getLabState().setStreamStatus(streamStatus);
  }, [streamStatus]);

  const streamDown =
    streamStatus === 'reconnecting' || streamStatus === 'failed';
  const statePolling = useExperimentStatePolling(experimentId, streamDown);

  useEffect(() => {
    if (!statePolling.data || !experimentId) return;
    handleSnapshot(statePolling.data, experimentId);
  }, [statePolling.data, experimentId, handleSnapshot]);

  // Debounced interventions are keyed per setting in module state; drop any
  // pending timer when the lab unmounts so it cannot fire against a dead route.
  useEffect(
    () => () => {
      for (const timer of Object.values(labRuntime.settingsTimers)) {
        if (timer) clearTimeout(timer);
      }
    },
    [],
  );
};
