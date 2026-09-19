import type { CSSProperties } from 'react';

import { ChevronRight, GitBranch, Leaf, Plus } from 'lucide-react';

import { pad } from '@/pages/sandbox/lib';

import { cn } from '@/shared/lib/utils';

import {
  ACTIONS,
  type Colony,
  type Individual,
  members,
  type Simulation,
} from '@/features/ecosystem';

interface ColoniesPanelProps {
  sim: Simulation;
  colonies: Colony[];
  selected: number | null;
  aliveCount: number;
  /** Engine ceilings from `/worlds` — not client-side guesses. */
  maxPopulation: number;
  maxColonies: number;
  colony: Colony | undefined;
  group: Individual[];
  focused: Individual | undefined;
  onSelect: (id: number) => void;
  onAddColony: () => void;
}

export const ColoniesPanel = ({
  sim,
  colonies,
  selected,
  aliveCount,
  maxPopulation,
  maxColonies,
  colony,
  group,
  focused,
  onSelect,
  onAddColony,
}: ColoniesPanelProps) => (
  <aside className="min-h-0 overflow-y-auto border-l border-border bg-card px-3 py-3.5 [scrollbar-width:thin] group-data-[expanded=true]/lab:!hidden max-tablet:col-span-full max-tablet:grid max-tablet:grid-cols-2 max-tablet:gap-x-6 max-tablet:gap-y-2.5 max-tablet:border-t max-tablet:border-l-0 max-mobile:gap-x-[15px]">
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-muted-foreground',
        'max-tablet:col-span-full max-tablet:mb-0',
      )}
    >
      <span className="font-mono text-[9px]">03</span>
      <h2 className="m-0 flex-1 text-[11px] font-medium text-foreground">
        Живые сообщества
      </h2>
      <span className="rounded-[3px] border border-xeno-green/30 px-1.5 py-0.5 font-mono text-[9px] text-xeno-green">
        {colonies.length}
      </span>
    </div>
    <div className="grid max-h-[210px] gap-1.5 overflow-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] max-tablet:col-start-1 max-tablet:max-h-[200px]">
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
                'flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2 text-left text-muted-foreground transition-colors hover:bg-secondary max-mobile:gap-1.5 max-mobile:px-1.5',
                selected === c.id && 'border-primary/40 bg-secondary',
              )}
              style={{ '--colony-color': c.color } as CSSProperties}
            >
              <span className="grid size-7 place-items-center rounded-[5px] bg-secondary text-[var(--colony-color)] max-mobile:hidden">
                <GitBranch size={16} />
              </span>
              <span className="flex-1">
                <b className="block text-[11px] font-[450] text-foreground max-mobile:text-[10px]">
                  {c.name}
                </b>
                <small className="mt-1 block text-[8px] text-muted-foreground max-mobile:text-[7px]">
                  {population.length} особей ·{' '}
                  {c.primary ? 'первичная' : 'дочерняя'}
                </small>
                <span className="mt-2 block h-0.5 w-full bg-border">
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
        <div className="px-2.5 py-5 text-center text-muted-foreground">
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
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-xeno-green/40 bg-xeno-green/5 p-2 text-[10px] text-xeno-green transition-colors hover:bg-xeno-green/10 disabled:opacity-50 max-tablet:col-start-1 max-tablet:mt-0"
      onClick={onAddColony}
      disabled={aliveCount >= maxPopulation || colonies.length >= maxColonies}
    >
      <Plus size={15} />
      Внести зародыши
    </button>
    <div className="mt-3.5 border-t border-border pt-3.5 max-tablet:col-start-2 max-tablet:row-span-2 max-tablet:row-start-2 max-tablet:m-0 max-tablet:border-0 max-tablet:p-0">
      <div className="font-mono text-[8px] tracking-[1.45px] text-muted-foreground max-mobile:text-[7px]">
        ИНСПЕКТОР <span className="mx-[7px] opacity-50">/</span>{' '}
        {colony ? `C—${pad(colony.id)}` : 'ВЫБЕРИТЕ КОЛОНИЮ'}
      </div>
      <h3 className="my-2 flex items-center justify-between text-[14px] font-[450] max-mobile:text-[13px]">
        {colony?.name ?? 'Наблюдение за жизнью'}
        <span
          className="inline-block size-[5px] shrink-0 rounded-full bg-destructive"
          style={group.length ? { background: colony?.color } : undefined}
        />
      </h3>
      <div className="flex gap-7 text-[8px] text-muted-foreground max-mobile:gap-[13px]">
        <span>
          Поколение
          <b className="mt-1 block font-mono text-[16px] font-normal text-foreground">
            {group.length ? Math.max(...group.map((i) => i.generation)) : '—'}
          </b>
        </span>
        <span>
          Средний запас
          <b className="mt-1 block font-mono text-[16px] font-normal text-foreground">
            {group.length
              ? (
                  group.reduce((v, i) => v + i.energy, 0) / group.length
                ).toFixed(0)
              : '—'}
            <small className="font-mono text-[8px] text-muted-foreground">
              {' '}
              EU
            </small>
          </b>
        </span>
      </div>
      <div className="mt-3 rounded-md border border-xeno-green/25 bg-xeno-green/5 p-2.5 max-mobile:p-[9px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-[5px] shrink-0 rounded-full bg-xeno-green" />
          <b className="text-[9px] font-[450] text-xeno-green">
            {focused ? ACTIONS[focused.action] : 'Нет живых особей'}
          </b>
        </div>
        <p className="mt-1.5 text-[8px] leading-[1.7] text-muted-foreground">
          {focused
            ? `Особь #${focused.id}: ${focused.reason}`
            : 'Колония угасла. Планета продолжает существовать как среда.'}
        </p>
      </div>
    </div>
    <div className="mt-3 grid gap-2 text-xs max-tablet:col-span-full">
      <h3>Характеристики выбранной колонии</h3>
      {sim.snapshot?.colonies
        .filter((c) => c.id === colony?.remoteId)
        .map((c) => (
          <dl key={c.id} className="grid grid-cols-2 gap-1">
            <dt>Запас энергии</dt>
            <dd>{c.metrics.totalEnergy.toFixed(2)} EU</dd>
            <dt>Структура</dt>
            <dd>{c.metrics.totalBiomass.toFixed(2)} BU</dd>
            <dt>Живых особей</dt>
            <dd>{c.metrics.population}</dd>
          </dl>
        ))}
      <details>
        <summary className="cursor-pointer">
          Особь: решения и наследование
        </summary>
        <div className="max-h-60 overflow-auto">
          {sim.snapshot?.individuals
            .filter((i) => i.colonyId === colony?.remoteId && i.alive)
            .slice(0, 30)
            .map((i) => (
              <div key={i.id} className="my-2 rounded border p-2">
                <b>
                  {i.id} · поколение {i.generation}
                </b>
                <p>Родитель: {i.parentId ?? 'первичная структура'}</p>
                <p>
                  Энергия {i.energy.toFixed(2)} · структура{' '}
                  {i.biomass.toFixed(2)} · память {i.memory.toFixed(3)}
                </p>
                <p>Выбор: {i.lastDecision?.selectedAction ?? '—'}</p>
                <p>{i.lastDecision?.reasoning}</p>
                <dl className="grid grid-cols-2">
                  {Object.entries(i.lastDecision?.scores ?? {}).map(
                    ([action, value]) => (
                      <div key={action}>
                        {action}: {value.toFixed(4)}
                      </div>
                    ),
                  )}
                </dl>
                <p>
                  Гены:{' '}
                  {Object.entries(i.genome)
                    .map(([key, value]) => `${key}=${value.toFixed(3)}`)
                    .join(' · ')}
                </p>
              </div>
            ))}
        </div>
      </details>
    </div>
    <div className="mt-4 mb-2.5 flex items-center justify-between max-tablet:col-span-full max-tablet:mt-2.5">
      <h3 className="text-[10px] font-[450] m-0">Полевой журнал</h3>
      <span className="font-mono text-[7px] tracking-[1px] text-xeno-green">
        LIVE
      </span>
    </div>
    <div
      className="max-tablet:col-span-full max-tablet:grid max-tablet:grid-cols-3 max-tablet:gap-3 max-mobile:grid-cols-2"
      role="log"
      aria-live="off"
      aria-label="Журнал событий"
    >
      {sim.events.slice(0, 5).map((e) => (
        <div
          className={cn(
            'relative flex items-start gap-2.5 pb-2.5',
            e.kind === 'death' && '[&_.event-mark]:border-destructive',
            e.kind === 'environment' && '[&_.event-mark]:border-primary',
          )}
          key={e.id}
        >
          <span className="event-mark mt-1 size-[5px] shrink-0 rounded-full border border-xeno-green" />
          <div>
            <p className="text-[8px] leading-[1.6] text-muted-foreground">
              {e.text}
            </p>
            <time className="mt-1 block font-mono text-[7px] tracking-[0.6px] text-muted-foreground/60">
              ТАКТ {String(e.tick).padStart(5, '0')}
            </time>
          </div>
        </div>
      ))}
    </div>
  </aside>
);
