import { create } from 'zustand';

import type { VoiceHistoryEntry, VoiceStatus } from '@/shared/voice';

export type VoiceStore = {
  status: VoiceStatus;
  history: VoiceHistoryEntry[];
  error: string | null;
  setStatus: (status: VoiceStatus) => void;
  addEntry: (type: VoiceHistoryEntry['type'], text: string) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
};

/** Monotonic id for history entries; never read outside this module. */
let nextEntryId = 0;

export const useVoiceStore = create<VoiceStore>((set) => ({
  status: 'idle',
  history: [],
  error: null,

  setStatus: (status) => set({ status }),
  addEntry: (type, text) =>
    set((state) => ({
      history: [
        ...state.history,
        { id: String(++nextEntryId), type, text, timestamp: Date.now() },
      ],
    })),
  setError: (error) => set({ error }),
  clearHistory: () => set({ history: [] }),
}));
