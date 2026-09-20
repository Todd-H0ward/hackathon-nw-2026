/** UI action speech via SpeechSynthesis and zustand preferences. */

import { create } from 'zustand';

// ═══════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════

export const useAudioPreferences = create<{
  enabled: boolean;
  toggle: () => void;
}>((set) => ({
  enabled: false,
  toggle: () =>
    set((state) => {
      if (state.enabled && typeof window !== 'undefined')
        window.speechSynthesis?.cancel();
      return { enabled: !state.enabled };
    }),
}));

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Mouse and keyboard actions speak only after an authoritative success. */
export function announceAction(text: string) {
  if (
    !useAudioPreferences.getState().enabled ||
    typeof window === 'undefined' ||
    !window.speechSynthesis
  )
    return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('ru'));
  utterance.voice =
    voices.find((v) => /natural|neural|google/i.test(v.name)) ??
    voices[0] ??
    null;
  window.speechSynthesis.speak(utterance);
}
