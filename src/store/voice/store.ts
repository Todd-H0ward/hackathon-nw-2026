import { create } from 'zustand';

import type { VoiceHistoryEntry, VoiceStatus } from '@/shared/voice';

export type VoiceStore = {
  status: VoiceStatus;
  history: VoiceHistoryEntry[];
  error: string | null;
  userText: string;
  robotResponse: string;
  setStatus: (status: VoiceStatus) => void;
  setUserText: (text: string) => void;
  setRobotResponse: (response: string) => void;
  addEntry: (type: VoiceHistoryEntry['type'], text: string) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  toggleHandler: (() => void) | null;
  registerToggleHandler: (fn: (() => void) | null) => void;
  toggleListening: () => void;
  dismiss: () => void;
};

/** Monotonic id for history entries; never read outside this module. */
let nextEntryId = 0;

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  status: 'idle',
  history: [],
  error: null,
  userText: '',
  robotResponse: '',
  toggleHandler: null,

  setStatus: (status) => set({ status }),
  setUserText: (userText) => set({ userText }),
  setRobotResponse: (robotResponse) => set({ robotResponse }),
  addEntry: (type, text) =>
    set((state) => ({
      history: [
        ...state.history,
        { id: String(++nextEntryId), type, text, timestamp: Date.now() },
      ],
    })),
  setError: (error) => set({ error }),
  clearHistory: () => set({ history: [] }),
  registerToggleHandler: (fn) => set({ toggleHandler: fn }),
  toggleListening: () => {
    const handler = get().toggleHandler;
    if (handler) {
      handler();
    }
  },
  dismiss: () =>
    set({
      status: 'idle',
      userText: '',
      robotResponse: '',
      error: null,
    }),
}));
