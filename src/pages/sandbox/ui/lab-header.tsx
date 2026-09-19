import { Activity, Atom, CircleHelp, Globe2, Microscope } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import type { LabView } from '../lib';

type LabHeaderProps = {
  view: LabView;
  onViewChange: (view: LabView) => void;
  onOpenGuide: () => void;
  onOpenAtlas: () => void;
};

const navBtn =
  'border-0 flex gap-2 items-center bg-transparent text-[#8593a0] text-[11px] relative max-[700px]:text-[10px] max-[700px]:gap-1.5 max-[700px]:pb-3';

const navBtnActive =
  "text-[#e9f2ee] after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#b4e0cc] after:content-['']";

export const LabHeader = ({
  view,
  onViewChange,
  onOpenGuide,
  onOpenAtlas,
}: LabHeaderProps) => (
  <header className="h-[88px] flex justify-between items-center border-b border-[#222c37] gap-6 max-[700px]:h-auto max-[700px]:min-h-20 max-[700px]:flex-wrap max-[700px]:gap-3.5 max-[700px]:pt-[18px] max-[700px]:pb-0 max-[700px]:px-0">
    <a
      className="flex items-center gap-[11px] tracking-[2px] text-[17px] font-[650] no-underline text-[#e6edf1] max-[700px]:text-[15px] [&_svg]:text-[#a6e1cf]"
      href="/"
      aria-label="XenoChoice"
    >
      <Atom size={27} />
      <span>
        XENO<span className="font-[350]">CHOICE</span>
        <small className="block [font:8px_monospace] tracking-[2.5px] text-[#61717f] mt-[5px] max-[700px]:text-[7px]">
          EXOBIOLOGY RESEARCH LAB
        </small>
      </span>
    </a>
    <nav
      className="flex gap-[29px] h-full items-stretch max-[1180px]:gap-[19px] max-[700px]:order-3 max-[700px]:w-full max-[700px]:justify-between max-[700px]:h-9"
      aria-label="Главная навигация"
    >
      <button
        type="button"
        className={cn(navBtn, view === 'lab' && navBtnActive)}
        onClick={() => onViewChange('lab')}
      >
        <Microscope size={15} />
        Лаборатория
      </button>
      <button
        type="button"
        className={cn(navBtn, view === 'analytics' && navBtnActive)}
        onClick={() => onViewChange('analytics')}
      >
        <Activity size={15} />
        Аналитика
      </button>
      <button type="button" className={navBtn} onClick={onOpenAtlas}>
        <Globe2 size={15} />
        Атлас миров
      </button>
    </nav>
    <div className="flex items-center gap-2.5 text-[#7d8c97] [font:8px_monospace] tracking-[1px] max-[1180px]:text-[0px] max-[1180px]:gap-2 max-[700px]:ml-auto">
      <span className="size-[5px] bg-[#8ed6b4] rounded-full inline-block shrink-0 shadow-[0_0_8px_#8ed6b433]" />
      ЛОКАЛЬНАЯ МОДЕЛЬ
      <button
        type="button"
        className="size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]"
        aria-label="Роль исследователя"
        onClick={onOpenGuide}
      >
        <CircleHelp size={18} />
      </button>
      <span className="bg-[#293039] size-[29px] grid place-items-center rounded-full [font:12px_Arial,sans-serif] text-[#c7d1d7] max-[700px]:hidden">
        И
      </span>
    </div>
  </header>
);
