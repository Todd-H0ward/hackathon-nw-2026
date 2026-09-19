import { useCallback, useEffect, useRef, useState } from 'react';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

/** Тип конструктора SpeechRecognition (включает webkit-вариант) */
type SpeechRecognitionConstructor = new () => SpeechRecognition;

/** Расширенный window с webkit-вариантом */
type WindowWithSpeechRecognition = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useSpeechRecognition({
  lang = 'ru-RU',
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Проверяем поддержку браузером
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Создаём инстанс один раз
  useEffect(() => {
    if (!isSupported) return;

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = false;       // останавливаться после одной фразы
    recognition.interimResults = false;   // ждать финального результата
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      onResultRef.current?.(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === 'not-allowed'
          ? 'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.'
          : event.error === 'network'
            ? 'Ошибка сети при распознавании речи.'
            : `Ошибка распознавания: ${event.error}`;
      onErrorRef.current?.(msg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Игнорируем ошибку если уже запущен
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}
