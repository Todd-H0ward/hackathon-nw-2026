import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Mic } from 'lucide-react';

import { xenoApiEndpoints as api } from '@/shared/api/xenochoice';
import { useSpeechRecognition, useSpeechSynthesis } from '@/shared/voice';
import { useAudioPreferences } from '@/shared/voice/action-speech';
import { parseResearchVoiceCommand } from '@/shared/voice/intents';

import { getLabState } from '@/store';

import { applySnapshot } from './lab-runtime';
import { performIntervention } from './research-api';

export const ResearchVoice = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const { speak, isSpeaking, cancel } = useSpeechSynthesis();

  const execute = async (text: string) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage(`Вы: ${text}`);
    let response = '';

    try {
      const cmd = parseResearchVoiceCommand(text);
      if (!cmd) {
        throw new Error(
          'Скажите команду. Например: «сделай импульс» или «увеличь приток на 10».',
        );
      }

      const state = getLabState();
      const id = state.experimentIds[state.body];

      if (state.recording && cmd.type !== 'intent')
        throw new Error('Сначала выйдите из записи');
      const sendCommand = async (command: string, speed?: 1 | 2 | 5) => {
        if (!id) throw new Error('Эксперимент ещё не готов');
        const result = await api.postCommand(id, {
          command: command as 'start' | 'pause' | 'step' | 'setSpeed',
          speed,
        });
        if (speed) getLabState().setSpeed(speed);
        if (!getLabState().recording) {
          getLabState().patchSim(state.body, { status: result.status });
          applySnapshot(state.body, await api.getExperimentState(id));
        }
      };
      if (cmd.type === 'setting') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        const sim = state.sims[state.body];
        const currentVal = sim?.settings[cmd.setting] ?? 50;
        let nextVal: number;
        if (cmd.mode === 'relative') {
          nextVal = Math.max(
            0,
            Math.min(100, Math.round(currentVal + cmd.value)),
          );
        } else {
          nextVal = Math.max(0, Math.min(100, Math.round(cmd.value)));
        }
        await performIntervention(
          {
            type: cmd.setting === 'resource' ? 'set_flow' : 'set_noise',
            targetId: state.body,
            value: nextVal / (cmd.setting === 'resource' ? 50 : 100),
          },
          false,
        );
        const name =
          cmd.setting === 'resource' ? 'Приток ресурса' : 'Шум среды';
        response = `${name} установлен на ${nextVal}%`;
      } else if (cmd.type === 'mutation') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        await performIntervention(
          {
            type: 'toggle_mutations',
            targetId: state.body,
            value: cmd.value ? 1 : 0,
          },
          false,
        );
        response = cmd.value
          ? 'Мутации при делении включены'
          : 'Мутации при делении отключены';
      } else if (cmd.type === 'speed') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        await sendCommand('setSpeed', cmd.value);
        response = `Скорость симуляции: x${cmd.value}`;
      } else if (cmd.type === 'intent') {
        const intent = cmd.intent;
        if (
          [
            'analytics',
            'laboratory',
            'population',
            'entropy',
            'power',
            'efficiency',
          ].includes(intent)
        ) {
          if (intent === 'laboratory') navigate('/sandbox');
          else
            navigate(
              `/sandbox/analytics?metric=${intent === 'analytics' ? 'population' : intent}`,
            );
          response =
            intent === 'laboratory'
              ? 'Лаборатория открыта'
              : 'График переключён';
        } else {
          if (state.recording) {
            throw new Error(
              'В записи события отключены. Вернитесь к живому опыту.',
            );
          }
          if (!id) throw new Error('Эксперимент ещё не готов');

          if (intent === 'colony') {
            state.setColonyDraft({ lat: 20, lng: 10 });
            navigate('/sandbox');
            response =
              'Конструктор колонии открыт. Выберите место и параметры.';
          } else if (['impulse', 'storm', 'depletion'].includes(intent)) {
            await performIntervention(
              {
                type:
                  intent === 'storm'
                    ? 'perturbation'
                    : intent === 'impulse'
                      ? 'impulse'
                      : 'depletion',
                targetId: state.body,
                value: intent === 'impulse' ? 2 : 1,
                duration: 60,
              },
              false,
            );
            response =
              intent === 'impulse'
                ? 'Импульс выполнен'
                : intent === 'storm'
                  ? 'Возмущение выполнено'
                  : 'Истощение выполнено';
          } else if (intent === 'pause') {
            if (state.sims[state.body]?.status === 'running') {
              await sendCommand('pause');
            }
            response = 'Эксперимент на паузе';
          } else if (intent === 'start') {
            if (state.sims[state.body]?.status !== 'running') {
              await sendCommand('start');
            }
            response = 'Эксперимент запущен';
          } else if (intent === 'step') {
            await sendCommand('step');
            response = 'Один такт выполнен';
          }
        }
      }
    } catch (e) {
      response =
        e instanceof Error ? e.message : 'Не удалось выполнить команду';
    }

    setMessage(response);
    setBusy(false);
    if (!useAudioPreferences.getState().enabled) {
      locked.current = false;
      return;
    }
    speak(response, () => {
      locked.current = false;
    });
  };

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({
      onResult: (text) => void execute(text),
      onError: (error) => {
        locked.current = false;
        setBusy(false);
        setMessage(error);
      },
    });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Голосовое управление"
        title="Голосовое управление"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
      >
        <Mic size={17} />
      </button>
      <div
        hidden={!open}
        className="absolute bottom-0 left-11 z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-xl max-mobile:top-11 max-mobile:bottom-auto max-mobile:left-auto max-mobile:right-0"
      >
        <p className="mb-2 text-xs">Голосовое управление · одна команда</p>
        <button
          type="button"
          className="rounded border border-primary/40 px-2 py-1 disabled:opacity-50"
          disabled={
            !isSupported || !window.isSecureContext || busy || isSpeaking
          }
          onClick={() => {
            if (isListening) {
              stopListening();
              return;
            }
            cancel();
            locked.current = false;
            setMessage('Слушаю одну команду…');
            startListening();
          }}
        >
          {isListening ? '■ Остановить' : '🎙 Голос'}
        </button>
        <span
          role="status"
          className="max-w-72 text-[11px] text-muted-foreground"
        >
          {!window.isSecureContext
            ? 'Для микрофона нужен HTTPS'
            : !isSupported
              ? 'Голос доступен в Chrome / Edge'
              : message || 'Одна фраза — одно действие'}
        </span>
      </div>
    </div>
  );
};
