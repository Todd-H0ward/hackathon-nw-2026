// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { useMemo } from 'react';

import { useWorlds } from '@/shared/api/xenochoice';
import { GLOBE_BODY_IDS } from '@/shared/ui/globe';

import {
  type WorldCatalog,
  type WorldInfo,
  worldsToInfoMap,
} from './world-info';

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Type guard: filter undefined from an array. */
const isPresent = <T>(value: T | undefined): value is T => value !== undefined;

// ═══════════════════════════════════════════
// CATALOG STATE TYPE
// ═══════════════════════════════════════════

/** Result of reading `/worlds` for the lab UI. */
export type WorldCatalogState = {
  catalog: WorldCatalog;
  /** Stable ordered list of planets returned from the API. */
  available: WorldInfo[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

// ═══════════════════════════════════════════
// WORLD CATALOG HOOK
// ═══════════════════════════════════════════

/** Shared `/worlds` read shaped for display. React Query deduplicates the fetch. */
export const useWorldCatalog = (): WorldCatalogState => {
  const query = useWorlds();

  const catalog = useMemo(() => worldsToInfoMap(query.data), [query.data]);
  const available = useMemo(
    () => GLOBE_BODY_IDS.map((id) => catalog[id]).filter(isPresent),
    [catalog],
  );

  return {
    catalog,
    available,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};
