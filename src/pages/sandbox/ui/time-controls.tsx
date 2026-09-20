import { useEffect } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

import { TOUR_ANCHORS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface TimeControlsProps {
  running: boolean;
  speed: number;
  tick: number;
  seed: number;
  onToggleRunning: () => void;
  onStep: () => void;
  onOpenReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, button, [contenteditable="true"], [role="textbox"]',
    ),
  );
};

export const TimeControls = ({
  running,
  speed,
  tick,
  seed,
  onToggleRunning,
  onStep,
  onOpenReset,
  onSpeedChange,
}: TimeControlsProps) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return;
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      onToggleRunning();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToggleRunning]);

  return (
    <div
      data-tour={TOUR_ANCHORS.TIME_CONTROLS}
      className="flex items-center justify-between gap-2 border-y border-border bg-card px-3 py-2 max-mobile:p-2"
    >
      <div className="flex items-center gap-[5px] max-mobile:gap-0.5">
        <Button
          type="button"
          variant="play"
          size="icon"
          aria-label={running ? 'Пауза (пробел)' : 'Продолжить (пробел)'}
          title={running ? 'Пауза (пробел)' : 'Продолжить (пробел)'}
          onClick={onToggleRunning}
        >
          {running ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Один такт"
          disabled={running}
          onClick={onStep}
        >
          <SkipForward size={17} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Сбросить эксперимент"
          onClick={onOpenReset}
        >
          <RotateCcw size={15} />
        </Button>
        <span className="font-mono text-[8px] tracking-[0.6px] text-muted-foreground ml-2 max-mobile:text-[7px] max-mobile:ml-0.5">
          ТАКТ{' '}
          <b className="ml-1 font-normal text-foreground">
            {String(tick).padStart(5, '0')}
          </b>
        </span>
      </div>
      <div className="flex rounded-[5px] bg-background p-[3px]">
        {[1, 2, 5].map((n) => (
          <Button
            type="button"
            key={n}
            variant="ghost"
            size="xs"
            className={cn(speed === n && 'bg-secondary text-foreground')}
            onClick={() => onSpeedChange(n)}
          >
            {n}×
          </Button>
        ))}
      </div>
      <span className="font-mono text-[8px] text-muted-foreground max-laptop:hidden">
        SEED {seed}
      </span>
    </div>
  );
};
