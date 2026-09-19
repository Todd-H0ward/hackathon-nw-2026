import { ArrowDownToLine } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

type LabTitleProps = {
  seed: number;
  onExport: () => void;
};

export const LabTitle = ({ seed, onExport }: LabTitleProps) => (
  <div className="flex justify-between items-center py-8 px-0 pb-7 gap-5 min-[1600px]:py-[37px] max-[700px]:py-[23px] max-[700px]:items-start max-[700px]:flex-col max-[700px]:gap-[15px]">
    <div>
      <div className={cn('[font:9px_monospace] tracking-[1.45px] text-[#82929f]', 'max-[700px]:text-[8px]')}>
        ПРОЕКТ «МАШИНА ВЫБОРА»{' '}
        <span className="text-[#495967] mx-[7px]">/</span> ЭКСПЕРИМЕНТ {seed}
      </div>
      <h1 className="text-[clamp(22px,2.3vw,33px)] font-[450] tracking-[-1.25px] my-2.5 max-[980px]:text-[26px] max-[700px]:text-[25px] max-[700px]:tracking-[-1px] max-[700px]:leading-[1.3]">
        Жизнь за пределами биологии
        <span className="text-[#b6e0cc]">.</span>
      </h1>
      <p className="text-[#748593] text-[11px] max-[700px]:text-[10px]">
        Создавайте условия. Наблюдайте выбор. Исследуйте эволюцию.
      </p>
    </div>
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-[9px] border border-[#33414d] bg-[#151d25] text-[#bfcdd6] text-[11px] py-[11px] px-[15px] rounded-md hover:bg-[#1f2b36]',
        'max-[980px]:text-[9px]',
      )}
      onClick={onExport}
    >
      <ArrowDownToLine size={15} />
      Экспорт эксперимента
    </button>
  </div>
);
