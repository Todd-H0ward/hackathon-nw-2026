import { create } from 'zustand';

export type LoadingScreenStore = {
  /** Активен ли экран загрузки */
  isLoading: boolean;
  /** Текст текущего статуса */
  statusText: string;
  setStatusText: (text: string) => void;
  startLoading: (statusText?: string) => void;
  finishLoading: () => void;
  dismiss: () => void;
};

const DEFAULT_STATUS = 'Синхронизация орбитальных систем';

export const useLoadingScreenStore = create<LoadingScreenStore>((set) => ({
  isLoading: true,
  statusText: DEFAULT_STATUS,

  setStatusText: (statusText) => set({ statusText }),
  startLoading: (statusText = DEFAULT_STATUS) =>
    set({ isLoading: true, statusText }),
  finishLoading: () => set({ isLoading: false }),
  dismiss: () => set({ isLoading: false }),
}));
