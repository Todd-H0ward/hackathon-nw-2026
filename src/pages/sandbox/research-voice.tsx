import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useSpeechRecognition, useSpeechSynthesis } from '@/shared/voice';
import { parseResearchVoiceCommand } from '@/shared/voice/intents';

import { getLabState } from '@/store';

import { useLabActions } from './use-lab-actions';

export const ResearchVoice = () => {
  const navigate = useNavigate();
  const actions = useLabActions();
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

      if (cmd.type === 'setting') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        const sim = state.sims[state.body];
        const currentVal = sim?.settings[cmd.setting] ?? 50;
        let nextVal: number;
        if (cmd.mode === 'relative') {
          nextVal = Math.max(0, Math.min(100, Math.round(currentVal + cmd.value)));
        } else {
          nextVal = Math.max(0, Math.min(100, Math.round(cmd.value)));
        }
        actions.applySettings({ [cmd.setting]: nextVal });
        const name = cmd.setting === 'resource' ? 'Приток ресурса' : 'Шум среды';
        response = `${name} установлен на ${nextVal}%`;
      } else if (cmd.type === 'mutation') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        actions.applySettings({ mutation: cmd.value });
        response = cmd.value
          ? 'Мутации при делении включены'
          : 'Мутации при делении отключены';
      } else if (cmd.type === 'speed') {
        if (!id) throw new Error('Эксперимент ещё не готов');
        actions.setSpeed(cmd.value);
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
            response = 'Конструктор колонии открыт. Выберите место и параметры.';
          } else if (['impulse', 'storm', 'depletion'].includes(intent)) {
            const uiType =
              intent === 'impulse'
                ? 'pulse'
                : intent === 'storm'
                  ? 'storm'
                  : 'scarcity';
            actions.applyIntervention({ type: uiType });
            if (state.sims[state.body]?.status !== 'running') {
              actions.step();
            }
            response =
              intent === 'impulse'
                ? 'Импульс выполнен'
                : intent === 'storm'
                  ? 'Возмущение выполнено'
                  : 'Истощение выполнено';
          } else if (intent === 'pause') {
            if (state.sims[state.body]?.status === 'running') {
              actions.toggleRunning();
            }
            response = 'Эксперимент на паузе';
          } else if (intent === 'start') {
            if (state.sims[state.body]?.status !== 'running') {
              actions.toggleRunning();
            }
            response = 'Эксперимент запущен';
          } else if (intent === 'step') {
            actions.step();
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded border border-primary/40 px-2 py-1 disabled:opacity-50"
        disabled={!isSupported || !window.isSecureContext || busy || isSpeaking}
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
  );
};
