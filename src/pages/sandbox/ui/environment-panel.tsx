import type { ReactNode } from 'react';

import {
  ArrowUpRight,
  ChevronRight,
  Dna,
  Globe2,
  Settings2,
  Waves,
} from 'lucide-react';

import { WORLD_THUMB } from '@/pages/sandbox/lib';

import { TOUR_ANCHORS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { Slider, Switch } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import type { Settings, Simulation, WorldInfo } from '@/features/ecosystem';

interface EnvironmentPanelProps {
  body: GlobeBodyId;
  sim: Simulation;
  world: WorldInfo;
  /** Only the planets `/worlds` actually returned. */
  worlds: WorldInfo[];
  onSelectWorld: (id: GlobeBodyId) => void;
  onSettings: (next: Partial<Settings>) => void;
}

export const EnvironmentPanel = ({
  body,
  sim,
  world,
  worlds,
  onSelectWorld,
  onSettings,
}: EnvironmentPanelProps) => {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-border bg-card px-3 py-3.5 [scrollbar-width:thin] group-data-[expanded=true]/lab:!hidden max-tablet:h-full max-mobile:grid max-mobile:h-auto max-mobile:grid-cols-2 max-mobile:gap-x-4 max-mobile:gap-y-3 max-mobile:border-r-0 max-mobile:border-b">
      <div
        data-tour={TOUR_ANCHORS.HABITAT}
        className="max-mobile:col-span-full max-mobile:grid max-mobile:grid-cols-2 max-mobile:gap-x-4 max-mobile:gap-y-3"
      >
        <SectionTitle
          index="01"
          title="Среда обитания"
          icon={<Globe2 size={14} />}
        />
        <div className="grid gap-1 max-mobile:col-span-full max-mobile:flex">
          {worlds.map((item) => (
            <button
              type="button"
              key={item.id}
              className={cn(
                'flex items-center gap-2.5 rounded-md border border-transparent bg-transparent p-2 text-left text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground max-mobile:min-w-0 max-mobile:flex-1 max-mobile:gap-[7px] max-mobile:px-[5px] max-mobile:py-[7px] [&_svg]:max-mobile:hidden',
                body === item.id &&
                  'border-primary/40 bg-secondary text-foreground',
              )}
              onClick={() => onSelectWorld(item.id)}
            >
              <span
                className={cn(
                  'block size-7 shrink-0 rounded-full bg-cover shadow-[inset_-8px_-3px_9px_rgb(0_0_0/0.8)] max-mobile:size-[25px]',
                  WORLD_THUMB[item.id],
                )}
              />
              <span className="flex-1 text-xs max-mobile:text-[10px]">
                {item.name}
                <small className="mt-0.5 block font-mono text-[8px] tracking-[1.3px] text-muted-foreground max-mobile:text-[6px]">
                  {item.english}
                </small>
              </span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>

        <dl className="my-3 grid gap-2 border-b border-border pb-3 max-mobile:col-start-1 max-mobile:m-0 max-mobile:border-0 max-mobile:p-0">
          <Stat label="Средняя температура" unit="°C">
            {world.temperature > 0 ? '+' : ''}
            {world.temperature}
          </Stat>
          <Stat label="Гравитация" unit="м/с²">
            {world.gravity}
          </Stat>
          <Stat label="Давление у поверхности" unit="бар">
            {world.pressure}
          </Stat>
          <a
            href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-[5px] text-[8px] text-muted-foreground no-underline hover:text-foreground"
          >
            Справочные данные NASA <ArrowUpRight size={11} />
          </a>
        </dl>

        <div className="mb-4 rounded-md border border-xeno-green/25 bg-xeno-green/5 p-2.5 max-mobile:col-start-2 max-mobile:m-0 [&_svg]:float-right [&_svg]:text-xeno-green">
          <Waves size={15} />
          <span className="font-mono text-[7px] tracking-[1px] text-muted-foreground">
            ФИЗИЧЕСКИЙ МЕХАНИЗМ
          </span>
          <b className="mt-2 block text-[10px] font-medium text-foreground">
            {world.phenomenon}
          </b>
          <p className="mt-1 text-[8px] leading-[1.6] text-muted-foreground">
            Гипотетическая модель · условные единицы
          </p>
        </div>
      </div>

      <div
        data-tour={TOUR_ANCHORS.SETTINGS}
        className="max-mobile:col-span-full"
      >
        <SectionTitle
          index="02"
          title="Условия эксперимента"
          icon={<Settings2 size={14} />}
          className="max-mobile:col-span-full"
        />
        <div className="grid gap-4 max-mobile:grid-cols-2">
          <Slider
            label="Приток ресурса"
            outputValue={`${Math.round(sim.settings.resource)}%`}
            min={0}
            max={100}
            value={Math.round(sim.settings.resource)}
            onChange={(e) =>
              onSettings({ resource: Math.round(+e.target.value) })
            }
            minLabel="Слабый"
            maxLabel="Интенсивный"
          />
          <Slider
            label="Шум среды"
            outputValue={`${Math.round(sim.settings.noise)}%`}
            min={0}
            max={100}
            value={Math.round(sim.settings.noise)}
            onChange={(e) => onSettings({ noise: Math.round(+e.target.value) })}
            minLabel="Стабильность"
            maxLabel="Возмущения"
          />
        </div>
        <div className="mt-4 max-mobile:mt-3">
          <Switch
            label={
              <span className="flex items-center gap-[7px] text-[9px]">
                <Dna size={15} />
                Мутации при делении
              </span>
            }
            checked={sim.settings.mutation}
            onChange={(e) => onSettings({ mutation: e.target.checked })}
          />
        </div>
      </div>
    </aside>
  );
};

interface SectionTitleProps {
  index: string;
  title: string;
  icon: ReactNode;
  className?: string;
}

const SectionTitle = ({ index, title, icon, className }: SectionTitleProps) => (
  <div
    className={cn(
      'mb-2 flex items-center gap-2 text-muted-foreground max-mobile:col-span-full max-mobile:m-0',
      className,
    )}
  >
    <span className="font-mono text-[9px]">{index}</span>
    <h2 className="m-0 flex-1 text-[11px] font-medium text-foreground">
      {title}
    </h2>
    {icon}
  </div>
);

interface StatProps {
  label: string;
  unit: string;
  children: ReactNode;
}

const Stat = ({ label, unit, children }: StatProps) => (
  <div className="flex justify-between gap-1.5 text-[9px] text-muted-foreground max-mobile:text-[8px]">
    <dt>{label}</dt>
    <dd className="font-mono text-[10px] text-foreground max-mobile:text-[9px]">
      {children}{' '}
      <small className="text-[8px] text-muted-foreground">{unit}</small>
    </dd>
  </div>
);
