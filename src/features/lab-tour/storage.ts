// ═══════════════════════════════════════════
// TOUR FLAG STORAGE
// ═══════════════════════════════════════════

import { STORAGE_KEYS } from '@/shared/constants';

/** Whether the tour was already seen (localStorage). */
export const isLabTourSeen = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAB_TOUR_SEEN) === '1';
  } catch {
    return false;
  }
};

/** Marks the tour as seen. localStorage errors are ignored. */
export const markLabTourSeen = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAB_TOUR_SEEN, '1');
  } catch {
    // Private mode / quota — ignore; auto-start may repeat this session only.
  }
};
