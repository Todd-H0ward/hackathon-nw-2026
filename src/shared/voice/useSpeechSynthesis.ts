import { useCallback, useRef, useState } from 'react';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useSpeechSynthesis({
  lang = 'ru-RU',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
}: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
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

      // Останавливаем предыдущую речь
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
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

      // Решение бага Chrome, когда синтез речи может зависнуть на паузе
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
}
