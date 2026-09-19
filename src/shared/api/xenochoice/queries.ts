import { useMutation, useQuery } from '@tanstack/react-query';

import * as api from './endpoints';
import { xenoKeys } from './query-keys';
import type {
  CommandRequest,
  CreateExperimentRequest,
  ExportFormat,
  InterventionRequest,
  ReplayRequest,
} from './types';

/** How often the REST fallback re-reads the snapshot while the WS is down. */
const STATE_POLL_MS = 2000;

/**
 * Reference data for Earth/Mars/Venus — static per session, safe to cache long.
 * Everything downstream is gated on this query, so it retries with backoff:
 * the sandbox host is not always up when the page loads.
 */
export const useWorlds = () =>
  useQuery({
    queryKey: xenoKeys.worlds(),
    queryFn: api.getWorlds,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

/** Fallback source of truth when `useExperimentStream` cannot hold a socket. */
export const useExperimentStatePolling = (
  experimentId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: xenoKeys.state(experimentId),
    queryFn: () => api.getExperimentState(experimentId as string),
    enabled: experimentId !== null && enabled,
    refetchInterval: STATE_POLL_MS,
  });

export const useCreateExperiment = () =>
  useMutation({
    mutationFn: (request: CreateExperimentRequest) =>
      api.createExperiment(request),
  });

/** `mutate({ experimentId, ...command })` — id travels with each call, not the hook. */
export const useCommand = () =>
  useMutation({
    mutationFn: ({
      experimentId,
      ...command
    }: CommandRequest & { experimentId: string }) =>
      api.postCommand(experimentId, command),
  });

export const useIntervention = () =>
  useMutation({
    mutationFn: ({
      experimentId,
      ...intervention
    }: InterventionRequest & { experimentId: string }) =>
      api.postIntervention(experimentId, intervention),
  });

export const useReplayExperiment = () =>
  useMutation({
    mutationFn: ({
      experimentId,
      ...request
    }: ReplayRequest & { experimentId: string }) =>
      api.replayExperiment(experimentId, request),
  });

/** Not a hook — triggers a browser download rather than rendering data. */
export const downloadExperimentExport = async (
  experimentId: string,
  format: ExportFormat = 'json',
) => {
  const bundle = await api.exportExperiment(experimentId, format);
  const text =
    typeof bundle === 'string' ? bundle : JSON.stringify(bundle, null, 2);
  const mime = format === 'csv' ? 'text/csv' : 'application/json';
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `xenochoice-${experimentId}.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
