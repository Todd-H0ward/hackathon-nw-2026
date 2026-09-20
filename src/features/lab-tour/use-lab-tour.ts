import { useCallback, useEffect, useRef } from 'react';

import {
  type Driver,
  type DriveStep,
  driver,
  type PopoverDOM,
} from 'driver.js';
import 'driver.js/dist/driver.css';

import { cn } from '@/shared/lib/utils';

import { LAB_TOUR_EDITOR_READY_SELECTOR, LAB_TOUR_STEPS } from './steps';
import { isLabTourSeen, markLabTourSeen } from './storage';

export interface UseLabTourOptions {
  /** World catalog loaded and selected body available. */
  ready: boolean;
  /** True only on the lab editor route (`/sandbox`), not analytics/atlas. */
  editorActive: boolean;
  booting: boolean;
  /** Planet transition phase — only auto-start when idle. */
  phase: string;
  /** Open lab modal blocks auto-start. */
  modalOpen: boolean;
  /** Pause the running simulation before highlighting. */
  onPause?: () => void;
  /**
   * Silent driver.js auto-start. Prefer `LabFirstRunDialog` in the shell;
   * leave false so first visit goes through the welcome gate.
   */
  autoStart?: boolean;
}

const POPOVER_CLASS = cn(
  '!box-border !fixed z-[1000000000] !m-0 !min-w-[260px] !max-w-[320px]',
  '!rounded-lg !border !border-border !bg-popover !p-4',
  '!font-sans !text-xs !leading-relaxed !text-popover-foreground',
  '!shadow-[0_12px_40px_color-mix(in_oklch,black_45%,transparent)]',
);

/** Below this, treat the tour as incomplete — do not start / persist. */
const MIN_TOUR_STEPS = 4;

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const isSelectorVisible = (selector: string): boolean => {
  const el = document.querySelector(selector);
  if (!(el instanceof HTMLElement)) return false;
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (Number(style.opacity) < 0.9) return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= 1 && rect.height >= 1;
};

/** Drop steps whose anchors are missing or hidden (expanded / other routes). */
const resolveVisibleSteps = (): DriveStep[] =>
  LAB_TOUR_STEPS.filter((step) => {
    if (typeof step.element !== 'string') return true;
    return isSelectorVisible(step.element);
  });

const styleArrow = (arrow: HTMLElement) => {
  arrow.style.borderColor = 'transparent';
  if (arrow.classList.contains('driver-popover-arrow-side-left')) {
    arrow.style.borderLeftColor = 'var(--popover)';
  } else if (arrow.classList.contains('driver-popover-arrow-side-right')) {
    arrow.style.borderRightColor = 'var(--popover)';
  } else if (arrow.classList.contains('driver-popover-arrow-side-top')) {
    arrow.style.borderTopColor = 'var(--popover)';
  } else if (arrow.classList.contains('driver-popover-arrow-side-bottom')) {
    arrow.style.borderBottomColor = 'var(--popover)';
  }
};

const styleLabTourPopover = (popover: PopoverDOM) => {
  popover.title.className = cn(
    popover.title.className,
    '!m-0 !mr-20 !block !text-base !font-medium !tracking-[-0.3px] !leading-snug !text-foreground',
  );
  popover.description.className = cn(
    popover.description.className,
    '!mt-2 !mb-0 !text-xs !font-normal !leading-relaxed !text-muted-foreground',
  );
  popover.footer.className = cn(
    popover.footer.className,
    '!mt-3.5 !flex !items-center !justify-between !gap-2',
  );
  popover.progress.className = cn(
    popover.progress.className,
    '!font-mono !text-[9px] !tracking-[0.6px] !text-muted-foreground',
  );
  popover.footerButtons.className = cn(
    popover.footerButtons.className,
    '!flex !grow !justify-end !gap-1.5',
  );

  const navBtn = cn(
    '!box-border !inline-flex !cursor-pointer !items-center !justify-center',
    '!rounded-md !border !border-border !bg-transparent !px-2.5 !py-1',
    '!font-sans !text-[11px] !leading-tight !text-foreground',
    'hover:!bg-secondary focus:!bg-secondary',
  );
  popover.previousButton.className = cn(
    popover.previousButton.className,
    navBtn,
  );
  popover.nextButton.className = cn(
    popover.nextButton.className,
    navBtn,
    '!border-primary/55 !bg-primary/20 hover:!bg-primary/30 focus:!bg-primary/30',
  );

  popover.closeButton.className = cn(
    popover.closeButton.className,
    '!absolute !top-2.5 !right-2.5 !z-[1] !inline-flex !h-auto !w-auto !min-w-0 !max-w-none',
    '!cursor-pointer !items-center !justify-center !whitespace-nowrap !rounded !px-2 !py-0.5',
    '!font-mono !text-[8px] !font-medium !tracking-[0.4px] !uppercase',
    '!text-muted-foreground hover:!bg-secondary hover:!text-foreground',
    'focus:!bg-secondary focus:!text-foreground',
  );
  popover.closeButton.setAttribute('aria-label', 'Пропустить');
  popover.closeButton.textContent = 'Пропустить';

  styleArrow(popover.arrow);
};

export const useLabTour = ({
  ready,
  editorActive,
  booting,
  phase,
  modalOpen,
  onPause,
  /** Prefer LabFirstRunDialog; keep true only for legacy silent auto-start. */
  autoStart = false,
}: UseLabTourOptions) => {
  const driverRef = useRef<Driver | null>(null);
  const onPauseRef = useRef(onPause);
  onPauseRef.current = onPause;
  const autoStartedRef = useRef(false);
  /** When true, next destroy is teardown — do not write localStorage. */
  const skipPersistRef = useRef(false);

  const destroyTour = useCallback(() => {
    const instance = driverRef.current;
    if (!instance) return;
    driverRef.current = null;
    skipPersistRef.current = true;
    if (instance.isActive()) instance.destroy();
    else skipPersistRef.current = false;
  }, []);

  const startTour = useCallback(() => {
    if (!editorActive) return;

    destroyTour();
    onPauseRef.current?.();
    autoStartedRef.current = true;
    skipPersistRef.current = false;

    const steps = resolveVisibleSteps();
    if (steps.length < MIN_TOUR_STEPS) return;

    const instance = driver({
      showProgress: true,
      animate: !prefersReducedMotion(),
      overlayColor: '#050506',
      overlayOpacity: 0.72,
      stagePadding: 8,
      stageRadius: 8,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      disableActiveInteraction: true,
      skipMissingElement: true,
      popoverClass: POPOVER_CLASS,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Далее',
      prevBtnText: 'Назад',
      doneBtnText: 'Готово',
      progressText: '{{current}} / {{total}}',
      steps,
      onPopoverRender: styleLabTourPopover,
      onDestroyed: () => {
        if (!skipPersistRef.current) markLabTourSeen();
        skipPersistRef.current = false;
        if (driverRef.current === instance) {
          driverRef.current = null;
        }
      },
    });

    driverRef.current = instance;
    instance.drive();
  }, [destroyTour, editorActive]);

  useEffect(() => {
    if (!autoStart) return;
    if (autoStartedRef.current) return;
    if (!ready || !editorActive || booting || phase !== 'idle' || modalOpen)
      return;
    if (isLabTourSeen()) return;

    let cancelled = false;
    let attempts = 0;
    let retryTimer = 0;

    const tryStart = () => {
      if (cancelled || autoStartedRef.current || isLabTourSeen()) return;
      if (driverRef.current?.isActive()) {
        autoStartedRef.current = true;
        return;
      }
      if (!isSelectorVisible(LAB_TOUR_EDITOR_READY_SELECTOR)) {
        if (attempts++ < 50) {
          retryTimer = window.setTimeout(tryStart, 200);
        }
        return;
      }
      autoStartedRef.current = true;
      startTour();
    };

    const initialTimer = window.setTimeout(tryStart, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearTimeout(retryTimer);
    };
  }, [
    autoStart,
    ready,
    editorActive,
    booting,
    phase,
    modalOpen,
    startTour,
  ]);

  useEffect(() => () => destroyTour(), [destroyTour]);

  return { startTour };
};
