import { ShieldAlert, Sparkles, Waves, Zap } from 'lucide-react';

import { Button } from '@/shared/ui';

type InterventionBarProps = {
  onPulse: () => void;
  onStorm: () => void;
  onScarcity: () => void;
};

export const InterventionBar = ({
  onPulse,
  onStorm,
  onScarcity,
}: InterventionBarProps) => (
  <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 max-[1180px]:flex-wrap max-[700px]:gap-[7px]">
    <div className="mr-auto flex items-center gap-[7px] text-[9px] text-foreground max-[1180px]:mb-[3px] max-[1180px]:w-full [&_svg]:text-xeno-green">
      <Zap size={15} />
      <span>
        Воздействовать{' '}
        <small className="text-[8px] text-muted-foreground">
          · 60 модельных тактов
        </small>
      </span>
    </div>
    <Button type="button" variant="outline" size="xs" onClick={onPulse}>
      <Sparkles size={14} />
      Импульс
    </Button>
    <Button type="button" variant="outline" size="xs" onClick={onStorm}>
      <Waves size={14} />
      Возмущение
    </Button>
    <Button type="button" variant="outline" size="xs" onClick={onScarcity}>
      <ShieldAlert size={14} />
      Истощение
    </Button>
  </div>
);
