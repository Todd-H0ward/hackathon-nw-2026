// ═══════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════

import { useEffect, useState } from 'react';

import { useFinishLoading, useIsLoading, useLoadingStatusText } from '@/store';

import { OrbitalSpinner } from './orbital-spinner';

// ═══════════════════════════════════════════
// PROP TYPES
// ═══════════════════════════════════════════

interface SpaceLoadingScreenProps {
  /** Minimum loader display time in ms (default 1000ms for smoothness). */
  minDurationMs?: number;
}

// ═══════════════════════════════════════════
// LOADING SCREEN COMPONENT
// ═══════════════════════════════════════════

export const SpaceLoadingScreen = ({
  minDurationMs = 1000,
}: SpaceLoadingScreenProps) => {
  const isLoading = useIsLoading();
  const statusText = useLoadingStatusText();
  const finishLoading = useFinishLoading();
  const [isRendered, setIsRendered] = useState(true);
  const [opacityClass, setOpacityClass] = useState('opacity-100');

  // ═══════════════════════════════════════════
  // TIMING EFFECTS
  // ═══════════════════════════════════════════

  useEffect(() => {
    // Minimum delay before hide to avoid screen flicker
    const timer = setTimeout(() => {
      finishLoading();
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, finishLoading]);

  useEffect(() => {
    if (!isLoading) {
      setOpacityClass('opacity-0 pointer-events-none');
      const unmountTimer = setTimeout(() => {
        setIsRendered(false);
      }, 500);
      return () => clearTimeout(unmountTimer);
    }
    setOpacityClass('opacity-100');
    setIsRendered(true);
  }, [isLoading]);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (!isRendered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 select-none ${opacityClass}`}
    >
      {/* Centered orbital spinner */}
      <OrbitalSpinner size={120} />

      {/* Minimal XenoChoice UI status caption */}
      <div className="mt-8 flex items-center gap-2.5">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.24em] text-white/50 uppercase">
          {statusText}
        </span>
      </div>
    </div>
  );
};
