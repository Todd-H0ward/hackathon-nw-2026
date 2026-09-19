import { createContext, type ReactNode, useContext } from 'react';

import { type LabState, useLabState } from './use-lab-state';

const LabContext = createContext<LabState | null>(null);

type LabProviderProps = {
  children: ReactNode;
};

export const LabProvider = ({ children }: LabProviderProps) => {
  const value = useLabState();
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
};

export const useLab = () => {
  const value = useContext(LabContext);
  if (!value) {
    throw new Error('useLab must be used within LabProvider');
  }
  return value;
};
