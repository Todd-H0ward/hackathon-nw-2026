import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Mic, X } from 'lucide-react';

import { xenoApiEndpoints as api } from '@/shared/api/xenochoice';
import { cn } from '@/shared/lib/utils';
import { useSpeechRecognition, useSpeechSynthesis } from '@/shared/voice';
import { useAudioPreferences } from '@/shared/voice/action-speech';
import { parseResearchVoiceCommand } from '@/shared/voice/intents';

import {
  getLabState,
  useDismissVoice,
  useVoiceError,
  useVoiceRobotResponse,
  useVoiceStatus,
  useVoiceStore,
  useVoiceUserText,
} from '@/store';

import { applySnapshot } from './lab-runtime';
import { performIntervention } from './research-api';

export const ResearchVoice = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const [open, setOpen] = useState(false);
  const [, setBusy] = useState(false);
  const { speak, cancel } = useSpeechSynthesis();

  const status = useVoiceStatus();
  const userText = useVoiceUserText();
  const robotResponse = useVoiceRobotResponse();
  const error = useVoiceError();
  const dismiss = useDismissVoice();

  const isListeningStatus = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  const execute = async (text: string) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);

    useVoiceStore.getState().setUserText(text);
    useVoiceStore.getState().setStatus('processing');
    useVoiceStore.getState().setError(null);

    let response = '';

    try {
      const cmd = parseResearchVoiceCommand(text);
      if (!cmd) {
        throw new Error(
          'Команда не распознана. Пример: «сделай импульс» или «увеличь приток на 10».',
        );
      }

      const state = getLabState();
      const id = state.experimentIds[state.body];

      if (state.recording && cmd.type !== 'intent') {
        throw new Error('Сначала выйдите из записи');
      }

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

    useVoiceStore.getState().setRobotResponse(response);
    useVoiceStore.getState().addEntry('user', text);
    useVoiceStore.getState().addEntry('program', response);
    setBusy(false);

    if (!useAudioPreferences.getState().enabled) {
      locked.current = false;
      useVoiceStore.getState().setStatus('idle');
      return;
    }

    useVoiceStore.getState().setStatus('speaking');
    speak(response, () => {
      locked.current = false;
      useVoiceStore.getState().setStatus('idle');
    });
  };

  const {
    isListening: speechListening,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (text) => void execute(text),
    onError: (err) => {
      locked.current = false;
      setBusy(false);
      useVoiceStore.getState().setError(err);
      useVoiceStore.getState().setStatus('idle');
    },
  });

  const isListening = speechListening || isListeningStatus;
  const isAnimating = isListening || isSpeaking || isProcessing;
  const listeningActive = isListening;

  const isOpen =
    open || listeningActive || Boolean(robotResponse) || Boolean(error);

  const handleClose = useCallback(() => {
    if (speechListening) stopListening();
    cancel();
    dismiss();
    setOpen(false);
  }, [speechListening, stopListening, cancel, dismiss]);

  const handleToggle = useCallback(() => {
    if (!isSupported) {
      useVoiceStore
        .getState()
        .setError('Голос доступен в браузерах Chrome / Edge');
      setOpen(true);
      return;
    }
    if (!window.isSecureContext) {
      useVoiceStore.getState().setError('Для микрофона требуется HTTPS');
      setOpen(true);
      return;
    }

    if (isOpen && speechListening) {
      handleClose();
      return;
    }

    cancel();
    locked.current = false;
    useVoiceStore.getState().setError(null);
    useVoiceStore.getState().setUserText('');
    useVoiceStore.getState().setRobotResponse('');
    useVoiceStore.getState().setStatus('listening');
    setOpen(true);
    startListening();
  }, [
    isOpen,
    isSupported,
    speechListening,
    cancel,
    handleClose,
    startListening,
  ]);

  // Закрытие по клику вне поповера
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, handleClose]);

  // Автозакрытие через 14 секунд после получения ответа при бездействии
  useEffect(() => {
    if (status === 'idle' && robotResponse && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 14000);
      return () => clearTimeout(timer);
    }
  }, [status, robotResponse, isOpen, handleClose]);

  const waveColorClass = isListening
    ? 'bg-primary shadow-[0_0_8px_rgba(235,94,40,0.8)]'
    : isSpeaking
      ? 'bg-xeno-green shadow-[0_0_8px_rgba(176,206,147,0.8)]'
      : isProcessing
        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
        : 'bg-primary/80';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={
          listeningActive
            ? 'Остановить запись голоса'
            : 'Включить голосовое управление'
        }
        title={
          listeningActive
            ? 'Слушаю вас... Нажмите для остановки'
            : 'Голосовое управление'
        }
        aria-pressed={listeningActive}
        onClick={handleToggle}
        className={cn(
          'relative grid size-9 place-items-center rounded-md transition-all duration-200 cursor-pointer select-none',
          listeningActive
            ? 'bg-primary text-primary-foreground shadow-[0_0_14px_rgba(235,94,40,0.7)] ring-2 ring-primary/40'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        )}
      >
        <Mic size={17} className={cn(listeningActive && 'animate-pulse')} />
      </button>

      {/* Поповер ассистента */}
      {isOpen && (
        <div className="absolute bottom-0 left-12 z-50 w-72 rounded-xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-3xl opacity-95 max-mobile:top-12 max-mobile:bottom-auto max-mobile:left-auto max-mobile:right-0 animate-in fade-in zoom-in-95 duration-150">
          {/* Кнопка закрытия */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-sm"
            title="Закрыть"
          >
            <X size={13} />
          </button>

          {/* Волна посредине */}
          <div
            className="my-3 flex items-center justify-center gap-2 select-none"
            aria-hidden="true"
          >
            <span
              className={cn(
                'w-1.5 h-[16px] rounded-full origin-center transition-colors duration-200',
                waveColorClass,
              )}
              style={
                isAnimating
                  ? {
                      animation: 'voice-wave-bar 0.75s ease-in-out infinite',
                      animationDelay: '0s',
                    }
                  : undefined
              }
            />
            <span
              className={cn(
                'w-1.5 h-[26px] rounded-full origin-center transition-colors duration-200',
                waveColorClass,
              )}
              style={
                isAnimating
                  ? {
                      animation: 'voice-wave-bar 0.75s ease-in-out infinite',
                      animationDelay: '0.15s',
                    }
                  : undefined
              }
            />
            <span
              className={cn(
                'size-2 rounded-full origin-center transition-colors duration-200',
                waveColorClass,
              )}
              style={
                isAnimating
                  ? {
                      animation: 'voice-wave-dot 0.75s ease-in-out infinite',
                      animationDelay: '0.3s',
                    }
                  : undefined
              }
            />
            <span
              className={cn(
                'w-1.5 h-[26px] rounded-full origin-center transition-colors duration-200',
                waveColorClass,
              )}
              style={
                isAnimating
                  ? {
                      animation: 'voice-wave-bar 0.75s ease-in-out infinite',
                      animationDelay: '0.15s',
                    }
                  : undefined
              }
            />
            <span
              className={cn(
                'w-1.5 h-[16px] rounded-full origin-center transition-colors duration-200',
                waveColorClass,
              )}
              style={
                isAnimating
                  ? {
                      animation: 'voice-wave-bar 0.75s ease-in-out infinite',
                      animationDelay: '0s',
                    }
                  : undefined
              }
            />
          </div>

          {/* Текст статуса и ответа снизу */}
          <div className="space-y-1.5 text-center">
            {isListening && (
              <p className="font-mono text-[10px] uppercase font-semibold text-primary tracking-wider animate-pulse">
                Слушаю вас…
              </p>
            )}

            {isProcessing && (
              <p className="font-mono text-[10px] uppercase font-semibold text-amber-300 tracking-wider animate-pulse">
                Обработка…
              </p>
            )}

            {userText && (
              <p className="text-xs text-muted-foreground italic truncate px-1">
                «{userText}»
              </p>
            )}

            {robotResponse && (
              <div className="mt-2 rounded-lg border border-primary/30 bg-primary/15 backdrop-blur-sm p-2.5 text-center">
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {robotResponse}
                </p>
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-destructive leading-tight px-1">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
