import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router';

import {
  Activity,
  ArrowDownToLine,
  Atom,
  CircleHelp,
  Globe2,
  GraduationCap,
  Microscope,
  Presentation,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { STATIC_ROUTES, TOUR_ANCHORS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import {
  announceAction,
  useAudioPreferences,
} from '@/shared/voice/action-speech';

import { ResearchVoice } from '../research-voice';

export interface LabRailProps {
  seed?: number;
  showResearchVoice?: boolean;
  onExport?: () => void;
  onStartTour?: () => void;
  onOpenGuide?: () => void;
  onGoHome?: () => void;
}

const itemClass =
  'relative grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    itemClass,
    isActive &&
      "bg-secondary text-foreground before:absolute before:-left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary before:content-[''] max-mobile:before:hidden",
  );

interface RailLinkProps {
  to: string;
  end?: boolean;
  label: string;
  onClick?: () => void;
  children: ReactNode;
}

const RailLink = ({ to, end, label, onClick, children }: RailLinkProps) => (
  <NavLink
    to={to}
    end={end}
    className={navClass}
    title={label}
    aria-label={label}
    onClick={() => {
      announceAction(label);
      onClick?.();
    }}
  >
    {children}
  </NavLink>
);

/** Compact vertical navigation for the lab — replaces the page header. */
export const LabRail = ({
  seed,
  showResearchVoice = true,
  onExport,
  onStartTour,
  onOpenGuide,
  onGoHome,
}: LabRailProps) => {
  const navigate = useNavigate();
  const audio = useAudioPreferences();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate(STATIC_ROUTES.HOME);
    }
  };

  return (
    <nav
      aria-label="Навигация лаборатории"
      className="flex w-12 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-card py-2.5 max-mobile:h-12 max-mobile:w-full max-mobile:flex-row max-mobile:border-r-0 max-mobile:border-b max-mobile:px-2.5 max-mobile:py-0"
    >
      <button
        type="button"
        data-tour={TOUR_ANCHORS.ROLE}
        onClick={handleGoHome}
        className={cn(
          itemClass,
          'mb-2 text-xeno-green max-mobile:mb-0 max-mobile:mr-2 cursor-pointer',
        )}
        title="XenoChoice — к выбору планеты"
        aria-label="XenoChoice — к выбору планеты"
      >
        <Atom size={20} />
      </button>

      <div
        data-tour={TOUR_ANCHORS.NAV}
        className="flex flex-col items-center gap-1.5 max-mobile:flex-row max-mobile:gap-1.5"
      >
        <RailLink to={STATIC_ROUTES.SANDBOX} end label="Лаборатория">
          <Microscope size={17} />
        </RailLink>
        <RailLink to={STATIC_ROUTES.DEMO} label="Демо-режим">
          <Presentation size={18} />
        </RailLink>
        <RailLink to={STATIC_ROUTES.SANDBOX_ANALYTICS} label="Аналитика">
          <Activity size={17} />
        </RailLink>
        <RailLink to={STATIC_ROUTES.SANDBOX_ATLAS} label="Атлас миров">
          <Globe2 size={17} />
        </RailLink>
      </div>

      <div className="flex-1" />

      {onExport ? (
        <button
          type="button"
          data-tour={TOUR_ANCHORS.EXPORT}
          className={cn(itemClass, 'cursor-pointer')}
          title={
            seed !== undefined
              ? `Экспорт эксперимента · seed ${seed}`
              : 'Экспорт эксперимента'
          }
          aria-label="Экспорт эксперимента"
          onClick={onExport}
        >
          <ArrowDownToLine size={17} />
        </button>
      ) : null}

      {onStartTour ? (
        <button
          type="button"
          className={cn(itemClass, 'cursor-pointer')}
          title="Обучение: обзор лаборатории"
          aria-label="Обучение: обзор лаборатории"
          onClick={() => {
            announceAction('Обучение');
            onStartTour();
          }}
        >
          <GraduationCap size={17} />
        </button>
      ) : null}

      <RailLink
        to={STATIC_ROUTES.FAQ}
        label="Справочник и FAQ"
        onClick={onOpenGuide}
      >
        <CircleHelp size={17} />
      </RailLink>

      {showResearchVoice ? <ResearchVoice /> : null}

      <button
        type="button"
        className={cn(itemClass, 'cursor-pointer')}
        aria-label={
          audio.enabled
            ? 'Выключить озвучку действий'
            : 'Включить озвучку действий'
        }
        title={
          audio.enabled
            ? 'Выключить озвучку действий'
            : 'Включить озвучку действий'
        }
        aria-pressed={audio.enabled}
        onClick={() => {
          audio.toggle();
          if (!audio.enabled) announceAction('Озвучка действий включена');
        }}
      >
        {audio.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>

      <span
        className="mt-1.5 size-1.5 rounded-full bg-xeno-green shadow-[0_0_8px_var(--xeno-green)] max-mobile:mt-0 max-mobile:ml-2"
        title="Локальная модель"
        role="img"
        aria-label="Локальная модель активна"
      />
    </nav>
  );
};
