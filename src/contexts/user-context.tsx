import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { TUser } from '@/shared/types';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

type TUserContextValues = {
  user: TUser | null;
  setUser: (user: TUser | null) => void;
};

interface UserProviderProps {
  initialUser?: TUser | null;
  children: ReactNode;
}

// ═══════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════

const UserContext = createContext<TUserContextValues | null>(null);

export const UserProvider = ({
  initialUser = null,
  children,
}: UserProviderProps) => {
  const [user, setUser] = useState(initialUser);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('Error: component should be wrapped in UserProvider');
  }

  return context;
};

export type { TUserContextValues };
