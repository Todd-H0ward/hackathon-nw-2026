import { cn } from '@/shared/lib/utils';
import { GLOBE_BODY_IDS, type GlobeBodyId } from '@/shared/ui/globe';

import type { PlanetInfo } from './planet-info';

interface PlanetHoodProps {
  activeBody: GlobeBodyId;
  info: PlanetInfo;
  className?: string;
}

export const PlanetHood = ({
  activeBody,
  info,
  className,
}: PlanetHoodProps) => (
  <section
    aria-label={`${info.name}: физические свойства`}
    className={cn(
      'pointer-events-none absolute inset-x-0 bottom-0 z-10',
      className,
    )}
  >
    <div className="bg-linear-to-t from-[#2a2b2e] from-35% via-[#2a2b2e]/92 via-70% to-transparent px-4 pt-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div key={info.id} className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.18em] text-white/65 uppercase">
              Досье планеты
            </p>
            <h2 className="mt-1 text-2xl font-medium tracking-tight text-white md:text-3xl">
              {info.name}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
              {info.summary}
            </p>
          </div>

          <div className="mb-1 flex shrink-0 gap-2" aria-hidden>
            {GLOBE_BODY_IDS.map((body) => (
              <span
                key={body}
                className={cn(
                  'size-1.5 rounded-full transition-all duration-300',
                  body === activeBody ? 'w-4 bg-primary' : 'bg-white/40',
                )}
              />
            ))}
          </div>
        </div>

        <dl
          key={`${info.id}-stats`}
          className="grid grid-cols-3 gap-x-4 gap-y-3"
        >
          {info.stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="font-mono text-[9px] tracking-[0.14em] text-white/50 uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 truncate text-sm text-white tabular-nums">
                {stat.value}
                {stat.unit ? (
                  <span className="ml-1 text-white/50">{stat.unit}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);
