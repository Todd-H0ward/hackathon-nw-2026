import { type LabStore, useLabStore } from './store';

export const useLabBody = () => useLabStore((store: LabStore) => store.body);
export const useLabSetBody = () =>
  useLabStore((store: LabStore) => store.setBody);
