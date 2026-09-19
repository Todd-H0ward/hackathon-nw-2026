import { useVoiceStore, type VoiceStore } from './store';

export const useVoiceStatus = () =>
  useVoiceStore((store: VoiceStore) => store.status);
export const useVoiceHistory = () =>
  useVoiceStore((store: VoiceStore) => store.history);
export const useVoiceError = () =>
  useVoiceStore((store: VoiceStore) => store.error);
export const useClearVoiceHistory = () =>
  useVoiceStore((store: VoiceStore) => store.clearHistory);

/**
 * Non-reactive snapshot. The speech bridge writes here from browser-API
 * callbacks and must not re-render on its own updates.
 */
export const getVoiceState = () => useVoiceStore.getState();
