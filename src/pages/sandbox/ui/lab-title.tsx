import { ArrowDownToLine } from 'lucide-react';

import { Button } from '@/shared/ui';

type LabTitleProps = {
  seed: number;
  onExport: () => void;
};

export const LabTitle = ({ seed, onExport }: LabTitleProps) => (
  <div className="flex justify-between items-center py-8 px-0 pb-7 gap-5 min-[1600px]:py-[37px] max-[700px]:py-[23px] max-[700px]:items-start max-[700px]:flex-col max-[700px]:gap-[15px]">
    <div>
      <div className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground max-[700px]:text-[8px]">
        ПРОЕКТ «МАШИНА ВЫБОРА»{' '}
        <span className="text-[#495967] mx-[7px]">/</span> ЭКСПЕРИМЕНТ {seed}
      </div>
      <h1 className="text-[clamp(22px,2.3vw,33px)] font-[450] tracking-[-1.25px] my-2.5 max-[980px]:text-[26px] max-[700px]:text-[25px] max-[700px]:tracking-[-1px] max-[700px]:leading-[1.3]">
        Жизнь за пределами биологии
        <span className="text-[#b6e0cc]">.</span>
      </h1>
      <p className="text-muted-foreground text-[11px] max-[700px]:text-[10px]">
        Создавайте условия. Наблюдайте выбор. Исследуйте эволюцию.
      </p>
    </div>
    <Button type="button" variant="outline" size="sm" onClick={onExport}>
      <ArrowDownToLine size={15} />
      Экспорт эксперимента
    </Button>
  </div>
);
