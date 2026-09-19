import {
  type InterventionRequest,
  xenoApiEndpoints,
} from '@/shared/api/xenochoice';
import { announceAction } from '@/shared/voice/action-speech';

import { logIntervention } from '@/features/ecosystem/model';
import { getLabState } from '@/store';

import { applySnapshot, labRuntime } from './lab-runtime';

/** Resolves only after the authoritative engine applies the command. */
export async function performIntervention(
  request: InterventionRequest,
  announce = true,
) {
  const state = getLabState();
  if (state.recording) throw new Error('Сначала выйдите из записи');
  const body = state.body;
  const id = state.experimentIds[body];
  if (!id) throw new Error('Эксперимент ещё не готов');

  const sim = state.sims[body];
  const carry = labRuntime.carries[body];

  const accepted = await xenoApiEndpoints.postIntervention(id, request);
  const current = await xenoApiEndpoints.getExperimentState(id);
  if (current.status !== 'running')
    await xenoApiEndpoints.postCommand(id, { command: 'step' });
  for (let i = 0; i < 40; i++) {
    const snapshot = await xenoApiEndpoints.getExperimentState(id);
    if (snapshot.tick >= accepted.tick) {
      if (
        request.type === 'impulse' ||
        request.type === 'perturbation' ||
        request.type === 'depletion'
      ) {
        const kind =
          request.type === 'impulse'
            ? 'pulse'
            : request.type === 'perturbation'
              ? 'storm'
              : 'scarcity';
        if (carry && sim) {
          carry.effect = { kind, until: sim.tick + (request.duration || 60) };
          logIntervention(carry, sim.tick, request.type);
          state.patchSim(body, {
            effect: carry.effect,
            interventions: [...carry.interventions],
          });
        }
      }

      if (!getLabState().recording && getLabState().experimentIds[body] === id)
        applySnapshot(body, snapshot);
      if (announce) {
        const messages: Record<string, string> = {
          impulse: 'Импульс выполнен',
          perturbation: 'Возмущение выполнено',
          depletion: 'Истощение выполнено',
          add_inoculum: 'Колония создана',
          set_channel: 'Связь изменена',
          set_mode: 'Режим изменён',
          toggle_mutations: request.value
            ? 'Мутации включены'
            : 'Мутации отключены',
          set_flow: `Приток ресурса: ${Math.round(request.value * 50)} процентов`,
          set_noise: `Шум среды: ${Math.round(request.value * 100)} процентов`,
        };
        announceAction(messages[request.type] ?? 'Действие выполнено');
      }
      return snapshot;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Воздействие принято, но исполнение пока не подтверждено');
}
