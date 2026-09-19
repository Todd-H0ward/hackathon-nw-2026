import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { ArrowRight, Waves } from 'lucide-react';

import { STATIC_ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import { activeColonies, living } from '@/features/ecosystem/model';
import { useWorldCatalog } from '@/features/ecosystem/use-world-catalog';
import { useLabBody, useLabSims } from '@/store';

import { WORLD_THUMB } from './lib';
import { useLabActions } from './use-lab-actions';

interface FactProps {
  label: string;
  children: ReactNode;
}

const Fact = ({ label, children }: FactProps) => (
  <div className="min-w-0">
    <dt className="font-mono text-[8px] tracking-[1px] text-muted-foreground uppercase">
      {label}
    </dt>
    <dd className="mt-1 truncate font-mono text-[12px] text-foreground tabular-nums">
      {children}
    </dd>
  </div>
);

export const AtlasPage = () => {
  const navigate = useNavigate();
  const actions = useLabActions();
  const worlds = useWorldCatalog();
  const body = useLabBody();
  const sims = useLabSims();

  const open = (id: GlobeBodyId) => {
    if (id !== body) actions.selectWorld(id);
    navigate(STATIC_ROUTES.SANDBOX);
  };

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-6 max-mobile:px-3 max-mobile:py-4">
      <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
        ТРИ СРЕДЫ · ТРИ НЕЗАВИСИМЫХ ЭКСПЕРИМЕНТА
      </p>
      <h1 className="mt-2 text-[24px] font-normal tracking-[-0.6px]">
        Атлас миров
      </h1>
      <p className="mt-1.5 max-w-xl text-[11px] leading-[1.7] text-muted-foreground">
        Реальные параметры планет и состояние эксперимента в каждой из сред.
        Прогресс сохраняется при переключении.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 max-laptop:grid-cols-2 max-mobile:grid-cols-1">
        {worlds.available.map((world) => {
          const id = world.id;
          const sim = sims[id];
          const current = id === body;

          return (
            <article
              key={id}
              className={cn(
                'flex flex-col rounded-[10px] border border-border bg-card p-4',
                current && 'border-primary/40',
              )}
            >
              <header className="flex items-start gap-3.5">
                <span
                  className={cn(
                    'block size-14 shrink-0 rounded-full bg-cover shadow-[inset_-12px_-4px_12px_rgb(0_0_0/0.8)]',
                    WORLD_THUMB[id],
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex h-4 items-center justify-between gap-2">
                    <span className="font-mono text-[8px] tracking-[1.3px] text-muted-foreground">
                      {world.code} · {world.english}
                    </span>
                    {current ? (
                      <span className="rounded-[3px] border border-primary/40 px-1.5 font-mono text-[8px] leading-[14px] tracking-[1px] text-primary">
                        ТЕКУЩИЙ
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-1 text-[18px] font-[450] tracking-[-0.3px]">
                    {world.name}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {world.process}
                  </p>
                </div>
              </header>

              <p className="mt-3.5 text-[11px] leading-[1.7] text-muted-foreground">
                {world.description}
              </p>

              <dl className="mt-3.5 grid grid-cols-3 gap-3 border-t border-border pt-3">
                <Fact label="Температура">
                  {world.temperature > 0 ? '+' : ''}
                  {world.temperature} °C
                </Fact>
                <Fact label="Гравитация">{world.gravity} м/с²</Fact>
                <Fact label="Давление">{world.pressure} бар</Fact>
              </dl>

              <div className="mt-3 flex items-center gap-2 rounded-md border border-xeno-green/25 bg-xeno-green/5 px-2.5 py-2 text-[10px] text-foreground">
                <Waves size={14} className="shrink-0 text-xeno-green" />
                {world.phenomenon}
              </div>

              <dl className="mt-3 grid grid-cols-4 gap-3">
                <Fact label="Такт">{String(sim.tick).padStart(5, '0')}</Fact>
                <Fact label="Особей">{living(sim).length}</Fact>
                <Fact label="Колоний">{activeColonies(sim).length}</Fact>
                <Fact label="Seed">{sim.seed}</Fact>
              </dl>

              <Button
                type="button"
                variant={current ? 'outline' : 'primary'}
                size="sm"
                className="mt-4 self-start"
                onClick={() => open(id)}
              >
                {current ? 'Вернуться в лабораторию' : 'Открыть в лаборатории'}
                <ArrowRight size={14} />
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
