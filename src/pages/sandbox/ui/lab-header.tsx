import { NavLink } from 'react-router';

import { Activity, Atom, CircleHelp, Globe2, Microscope } from 'lucide-react';

import { STATIC_ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { Button, StatusDot } from '@/shared/ui';

type LabHeaderProps = {
  onOpenGuide: () => void;
  onOpenAtlas: () => void;
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'border-0 flex gap-2 items-center bg-transparent text-[#8593a0] text-[11px] relative no-underline max-[700px]:text-[10px] max-[700px]:gap-1.5 max-[700px]:pb-3',
    isActive &&
      "text-[#e9f2ee] after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#b4e0cc] after:content-['']",
  );

export const LabHeader = ({ onOpenGuide, onOpenAtlas }: LabHeaderProps) => (
  <header className="h-[88px] flex justify-between items-center border-b border-[#222c37] gap-6 max-[700px]:h-auto max-[700px]:min-h-20 max-[700px]:flex-wrap max-[700px]:gap-3.5 max-[700px]:pt-[18px] max-[700px]:pb-0 max-[700px]:px-0">
    <a
      className="flex items-center gap-[11px] tracking-[2px] text-[17px] font-[650] no-underline text-[#e6edf1] max-[700px]:text-[15px] [&_svg]:text-[#a6e1cf]"
      href="/"
      aria-label="XenoChoice"
    >
      <Atom size={27} />
      <span>
        XENO<span className="font-[350]">CHOICE</span>
        <small className="block font-mono text-[8px] tracking-[2.5px] text-[#61717f] mt-[5px] max-[700px]:text-[7px]">
          EXOBIOLOGY RESEARCH LAB
        </small>
      </span>
    </a>
    <nav
      className="flex gap-[29px] h-full items-stretch max-[1180px]:gap-[19px] max-[700px]:order-3 max-[700px]:w-full max-[700px]:justify-between max-[700px]:h-9"
      aria-label="Главная навигация"
    >
      <NavLink to={STATIC_ROUTES.SANDBOX} end className={navClass}>
        <Microscope size={15} />
        Лаборатория
      </NavLink>
      <NavLink to={STATIC_ROUTES.SANDBOX_ANALYTICS} className={navClass}>
        <Activity size={15} />
        Аналитика
      </NavLink>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-0 text-[11px] text-[#8593a0] hover:bg-transparent hover:text-[#e9f2ee]"
        onClick={onOpenAtlas}
      >
        <Globe2 size={15} />
        Атлас миров
      </Button>
    </nav>
    <div className="flex items-center gap-2.5 text-[#7d8c97] font-mono text-[8px] tracking-[1px] max-[1180px]:text-[0px] max-[1180px]:gap-2 max-[700px]:ml-auto">
      <StatusDot
        variant="green"
        size="sm"
        className="shadow-[0_0_8px_#8ed6b433]"
      />
      ЛОКАЛЬНАЯ МОДЕЛЬ
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Роль исследователя"
        onClick={onOpenGuide}
      >
        <CircleHelp size={18} />
      </Button>
      <span className="bg-[#293039] size-[29px] grid place-items-center rounded-full text-[12px] text-[#c7d1d7] max-[700px]:hidden">
        И
      </span>
    </div>
  </header>
);
