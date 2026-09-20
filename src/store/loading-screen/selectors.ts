// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { type LoadingScreenStore, useLoadingScreenStore } from './store';

// ═══════════════════════════════════════════
// SELECTOR HOOKS
// ═══════════════════════════════════════════

export const useIsLoading = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.isLoading);
export const useLoadingStatusText = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.statusText);
export const useSetLoadingStatusText = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.setStatusText);
export const useStartLoading = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.startLoading);
export const useFinishLoading = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.finishLoading);
export const useDismissLoading = () =>
  useLoadingScreenStore((store: LoadingScreenStore) => store.dismiss);
