import { useMemo } from 'react';

import { useWorlds } from '@/shared/api/xenochoice';
import { GLOBE_BODY_IDS } from '@/shared/ui/globe';

import {
  type WorldCatalog,
  type WorldInfo,
  worldsToInfoMap,
} from './world-info';

const isPresent = <T>(value: T | undefined): value is T => value !== undefined;

export type WorldCatalogState = {
  catalog: WorldCatalog;
  /** Stable, ordered list of the planets the API actually returned. */
  available: WorldInfo[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

/** Shared read of `/worlds`, shaped for display. React Query dedupes the fetch. */
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
