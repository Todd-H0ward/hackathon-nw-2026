import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';

import {
  Activity,
  ArrowDownToLine,
  Atom,
  CircleHelp,
  Globe2,
  Microscope,
} from 'lucide-react';

import { STATIC_ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';

type LabRailProps = {
  seed: number;
  onExport: () => void;
  onOpenGuide: () => void;
};

const itemClass =
  'relative grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    itemClass,
    isActive &&
      "bg-secondary text-foreground before:absolute before:-left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary before:content-[''] max-[700px]:before:hidden",
  );

const RailLink = ({
  to,
  end,
  label,
  children,
}: {
  to: string;
  end?: boolean;
  label: string;
  children: ReactNode;
}) => (
  <NavLink
    to={to}
    end={end}
    className={navClass}
    title={label}
    aria-label={label}
  >
    {children}
  </NavLink>
);

/** Compact vertical navigation for the lab — replaces the page header. */
export const LabRail = ({ seed, onExport, onOpenGuide }: LabRailProps) => (
  <nav
    aria-label="Навигация лаборатории"
    className="flex w-12 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-card py-2.5 max-[700px]:h-12 max-[700px]:w-full max-[700px]:flex-row max-[700px]:border-r-0 max-[700px]:border-b max-[700px]:px-2.5 max-[700px]:py-0"
  >
    <Link
      to={STATIC_ROUTES.HOME}
      className={cn(
        itemClass,
        'mb-2 text-xeno-green max-[700px]:mb-0 max-[700px]:mr-2',
      )}
      title="XenoChoice — к выбору планеты"
      aria-label="XenoChoice — к выбору планеты"
    >
      <Atom size={20} />
    </Link>

    <RailLink to={STATIC_ROUTES.SANDBOX} end label="Лаборатория">
      <Microscope size={17} />
    </RailLink>
    <RailLink to={STATIC_ROUTES.SANDBOX_ANALYTICS} label="Аналитика">
      <Activity size={17} />
    </RailLink>
    <RailLink to={STATIC_ROUTES.SANDBOX_ATLAS} label="Атлас миров">
      <Globe2 size={17} />
    </RailLink>

    <div className="flex-1" />

    <button
      type="button"
      className={itemClass}
      title={`Экспорт эксперимента · seed ${seed}`}
      aria-label="Экспорт эксперимента"
      onClick={onExport}
    >
      <ArrowDownToLine size={17} />
    </button>
    <button
      type="button"
      className={itemClass}
      title="О модели и роли исследователя"
      aria-label="О модели и роли исследователя"
      onClick={onOpenGuide}
    >
      <CircleHelp size={17} />
    </button>
    <span
      className="mt-1.5 size-1.5 rounded-full bg-xeno-green shadow-[0_0_8px_var(--xeno-green)] max-[700px]:mt-0 max-[700px]:ml-2"
      title="Локальная модель"
      role="img"
      aria-label="Локальная модель активна"
    />
  </nav>
);
