/** Web Speech API hook — speech synthesis with Russian voice selection. */

import { useCallback, useRef, useState } from 'react';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

type UseSpeechSynthesisOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

type UseSpeechSynthesisReturn = {
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
};

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export const useSpeechSynthesis = ({
  lang = 'ru-RU',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
}: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported || !text.trim()) {
        onEnd?.();
        return;
      }

      // Stop previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      const voices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
      utterance.voice =
        voices.find((v) => /natural|neural|google/i.test(v.name)) ??
        voices[0] ??
        null;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      let hasEnded = false;
      const handleEnd = () => {
        if (!hasEnded) {
          hasEnded = true;
          setIsSpeaking(false);
          onEnd?.();
        }
      };

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = handleEnd;
      utterance.onerror = handleEnd;

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      // Chrome bug workaround: speech synthesis can stall while paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    },
    [isSupported, lang, rate, pitch, volume],
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
};
