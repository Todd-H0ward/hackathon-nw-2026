import { useEffect, useRef } from 'react';

import { getLabState, useLabBooting, useLabSetModal } from '@/store';

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

/**
 * Opens the extinction dialog when live population drops from >0 to 0
 * during an actual run (not boot, reset placeholder, or recording).
 */
export const usePopulationEnd = (aliveCount: number, tick: number) => {
  const setModal = useLabSetModal();
  const booting = useLabBooting();
  const previousAlive = useRef<number | null>(null);
  const bodyRef = useRef(getLabState().body);

  useEffect(() => {
    const body = getLabState().body;
    if (bodyRef.current !== body) {
      bodyRef.current = body;
      previousAlive.current = null;
    }

    const previous = previousAlive.current;
    previousAlive.current = aliveCount;

    if (previous === null) return;
    if (booting) return;
    if (getLabState().recording) return;
    if (getLabState().modal !== null) return;
    if (tick <= 0) return;
    if (previous > 0 && aliveCount === 0) {
      setModal('extinct');
    }
  }, [aliveCount, tick, booting, setModal]);
};
