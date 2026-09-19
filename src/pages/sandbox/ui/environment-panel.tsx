import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Dna,
  Globe2,
  Settings2,
  Waves,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Slider, Switch } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import {
  type Settings,
  type Simulation,
  WORLDS,
} from '@/features/ecosystem/model';

import { BODY_IDS } from '../lib';

type EnvironmentPanelProps = {
  body: GlobeBodyId;
  sim: Simulation;
  onSelectWorld: (id: GlobeBodyId) => void;
  onSettings: (next: Partial<Settings>) => void;
};

const worldThumb: Record<GlobeBodyId, string> = {
  earth: "bg-[url('/images/globe/earth_color.jpg')] bg-[position:35%_50%]",
  mars: "bg-[url('/images/globe/mars_color.jpg')]",
  venus: "bg-[url('/images/globe/venus_color.jpg')]",
};

export const EnvironmentPanel = ({
  body,
  sim,
  onSelectWorld,
  onSettings,
}: EnvironmentPanelProps) => {
  const world = WORLDS[body];

  return (
    <aside className="bg-[#10151b] border-r border-[#222c37] py-[22px] px-[17px] group-data-[expanded=true]/lab:!hidden min-[1600px]:p-[25px] max-[1180px]:py-[18px] max-[1180px]:px-3 max-[700px]:grid max-[700px]:grid-cols-2 max-[700px]:gap-x-[18px] max-[700px]:gap-y-3 max-[700px]:border-r-0 max-[700px]:border-b max-[700px]:border-[#222c37]">
      <div
        className={cn(
          'flex items-center gap-2 mb-5',
          'max-[700px]:col-span-full max-[700px]:m-0',
        )}
      >
        <span className="[font:9px_monospace] text-[#536774]">01</span>
        <h2 className="text-[11px] font-medium flex-1 m-0">Среда обитания</h2>
        <Globe2 size={15} className="text-[#667884]" />
      </div>
      <div className="grid gap-[7px] max-[700px]:col-span-full max-[700px]:flex">
        {BODY_IDS.map((id) => (
          <button
            type="button"
            key={id}
            className={cn(
              'flex items-center text-left p-2.5 border border-transparent bg-transparent rounded-[7px] gap-2.5 text-[#9caeb9] hover:bg-[#1b262d] max-[700px]:flex-1 max-[700px]:gap-[7px] max-[700px]:py-[7px] max-[700px]:px-[5px] max-[700px]:min-w-0 [&_svg]:max-[700px]:hidden',
              body === id &&
                'bg-[linear-gradient(110deg,#21312f,#172127)] border-[#3f514d] text-[#e6eeea]',
            )}
            onClick={() => onSelectWorld(id)}
          >
            <span
              className={cn(
                'size-8 shrink-0 block rounded-full bg-cover shadow-[inset_-10px_-3px_10px_#000c,0_0_13px_#94cfce15] max-[700px]:size-[25px]',
                worldThumb[id],
              )}
            />
            <span className="flex-1 text-xs max-[700px]:text-[10px]">
              {WORLDS[id].name}
              <small className="block [font:8px_monospace] tracking-[1.3px] mt-1 text-[#607580] max-[700px]:text-[6px]">
                {WORLDS[id].english}
              </small>
            </span>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
      <div className="py-[17px] mb-[17px] border-b border-[#222c37] max-[700px]:col-start-1 max-[700px]:m-0 max-[700px]:pt-[7px] max-[700px]:pb-0 max-[700px]:border-0">
        <div className="flex justify-between gap-1.5 mb-3 text-[9px] text-[#718491] max-[700px]:text-[8px]">
          <span>Средняя температура</span>
          <b className="text-[#c1ccd2] [font:10px_monospace] max-[700px]:text-[9px]">
            {world.temperature > 0 ? '+' : ''}
            {world.temperature}{' '}
            <small className="text-[8px] text-[#718491]">°C</small>
          </b>
        </div>
        <div className="flex justify-between gap-1.5 mb-3 text-[9px] text-[#718491] max-[700px]:text-[8px]">
          <span>Гравитация</span>
          <b className="text-[#c1ccd2] [font:10px_monospace] max-[700px]:text-[9px]">
            {world.gravity}{' '}
            <small className="text-[8px] text-[#718491]">м/с²</small>
          </b>
        </div>
        <div className="flex justify-between gap-1.5 mb-3 text-[9px] text-[#718491] max-[700px]:text-[8px]">
          <span>Давление у поверхности</span>
          <b className="text-[#c1ccd2] [font:10px_monospace] max-[700px]:text-[9px]">
            {world.pressure}{' '}
            <small className="text-[8px] text-[#718491]">бар</small>
          </b>
        </div>
        <a
          href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
          target="_blank"
          rel="noreferrer"
          className="text-[8px] text-[#6b8e8b] flex items-center gap-[5px] no-underline"
        >
          Справочные данные NASA <ArrowUpRight size={11} />
        </a>
      </div>
      <div className="p-3 border border-[#2b3b3d] rounded-md bg-[#162224] mb-[23px] max-[700px]:col-start-2 max-[700px]:m-0 max-[700px]:p-2.5 [&_svg]:text-[#9cd2bd] [&_svg]:float-right">
        <Waves size={17} />
        <span className="[font:7px_monospace] tracking-[1px] text-[#729488]">
          ФИЗИЧЕСКИЙ МЕХАНИЗМ
        </span>
        <b className="block text-[10px] font-medium text-[#bad5c8] mt-2.5">
          {world.phenomenon}
        </b>
        <p className="text-[8px] text-[#698279] mt-[5px] leading-[1.7]">
          Гипотетическая модель · условные единицы
        </p>
      </div>
      <div className="flex items-center gap-2 mb-[22px] max-[700px]:col-span-full max-[700px]:my-[7px] max-[700px]:mx-0">
        <span className="[font:9px_monospace] text-[#536774]">02</span>
        <h2 className="text-[11px] font-medium flex-1 m-0">
          Условия эксперимента
        </h2>
        <Settings2 size={15} className="text-[#667884]" />
      </div>
      <div className="mb-[23px] max-[700px]:m-0">
        <Slider
          label="Приток ресурса"
          outputValue={`${sim.settings.resource}%`}
          min={0}
          max={100}
          value={sim.settings.resource}
          onChange={(e) => onSettings({ resource: +e.target.value })}
          minLabel="Слабый"
          maxLabel="Интенсивный"
        />
      </div>
      <div className="mb-[23px] max-[700px]:m-0">
        <Slider
          label="Шум среды"
          outputValue={`${sim.settings.noise}%`}
          min={0}
          max={100}
          value={sim.settings.noise}
          onChange={(e) => onSettings({ noise: +e.target.value })}
          minLabel="Стабильность"
          maxLabel="Возмущения"
        />
      </div>
      <div className="mt-[27px] max-[700px]:col-span-full max-[700px]:mt-2 max-[700px]:mb-0">
        <Switch
          label={
            <span className="flex gap-[7px] items-center text-[9px]">
              <Dna size={15} />
              Мутации при делении
            </span>
          }
          checked={sim.settings.mutation}
          onChange={(e) => onSettings({ mutation: e.target.checked })}
        />
      </div>
      <div className="flex gap-2.5 border-t border-[#222c37] mt-[27px] pt-5 text-[#657e85] max-[700px]:hidden">
        <BookOpen size={16} />
        <p className="text-[9px] leading-[1.9]">
          Планета — среда.
          <br />
          Особь — структура.
          <br />
          <strong className="font-normal text-[#95b8ae]">
            Колония — их сообщество.
          </strong>
        </p>
      </div>
    </aside>
  );
};
