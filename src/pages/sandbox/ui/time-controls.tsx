import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

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
      <button
        type="button"
        className="grid place-items-center size-[31px] text-[#1b3026] bg-[#bddfca] border border-[#bddfca] rounded-[5px] hover:bg-[#e0f2e6]"
        aria-label={running ? 'Пауза' : 'Продолжить'}
        onClick={onToggleRunning}
      >
        {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} />}
      </button>
      <button
        type="button"
        className="size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]"
        aria-label="Один такт"
        disabled={running}
        onClick={onStep}
      >
        <SkipForward size={17} />
      </button>
      <button
        type="button"
        className="size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]"
        aria-label="Сбросить эксперимент"
        onClick={onOpenReset}
      >
        <RotateCcw size={15} />
      </button>
      <span className="[font:8px_monospace] tracking-[0.6px] text-[#607886] ml-2 max-[700px]:text-[7px] max-[700px]:ml-0.5">
        ТАКТ <b className="text-[#afc1ca] font-normal ml-1">{String(tick).padStart(5, '0')}</b>
      </span>
    </div>
    <div className="bg-[#0b1118] p-[3px] rounded-[5px]">
      {[1, 2, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={cn(
            'border-0 text-[#657d8b] bg-transparent text-[9px] py-[5px] px-2 rounded-[3px]',
            speed === n && 'bg-[#263a3c] text-[#bed9ce]',
          )}
          onClick={() => onSpeedChange(n)}
        >
          {n}×
        </button>
      ))}
    </div>
    <span className="[font:8px_monospace] text-[#526b78] max-[1180px]:hidden">
      SEED {seed}
    </span>
  </div>
);
