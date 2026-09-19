import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api';
import { VoiceProvider } from '@/contexts';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <VoiceProvider>{children}</VoiceProvider>
    </QueryClientProvider>
  );
};
