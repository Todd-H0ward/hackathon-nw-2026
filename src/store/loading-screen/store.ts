// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { create } from 'zustand';

// ═══════════════════════════════════════════
// STORE TYPE
// ═══════════════════════════════════════════

/** Zustand store for the app loading screen. */
export type LoadingScreenStore = {
  /** Whether the loading screen is active. */
  isLoading: boolean;
  /** Current status text. */
  statusText: string;
  setStatusText: (text: string) => void;
  startLoading: (statusText?: string) => void;
  finishLoading: () => void;
  dismiss: () => void;
};

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════

const DEFAULT_STATUS = 'Синхронизация орбитальных систем';

// ═══════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════

export const useLoadingScreenStore = create<LoadingScreenStore>((set) => ({
  isLoading: true,
  statusText: DEFAULT_STATUS,

  setStatusText: (statusText) => set({ statusText }),
  startLoading: (statusText = DEFAULT_STATUS) =>
    set({ isLoading: true, statusText }),
  finishLoading: () => set({ isLoading: false }),
  dismiss: () => set({ isLoading: false }),
}));
