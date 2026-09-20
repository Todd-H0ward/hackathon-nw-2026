import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api';

/** Global app providers (React Query, etc.). */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface ProvidersProps {
  children: ReactNode;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
