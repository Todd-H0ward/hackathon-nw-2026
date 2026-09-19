import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { UserProvider } from '@/contexts';

import { queryClient } from '@/shared/api';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );
};
