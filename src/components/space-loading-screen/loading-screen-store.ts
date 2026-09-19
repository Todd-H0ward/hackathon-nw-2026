import { create } from 'zustand';

export interface LoadingScreenState {
  /** Активен ли экран загрузки */
  isLoading: boolean;
  /** Текст текущего статуса */
  statusText: string;

  // Actions
  setStatusText: (text: string) => void;
  startLoading: (statusText?: string) => void;
  finishLoading: () => void;
  dismiss: () => void;
}

export const useLoadingScreenStore = create<LoadingScreenState>((set) => ({
  isLoading: true,
  statusText: 'Синхронизация орбитальных систем',

  setStatusText: (statusText) => set({ statusText }),

  startLoading: (statusText = 'Синхронизация орбитальных систем') =>
    set({ isLoading: true, statusText }),

  finishLoading: () => set({ isLoading: false }),

  dismiss: () => set({ isLoading: false }),
}));
