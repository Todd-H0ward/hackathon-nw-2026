import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { MousePointerClick } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { GlobeBodyId } from '@/shared/ui/globe';

import type { PlanetInfoCatalog } from './planet-info';

/** Custom cursor with tooltip on planet hover. */

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const OFFSET_X = 18;
const OFFSET_Y = 0;

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type PlanetHoverCursorHandle = {
  show: (body: GlobeBodyId, clientX: number, clientY: number) => void;
  move: (clientX: number, clientY: number) => void;
  hide: () => void;
};

interface PlanetHoverCursorProps {
  catalog: PlanetInfoCatalog;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const PlanetHoverCursor = forwardRef<
  PlanetHoverCursorHandle,
  PlanetHoverCursorProps
>(({ catalog }, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<GlobeBodyId | null>(null);
  const [visible, setVisible] = useState(false);
  const bodyRef = useRef<GlobeBodyId | null>(null);
  const visibleRef = useRef(false);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  const place = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${clientX + OFFSET_X}px, ${clientY + OFFSET_Y}px, 0) translateY(-50%)`;
  };

  useImperativeHandle(ref, () => ({
    show(nextBody, clientX, clientY) {
      place(clientX, clientY);
      if (bodyRef.current !== nextBody) {
        bodyRef.current = nextBody;
        setBody(nextBody);
      }
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    },
    move(clientX, clientY) {
      place(clientX, clientY);
    },
    hide() {
      if (!visibleRef.current) return;
      visibleRef.current = false;
      setVisible(false);
    },
  }));

  const info = body ? catalogRef.current[body] : undefined;

  return (
    <div
      ref={rootRef}
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-50 will-change-transform',
        'transition-opacity duration-150 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      style={{ transform: 'translate3d(-9999px,-9999px,0)' }}
    >
      {info ? (
        <div
          className="relative w-[min(240px,70vw)] overflow-hidden rounded-md border border-white/14 px-3.5 py-3"
          style={{
            background:
              'linear-gradient(145deg, rgba(28, 32, 42, 0.94) 0%, rgba(12, 14, 20, 0.88) 100%)',
            boxShadow:
              '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
            aria-hidden
          />
          <p
            className="mt-2 text-[1.45rem] leading-none font-light tracking-[-0.04em] text-white"
            style={{ textShadow: '0 0 20px rgba(180, 210, 255, 0.28)' }}
          >
            {info.name}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-primary">
            <MousePointerClick className="size-3.5 shrink-0" aria-hidden />
            Кликните — в редактор
          </span>
        </div>
      ) : null}
    </div>
  );
});
PlanetHoverCursor.displayName = 'PlanetHoverCursor';
