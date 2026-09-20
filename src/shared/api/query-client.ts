/** Global React Query Client instance. */

import { QueryClient } from '@tanstack/react-query';

// ═══════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
