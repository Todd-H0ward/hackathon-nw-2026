/** Query key factory for React Query (XenoChoice API). */

// ═══════════════════════════════════════════
// KEYS
// ═══════════════════════════════════════════

/** Query key factory for the XenoChoice API. */
export const xenoKeys = {
  all: ['xenochoice'] as const,
  worlds: () => [...xenoKeys.all, 'worlds'] as const,
  /** Snapshot polled only while the WS stream is unavailable. */
  state: (id: string | null) => [...xenoKeys.all, 'state', id] as const,
};
