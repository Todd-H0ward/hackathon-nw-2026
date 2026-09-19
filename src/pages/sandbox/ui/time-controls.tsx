import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

type TimeControlsProps = {
  running: boolean;
  speed: number;
  tick: number;
  seed: number;
  onToggleRunning: () => void;
  onStep: () => void;
  onOpenReset: () => void;
  onSpeedChange: (speed: number) => void;
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
}: TimeControlsProps) => (
  <div className="flex items-center justify-between py-3 px-[18px] bg-[#111820] border-y border-[#222c37] gap-2 max-[700px]:p-2.5">
    <div className="flex items-center gap-[5px] max-[700px]:gap-0.5">
      <Button
        type="button"
        variant="play"
        size="icon"
        aria-label={running ? 'Пауза' : 'Продолжить'}
        onClick={onToggleRunning}
      >
        {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} />}
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
      <span className="font-mono text-[8px] tracking-[0.6px] text-[#607886] ml-2 max-[700px]:text-[7px] max-[700px]:ml-0.5">
        ТАКТ{' '}
        <b className="text-[#afc1ca] font-normal ml-1">
          {String(tick).padStart(5, '0')}
        </b>
      </span>
    </div>
    <div className="bg-[#0b1118] p-[3px] rounded-[5px] flex">
      {[1, 2, 5].map((n) => (
        <Button
          type="button"
          key={n}
          variant="ghost"
          size="xs"
          className={cn(
            'text-[#657d8b]',
            speed === n && 'bg-[#263a3c] text-[#bed9ce] hover:bg-[#263a3c]',
          )}
          onClick={() => onSpeedChange(n)}
        >
          {n}×
        </Button>
      ))}
    </div>
    <span className="font-mono text-[8px] text-[#526b78] max-[1180px]:hidden">
      SEED {seed}
    </span>
  </div>
);
