import type { CSSProperties } from 'react';

import { ChevronRight, GitBranch, Leaf, Plus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import {
  ACTIONS,
  type Colony,
  type Individual,
  members,
  type Simulation,
} from '@/features/ecosystem/model';

import { pad } from '../lib';

type ColoniesPanelProps = {
  sim: Simulation;
  colonies: Colony[];
  selected: number | null;
  aliveCount: number;
  colony: Colony | undefined;
  group: Individual[];
  focused: Individual | undefined;
  onSelect: (id: number) => void;
  onAddColony: () => void;
};

export const ColoniesPanel = ({
  sim,
  colonies,
  selected,
  aliveCount,
  colony,
  group,
  focused,
  onSelect,
  onAddColony,
}: ColoniesPanelProps) => (
  <aside className="py-[22px] px-[18px] bg-[#10151b] border-l border-[#222c37] group-data-[expanded=true]/lab:!hidden min-[1600px]:p-[25px] max-[1180px]:py-[18px] max-[1180px]:px-3 max-[980px]:col-span-full max-[980px]:border-l-0 max-[980px]:border-t max-[980px]:border-[#222c37] max-[980px]:grid max-[980px]:grid-cols-2 max-[980px]:gap-x-[25px] max-[980px]:gap-y-2.5 max-[700px]:py-[18px] max-[700px]:px-3.5 max-[700px]:gap-x-[15px] max-[700px]:gap-y-2.5">
    <div
      className={cn(
        'flex items-center gap-2 mb-5',
        'max-[980px]:col-span-full max-[980px]:mb-0',
      )}
    >
      <span className="[font:9px_monospace] text-[#536774]">03</span>
      <h2 className="text-[11px] font-medium flex-1 m-0">Живые сообщества</h2>
      <span className="py-0.5 px-1.5 border border-[#334b47] text-[#a9cbbd] [font:9px_monospace] rounded-[3px]">
        {colonies.length}
      </span>
    </div>
    <div className="grid gap-[7px] max-h-[230px] overflow-auto [scrollbar-width:thin] [scrollbar-color:#38504d_transparent] max-[980px]:col-start-1 max-[980px]:max-h-[200px]">
      {colonies.length ? (
        colonies.map((c) => {
          const population = members(sim, c.id);
          const energy =
            population.reduce((v, i) => v + i.energy, 0) / population.length;
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                'py-[11px] px-[9px] border border-[#23303a] bg-[#121c24] rounded-md flex items-center text-left gap-[9px] text-[#7d93a1] max-[700px]:py-2.5 max-[700px]:px-1.5 max-[700px]:gap-1.5',
                selected === c.id &&
                  'border-[#48695d] bg-[linear-gradient(120deg,#21322c,#142029)]',
              )}
              style={{ '--colony-color': c.color } as CSSProperties}
            >
              <span className="h-[29px] w-7 bg-[#20322f] text-[var(--colony-color)] rounded-[5px] grid place-items-center max-[700px]:hidden">
                <GitBranch size={19} />
              </span>
              <span className="flex-1">
                <b className="block text-[#b9cdc8] font-[450] text-[11px] max-[700px]:text-[10px]">
                  {c.name}
                </b>
                <small className="block text-[8px] mt-[5px] text-[#6b898c] max-[700px]:text-[7px]">
                  {population.length} особей ·{' '}
                  {c.parent ? `потомок C—${pad(c.parent)}` : 'первичная'}
                </small>
                <span className="block h-0.5 bg-[#2a3b40] mt-[9px] w-full">
                  <i
                    className="block bg-[var(--colony-color)] h-full opacity-70"
                    style={{ width: `${energy}%` }}
                  />
                </span>
              </span>
              <ChevronRight size={14} />
            </button>
          );
        })
      ) : (
        <div className="py-5 px-2.5 text-center text-[#8fa39c]">
          <Leaf size={23} className="mx-auto mb-2.5" />
          <b className="block text-xs font-normal">Среда без жизни</b>
          <p className="text-[10px] leading-[1.8] mt-2">
            Внесите новые зародыши или восстановите исходный эксперимент.
          </p>
        </div>
      )}
    </div>
    <button
      type="button"
      className="flex items-center justify-center gap-2 w-full p-2.5 mt-2.5 border border-dashed border-[#3b504b] rounded-md text-[#94b6a7] bg-[#17231e80] text-[10px] hover:bg-[#273a31] max-[980px]:col-start-1 max-[980px]:mt-0"
      onClick={onAddColony}
      disabled={aliveCount > 172 || colonies.length >= 12}
    >
      <Plus size={15} />
      Внести зародыши
    </button>
    <div className="border-t border-[#222c37] mt-[21px] pt-[19px] max-[980px]:col-start-2 max-[980px]:row-start-2 max-[980px]:row-span-2 max-[980px]:m-0 max-[980px]:p-0 max-[980px]:border-0">
      <div className={cn('[font:9px_monospace] tracking-[1.45px] text-[#82929f]', 'text-[8px] max-[700px]:text-[7px]')}>
        ИНСПЕКТОР <span className="text-[#495967] mx-[7px]">/</span>{' '}
        {colony ? `C—${pad(colony.id)}` : 'ВЫБЕРИТЕ КОЛОНИЮ'}
      </div>
      <h3 className="flex justify-between items-center my-3 mb-[15px] font-[450] text-[15px] max-[700px]:text-[13px]">
        {colony?.name ?? 'Наблюдение за жизнью'}
        <span
          className="size-[5px] bg-[#8ed6b4] rounded-full inline-block shrink-0 shadow-[0_0_8px_#8ed6b433]"
          style={{ background: group.length ? colony?.color : '#f48980' }}
        />
      </h3>
      <div className="flex gap-[30px] text-[#697f8c] text-[8px] max-[700px]:gap-[13px]">
        <span>
          Поколение
          <b className="block [font:17px_monospace] text-[#c6d2d9] mt-1.5">
            {group.length ? Math.max(...group.map((i) => i.generation)) : '—'}
          </b>
        </span>
        <span>
          Средний запас
          <b className="block [font:17px_monospace] text-[#c6d2d9] mt-1.5">
            {group.length
              ? (
                  group.reduce((v, i) => v + i.energy, 0) / group.length
                ).toFixed(0)
              : '—'}
            <small className="[font:8px_monospace] text-[#6c8290]"> EU</small>
          </b>
        </span>
      </div>
      <div className="bg-[#15242188] border border-[#2b413b] rounded-md p-[11px] mt-[15px] max-[700px]:p-[9px]">
        <div className="flex items-center gap-1.5">
          <span className="size-[5px] bg-[#8ed6b4] rounded-full inline-block shrink-0 shadow-[0_0_8px_#8ed6b433]" />
          <b className="text-[9px] text-[#a9d2bd] font-[450]">
            {focused ? ACTIONS[focused.action] : 'Нет живых особей'}
          </b>
        </div>
        <p className="text-[8px] leading-[1.8] text-[#7b9992] mt-[7px]">
          {focused
            ? `Особь #${focused.id}: ${focused.reason}`
            : 'Колония угасла. Планета продолжает существовать как среда.'}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between my-[22px] mb-[15px] max-[980px]:col-span-full max-[980px]:mt-2.5">
      <h3 className="text-[10px] font-[450] m-0">Полевой журнал</h3>
      <span className="[font:7px_monospace] tracking-[1px] text-[#6c9680]">
        LIVE
      </span>
    </div>
    <div
      className="max-[980px]:col-span-full max-[980px]:grid max-[980px]:grid-cols-3 max-[980px]:gap-3 max-[700px]:grid-cols-2"
      role="log"
      aria-live="off"
      aria-label="Журнал событий"
    >
      {sim.events.slice(0, 5).map((e) => (
        <div
          className={cn(
            'flex items-start gap-2.5 pb-[13px] relative',
            e.kind === 'death' && '[&_.event-mark]:border-[#e38e7c]',
            e.kind === 'environment' && '[&_.event-mark]:border-[#ceb182]',
          )}
          key={e.id}
        >
          <span className="event-mark size-[5px] mt-1 border border-[#78b298] rounded-full shrink-0" />
          <div>
            <p className="text-[8px] leading-[1.6] text-[#92a6ad]">{e.text}</p>
            <time className="[font:7px_monospace] text-[#506977] tracking-[0.6px] block mt-1">
              ТАКТ {String(e.tick).padStart(5, '0')}
            </time>
          </div>
        </div>
      ))}
    </div>
  </aside>
);
