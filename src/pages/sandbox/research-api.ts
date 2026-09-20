import {
  type InterventionRequest,
  type StateSnapshot,
  xenoApiEndpoints,
} from '@/shared/api/xenochoice';
import { announceAction } from '@/shared/voice/action-speech';

import { logIntervention } from '@/features/ecosystem/model';
import { getLabState } from '@/store';

import { applySnapshot, labRuntime } from './lab-runtime';

const WAIT_ATTEMPTS = 16;
const WAIT_INTERVAL_MS = 150;

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

const applyLocalEffect = (
  body: ReturnType<typeof getLabState>['body'],
  request: InterventionRequest,
  acceptedTick: number,
) => {
  if (
    request.type !== 'impulse' &&
    request.type !== 'perturbation' &&
    request.type !== 'depletion'
  ) {
    return;
  }
  const state = getLabState();
  const sim = state.sims[body];
  const carry = labRuntime.carries[body];
  if (!carry || !sim) return;

  const kind =
    request.type === 'impulse'
      ? 'pulse'
      : request.type === 'perturbation'
        ? 'storm'
        : 'scarcity';
  carry.effect = {
    kind,
    until: acceptedTick + (request.duration || 60),
  };
  logIntervention(carry, acceptedTick, request.type);
  state.patchSim(body, {
    effect: carry.effect,
    interventions: [...carry.interventions],
  });
};

const announceIntervention = (request: InterventionRequest) => {
  const messages: Record<string, string> = {
    impulse: 'Импульс выполнен',
    perturbation: 'Возмущение выполнено',
    depletion: 'Истощение выполнено',
    add_inoculum: 'Колония создана',
    set_channel: 'Связь изменена',
    set_mode: 'Режим изменён',
    toggle_mutations: request.value ? 'Мутации включены' : 'Мутации отключены',
    set_flow: `Приток ресурса: ${Math.round(request.value * 50)} процентов`,
    set_noise: `Шум среды: ${Math.round(request.value * 100)} процентов`,
  };
  announceAction(messages[request.type] ?? 'Действие выполнено');
};

/** Resolves only after the authoritative engine applies the command. */
export async function performIntervention(
  request: InterventionRequest,
  announce = true,
  signal?: AbortSignal,
) {
  const state = getLabState();
  if (state.recording) throw new Error('Сначала выйдите из записи');
  const body = state.body;
  const id = state.experimentIds[body];
  if (!id) throw new Error('Эксперимент ещё не готов');

  const accepted = await xenoApiEndpoints.postIntervention(id, request);
  signal?.throwIfAborted();

  const current = await xenoApiEndpoints.getExperimentState(id);
  signal?.throwIfAborted();
  if (current.status !== 'running')
    await xenoApiEndpoints.postCommand(id, { command: 'step' });

  for (let i = 0; i < WAIT_ATTEMPTS; i++) {
    signal?.throwIfAborted();

    // Prefer the live store if the WebSocket already flushed this tick.
    const streamed = getLabState().sims[body];
    let snapshot: StateSnapshot | null = null;
    if (streamed && streamed.tick >= accepted.tick && streamed.snapshot) {
      snapshot = streamed.snapshot;
    } else {
      snapshot = await xenoApiEndpoints.getExperimentState(id);
      if (snapshot.tick < accepted.tick) {
        await sleep(WAIT_INTERVAL_MS, signal);
        continue;
      }
      if (!getLabState().recording && getLabState().experimentIds[body] === id)
        applySnapshot(body, snapshot);
    }

    applyLocalEffect(body, request, accepted.tick);
    if (announce) announceIntervention(request);
    return snapshot;
  }
  throw new Error('Воздействие принято, но исполнение пока не подтверждено');
}
