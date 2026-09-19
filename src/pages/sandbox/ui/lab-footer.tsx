import { ArrowUpRight } from 'lucide-react';

type LabFooterProps = {
  onOpenGuide: () => void;
};

export const LabFooter = ({ onOpenGuide }: LabFooterProps) => (
  <footer className="flex items-center justify-between gap-5 text-[#4e6876] [font:8px_monospace] pt-[18px] tracking-[0.5px] max-[980px]:items-start max-[700px]:flex-col max-[700px]:gap-2.5 max-[700px]:text-[7px]">
    <span className="flex items-center gap-[9px]">
      <span className="size-[5px] bg-[#8ed6b4] rounded-full inline-block shrink-0 shadow-[0_0_8px_#8ed6b433]" />
      XENOCHOICE <span>/</span> КОД МЫСЛИ 2026
    </span>
    <span className="flex items-center gap-[9px] max-[980px]:max-w-[50%] max-[980px]:leading-[1.8] max-[980px]:flex-wrap max-[700px]:max-w-none">
      Планета — реальная. Формы жизни — гипотетические.{' '}
      <button
        type="button"
        className="text-[#7e9b9c] border-0 bg-transparent flex items-center gap-1 text-[8px]"
        onClick={onOpenGuide}
      >
        О модели <ArrowUpRight size={11} />
      </button>
    </span>
  </footer>
);
