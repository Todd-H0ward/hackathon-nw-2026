import { xenoApi } from './client';
import type {
  ApiResponse,
  CommandRequest,
  CommandResult,
  CreateExperimentRequest,
  Experiment,
  ExportBundle,
  ExportFormat,
  Intervention,
  InterventionRequest,
  ReplayRequest,
  StateSnapshot,
  World,
} from './types';

/** Unwraps the `{success, data}` / `{success:false, error}` envelope. */
async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const { data: body } = await promise;
  if (!body.success) {
    throw new Error(body.error.message || body.error.code);
  }
  return body.data;
}

export const getWorlds = () => unwrap<World[]>(xenoApi.get('/worlds'));

export const createExperiment = (request: CreateExperimentRequest) =>
  unwrap<Experiment>(xenoApi.post('/experiments', request));

/** Authoritative snapshot — used as the fallback while the WS stream is down. */
export const getExperimentState = (id: string) =>
  unwrap<StateSnapshot>(xenoApi.get(`/experiments/${id}/state`));

export const postCommand = (id: string, command: CommandRequest) =>
  unwrap<CommandResult>(xenoApi.post(`/experiments/${id}/commands`, command));

export const postIntervention = (
  id: string,
  intervention: InterventionRequest,
) =>
  unwrap<Intervention>(
    xenoApi.post(`/experiments/${id}/interventions`, intervention),
  );

/** Export returns the bundle directly — no `{success,data}` envelope. */
export const exportExperiment = async (
  id: string,
  format: ExportFormat = 'json',
) => {
  const { data } = await xenoApi.get<ExportBundle | string>(
    `/experiments/${id}/export`,
    { params: { format }, responseType: format === 'csv' ? 'text' : 'json' },
  );
  return data;
};

export const replayExperiment = (id: string, request: ReplayRequest) =>
  unwrap<StateSnapshot>(xenoApi.post(`/experiments/${id}/replay`, request));

export const importExperiment = (bundle: unknown) =>
  unwrap<Experiment>(xenoApi.post('/experiments/import', bundle));
export const getExperiment = (id: string) =>
  unwrap<Experiment>(xenoApi.get(`/experiments/${id}`));
export const previewExperiment = (id: string, tick: number) =>
  unwrap<StateSnapshot>(
    xenoApi.get(`/experiments/${id}/preview`, { params: { tick } }),
  );
export const deleteExperiment = (id: string) =>
  xenoApi.delete(`/experiments/${id}`);
export const getMetrics = (id: string) =>
  unwrap<import('./types').MetricsSnapshot[]>(
    xenoApi.get(`/experiments/${id}/metrics`),
  );
