import { ShieldAlert, Sparkles, Waves, Zap } from 'lucide-react';

type InterventionBarProps = {
  onPulse: () => void;
  onStorm: () => void;
  onScarcity: () => void;
};

const actionBtn =
  'flex gap-[5px] items-center bg-[#18212a] border border-[#2b3b48] text-[#a2b4bf] py-[9px] px-2.5 rounded-[5px] text-[9px] hover:bg-[#2b403e] hover:text-[#c8e4d7] max-[1180px]:flex-1 max-[1180px]:justify-center max-[700px]:text-[8px] max-[700px]:py-2.5 max-[700px]:px-[5px]';

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
    <button type="button" className={actionBtn} onClick={onPulse}>
      <Sparkles size={14} />
      Импульс
    </button>
    <button type="button" className={actionBtn} onClick={onStorm}>
      <Waves size={14} />
      Возмущение
    </button>
    <button type="button" className={actionBtn} onClick={onScarcity}>
      <ShieldAlert size={14} />
      Истощение
    </button>
  </div>
);
