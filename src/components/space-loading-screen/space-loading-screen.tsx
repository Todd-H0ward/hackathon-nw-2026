import { useEffect, useState } from 'react';

import { useLoadingScreenStore } from './loading-screen-store';
import { OrbitalSpinner } from './orbital-spinner';

interface SpaceLoadingScreenProps {
  /** Минимальное время показа лоадера в мс (по умолчанию 1000ms для плавности) */
  minDurationMs?: number;
}

export function SpaceLoadingScreen({
  minDurationMs = 1000,
}: SpaceLoadingScreenProps) {
  const { isLoading, statusText, finishLoading } = useLoadingScreenStore();
  const [isRendered, setIsRendered] = useState(true);
  const [opacityClass, setOpacityClass] = useState('opacity-100');

  useEffect(() => {
    // Минимальная задержка перед скрытием, чтобы экран не мелькал
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

  if (!isRendered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 select-none ${opacityClass}`}
    >
      {/* Центрированный орбитальный спиннер */}
      <OrbitalSpinner size={120} />

      {/* Минималистичная подпись в стиле XenoChoice UI */}
      <div className="mt-8 flex items-center gap-2.5">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.24em] text-white/50 uppercase">
          {statusText}
        </span>
      </div>
    </div>
  );
}
