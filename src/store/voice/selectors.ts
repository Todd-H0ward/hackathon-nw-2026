// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { useVoiceStore, type VoiceStore } from './store';

// ═══════════════════════════════════════════
// SELECTOR HOOKS
// ═══════════════════════════════════════════

export const useVoiceStatus = () =>
  useVoiceStore((store: VoiceStore) => store.status);
export const useVoiceHistory = () =>
  useVoiceStore((store: VoiceStore) => store.history);
export const useVoiceError = () =>
  useVoiceStore((store: VoiceStore) => store.error);
export const useVoiceUserText = () =>
  useVoiceStore((store: VoiceStore) => store.userText);
export const useVoiceRobotResponse = () =>
  useVoiceStore((store: VoiceStore) => store.robotResponse);
export const useClearVoiceHistory = () =>
  useVoiceStore((store: VoiceStore) => store.clearHistory);
export const useToggleVoiceListening = () =>
  useVoiceStore((store: VoiceStore) => store.toggleListening);
export const useDismissVoice = () =>
  useVoiceStore((store: VoiceStore) => store.dismiss);

// ═══════════════════════════════════════════
// IMPERATIVE ACCESS
// ═══════════════════════════════════════════

/**
 * Non-reactive snapshot. Speech bridge writes here from browser-API callbacks
 * and must not re-render from its own updates.
 */
export const getVoiceState = () => useVoiceStore.getState();
