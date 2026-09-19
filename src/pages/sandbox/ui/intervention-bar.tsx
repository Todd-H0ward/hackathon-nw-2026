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
  <div className="flex gap-2 items-center py-4 px-[17px] border-b border-[#222c37] bg-[#0e151c] max-[1180px]:flex-wrap max-[1180px]:p-[11px] max-[700px]:p-3 max-[700px]:gap-[7px]">
    <div className="flex items-center gap-[7px] text-[9px] text-[#a3b3be] mr-auto max-[1180px]:w-full max-[1180px]:mb-[3px] [&_svg]:text-[#b0cdbc]">
      <Zap size={15} />
      <span>
        Воздействовать
        <br />
        <small className="text-[7px] text-[#566e7d] leading-[2]">
          60 модельных тактов
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
