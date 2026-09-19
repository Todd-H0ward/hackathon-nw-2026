import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from 'react';

import { findCommand, resolveResponse } from '@/shared/voice/matcher';
import type {
  VoiceContextValue,
  VoiceHistoryEntry,
  VoiceStatus,
} from '@/shared/voice/types';
import { useSpeechRecognition } from '@/shared/voice/useSpeechRecognition';
import { useSpeechSynthesis } from '@/shared/voice/useSpeechSynthesis';

// State

type VoiceState = {
  status: VoiceStatus;
  history: VoiceHistoryEntry[];
  error: string | null;
};

type VoiceAction =
  | { type: 'SET_STATUS'; payload: VoiceStatus }
  | { type: 'ADD_ENTRY'; payload: VoiceHistoryEntry }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_HISTORY' };

const initialState: VoiceState = {
  status: 'idle',
  history: [],
  error: null,
};

const voiceReducer = (state: VoiceState, action: VoiceAction): VoiceState => {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_ENTRY':
      return { ...state, history: [...state.history, action.payload] };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    default:
      return state;
  }
};

// Context

const VoiceContext = createContext<VoiceContextValue | null>(null);

export const useVoice = (): VoiceContextValue => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside <VoiceProvider>');
  return ctx;
};

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const idCounter = useRef(0);

  const { speak } = useSpeechSynthesis({ lang: 'ru-RU' });

  /** Добавить запись в историю диалога */
  const addEntry = useCallback(
    (type: VoiceHistoryEntry['type'], text: string) => {
      dispatch({
        type: 'ADD_ENTRY',
        payload: {
          id: String(++idCounter.current),
          type,
          text,
          timestamp: Date.now(),
        },
      });
    },
    [],
  );

  /** Обработать распознанный текст */
  const handleResult = useCallback(
    (transcript: string) => {
      dispatch({ type: 'SET_STATUS', payload: 'processing' });
      addEntry('user', transcript);

      const result = findCommand(transcript);

      if (result) {
        const { command, args } = result;
        const responseText = resolveResponse(command, args);

        addEntry('program', responseText);

        dispatch({ type: 'SET_STATUS', payload: 'speaking' });
        speak(responseText, () => {
          dispatch({ type: 'SET_STATUS', payload: 'idle' });
          try {
            command.action(args);
          } catch (err) {
            console.error('[Voice] action error:', err);
          }
        });
      } else {
        const fallback = 'Не понял команду. Попробуйте ещё раз.';
        addEntry('program', fallback);

        dispatch({ type: 'SET_STATUS', payload: 'speaking' });
        speak(fallback, () => {
          dispatch({ type: 'SET_STATUS', payload: 'idle' });
        });
      }
    },
    [addEntry, speak],
  );

  /** Обработать ошибку распознавания */
  const handleError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  }, []);

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({
      lang: 'ru-RU',
      onResult: handleResult,
      onError: handleError,
    });

  // Синхронизируем статус с состоянием прослушивания
  const wrappedStart = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_STATUS', payload: 'listening' });
    startListening();
  }, [startListening]);

  const wrappedStop = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
    stopListening();
  }, [stopListening]);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // Корректируем статус если браузер сам остановил запись
  const status = isListening
    ? 'listening'
    : state.status === 'listening'
      ? 'idle'
      : state.status;

  return (
    <VoiceContext.Provider
      value={{
        status,
        history: state.history,
        isSupported,
        error: state.error,
        startListening: wrappedStart,
        stopListening: wrappedStop,
        clearHistory,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};
