import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { VoiceProvider } from '@/contexts';

import { queryClient } from '@/shared/api';

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <VoiceProvider>{children}</VoiceProvider>
    </QueryClientProvider>
  );
};
