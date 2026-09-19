import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/shared/api';

export const currentUserQueryKey = ['current-user'] as const;

export const useCurrentUser = () => {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    enabled: Boolean(import.meta.env.VITE_API_URL),
    retry: false,
  });
};
