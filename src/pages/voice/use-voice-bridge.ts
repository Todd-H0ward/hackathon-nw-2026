import { useCallback, useEffect } from 'react';

import {
  findCommand,
  resolveResponse,
  useSpeechRecognition,
  useSpeechSynthesis,
} from '@/shared/voice';

import { getVoiceState } from '@/store';

/** Bridge between Web Speech API and store/voice. Mounted exactly once. */

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const LANG = 'ru-RU';
const FALLBACK_RESPONSE = 'Не понял команду. Попробуйте ещё раз.';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type VoiceBridge = {
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
};

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

/** Connects speech recognition and synthesis to the global store. */
export const useVoiceBridge = (): VoiceBridge => {
  const { speak } = useSpeechSynthesis({ lang: LANG });

  const handleResult = useCallback(
    (transcript: string) => {
      const { setStatus, addEntry } = getVoiceState();

      setStatus('processing');
      addEntry('user', transcript);

      const match = findCommand(transcript);

      if (!match) {
        addEntry('program', FALLBACK_RESPONSE);
        setStatus('speaking');
        speak(FALLBACK_RESPONSE, () => setStatus('idle'));
        return;
      }

      const { command, args } = match;
      const responseText = resolveResponse(command, args);

      addEntry('program', responseText);
      setStatus('speaking');
      speak(responseText, () => {
        setStatus('idle');
        try {
          command.action(args);
        } catch (error) {
          console.error('[Voice] action error:', error);
        }
      });
    },
    [speak],
  );

  const handleError = useCallback((error: string) => {
    const { setError, setStatus } = getVoiceState();
    setError(error);
    setStatus('idle');
  }, []);

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({
      lang: LANG,
      onResult: handleResult,
      onError: handleError,
    });

  // The browser stops the recogniser on its own after a phrase or a timeout;
  // mirror that back into the store so the UI never sticks on "listening".
  useEffect(() => {
    const { status, setStatus } = getVoiceState();
    if (isListening && status !== 'listening') setStatus('listening');
    if (!isListening && status === 'listening') setStatus('idle');
  }, [isListening]);

  const start = useCallback(() => {
    const { setError, setStatus } = getVoiceState();
    setError(null);
    setStatus('listening');
    startListening();
  }, [startListening]);

  const stop = useCallback(() => {
    getVoiceState().setStatus('idle');
    stopListening();
  }, [stopListening]);

  return { isSupported, startListening: start, stopListening: stop };
};
