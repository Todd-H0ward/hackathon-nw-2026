import { Focus, Layers3, Maximize2, Radio, Zap } from 'lucide-react';

import { type GlobeBodyId, GlobeCanvas } from '@/shared/ui/globe';
import { cn } from '@/shared/lib/utils';

import { type Simulation, WORLDS } from '@/features/ecosystem/model';
import { SurfaceLife } from '@/features/ecosystem/surface-life';

import { SceneBoundary } from './scene-boundary';

type PlanetViewportProps = {
  body: GlobeBodyId;
  sim: Simulation;
  running: boolean;
  selected: number | null;
  showLinks: boolean;
  showLabels: boolean;
  expanded: boolean;
  cameraReset: number;
  aliveCount: number;
  colonyCount: number;
  onSelect: (id: number) => void;
  onToggleLinks: () => void;
  onToggleLabels: () => void;
  onResetCamera: () => void;
  onToggleExpanded: () => void;
};

export const PlanetViewport = ({
  body,
  sim,
  running,
  selected,
  showLinks,
  showLabels,
  expanded,
  cameraReset,
  aliveCount,
  colonyCount,
  onSelect,
  onToggleLinks,
  onToggleLabels,
  onResetCamera,
  onToggleExpanded,
}: PlanetViewportProps) => {
  const world = WORLDS[body];

  return (
    <section
      className={cn(
        'h-[496px] relative overflow-hidden bg-[radial-gradient(ellipse_at_45%_50%,#152b3840,transparent_62%)]',
        'group-data-[expanded=true]/lab:h-[65vh] group-data-[expanded=true]/lab:min-h-[480px]',
        'min-[1600px]:h-[580px] max-[1180px]:h-[460px] max-[700px]:h-[420px]',
        'max-[700px]:group-data-[expanded=true]/lab:min-h-[450px]',
      )}
      aria-label="Интерактивная планета с особями и колониями"
    >
      <div className="absolute z-[11] top-6 left-6 right-6 flex justify-between items-start pointer-events-none gap-3 max-[1180px]:left-[17px] max-[1180px]:right-[17px]">
        <div>
          <span className={cn('[font:9px_monospace] tracking-[1.45px] text-[#82929f]', 'text-[8px] max-[700px]:text-[7px]')}>
            {world.code} <span className="text-[#495967] mx-[7px]">/</span>{' '}
            ПОВЕРХНОСТНЫЙ СЛОЙ
          </span>
          <h2 className="text-[27px] font-normal tracking-[-0.7px] my-2.5 max-[700px]:text-[23px]">
            {world.name}
            <span className="block text-[10px] tracking-normal text-[#728691] mt-[5px]">
              {world.process}
            </span>
          </h2>
        </div>
        <span
          className={cn(
            '[font:8px_monospace] tracking-[1px] flex gap-[7px] items-center bg-[#122721b8] border border-[#284c3e] text-[#9bbfac] py-1.5 px-2 rounded max-[1180px]:text-[6px] max-[700px]:text-[6px]',
            !running && 'text-[#aebbc8] bg-[#212a34] border-[#374350]',
          )}
        >
          <span className="size-1 bg-[#9dd5aa] rounded-full" />
          {running ? 'НАБЛЮДЕНИЕ' : 'ПАУЗА'}
        </span>
      </div>
      <div className="absolute inset-0">
        <SceneBoundary key={body}>
          <GlobeCanvas
            body={body}
            cameraReset={cameraReset}
            fill
            stars
            interactive
          >
            <SurfaceLife
              simulation={sim}
              selected={selected}
              showLinks={showLinks}
              showLabels={showLabels}
              onSelect={onSelect}
            />
          </GlobeCanvas>
        </SceneBoundary>
      </div>
      <div className="absolute right-[15px] top-[100px] grid gap-1.5 z-[11]">
        <button
          type="button"
          className={cn(
            'size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]',
            'bg-[#101c25c9] border-[#263540] text-[#93a6b3]',
          )}
          title="Показать связи"
          aria-label="Показать связи"
          aria-pressed={showLinks}
          onClick={onToggleLinks}
        >
          <Radio size={17} />
        </button>
        <button
          type="button"
          className={cn(
            'size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]',
            'bg-[#101c25c9] border-[#263540] text-[#93a6b3]',
          )}
          title="Подписи колоний"
          aria-label="Подписи колоний"
          aria-pressed={showLabels}
          onClick={onToggleLabels}
        >
          <Layers3 size={17} />
        </button>
        <button
          type="button"
          className={cn(
            'size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]',
            'bg-[#101c25c9] border-[#263540] text-[#93a6b3]',
          )}
          title="Исходный ракурс"
          aria-label="Исходный ракурс"
          onClick={onResetCamera}
        >
          <Focus size={17} />
        </button>
        <button
          type="button"
          className={cn(
            'size-8 inline-flex items-center justify-center border border-transparent rounded-[5px] bg-transparent text-[#8c9aa7] hover:text-[#ceebdf] hover:bg-[#23342f] hover:border-[#344a43] aria-pressed:text-[#ceebdf] aria-pressed:bg-[#23342f] aria-pressed:border-[#344a43]',
            'bg-[#101c25c9] border-[#263540] text-[#93a6b3]',
          )}
          title="Расширить сцену"
          aria-label="Расширить сцену"
          aria-pressed={expanded}
          onClick={onToggleExpanded}
        >
          <Maximize2 size={17} />
        </button>
      </div>
      <div className="absolute left-[23px] bottom-[70px] grid gap-1.5 [font:7px_monospace] tracking-[1.1px] text-[#4d6674] pointer-events-none max-[1180px]:left-[17px] max-[1180px]:text-[6px]">
        <span>ПОВОРОТ — ПЕРЕТАСКИВАНИЕ</span>
        <span>МАСШТАБ — КОЛЕСО МЫШИ</span>
      </div>
      <div className="absolute bottom-5 left-6 flex gap-3.5 text-[8px] text-[#80949f] pointer-events-none max-[1180px]:gap-[9px] max-[1180px]:left-[17px] max-[700px]:text-[7px]">
        <span className="flex items-center gap-[5px]">
          <i className="size-[5px] rotate-45 block bg-[#81d6b9]" />
          Особь
        </span>
        <span className="flex items-center gap-[5px]">
          <i className="size-[5px] rotate-45 block bg-[#f6f4d9]" />
          Рождение
        </span>
        <span className="flex items-center gap-[5px]">
          <i className="size-[5px] rotate-45 block bg-[#ed7c76]" />
          Угасание
        </span>
        <span className="flex items-center gap-[5px]">
          <span className="w-2.5 h-px bg-[#709599]" />
          Связь
        </span>
      </div>
      {sim.effect && (
        <div
          className={cn(
            'absolute left-1/2 bottom-[65px] -translate-x-1/2 bg-[#25483be8] border border-[#4e8070] text-[#bee7d2] py-[9px] px-[13px] rounded-md flex gap-[9px] items-center text-[9px] whitespace-nowrap max-[700px]:bottom-[115px] max-[700px]:text-[8px] max-[700px]:p-2',
            (sim.effect.kind === 'scarcity' || sim.effect.kind === 'storm') &&
              'bg-[#422a25e8] border-[#84514a] text-[#f3b7a4]',
          )}
        >
          <Zap size={15} />
          {sim.effect.kind === 'pulse'
            ? 'Энергетический импульс'
            : sim.effect.kind === 'storm'
              ? 'Возмущение среды'
              : 'Истощение ресурса'}
          <span className="[font:8px_monospace] opacity-60 max-[700px]:text-[7px]">
            {sim.effect.until - sim.tick} тактов
          </span>
        </div>
      )}
      <div className="absolute right-5 bottom-[55px] grid grid-cols-[auto_auto] gap-x-2 gap-y-1 items-center pointer-events-none">
        <b className="text-[22px] font-[350] text-[#c6dcd5]">{aliveCount}</b>
        <span className="[font:7px_monospace] text-[#6c8994] tracking-[1px]">
          ОСОБЕЙ
        </span>
        <i className="col-span-full border-t border-[#2f414b] my-1" />
        <b className="text-[22px] font-[350] text-[#c6dcd5]">{colonyCount}</b>
        <span className="[font:7px_monospace] text-[#6c8994] tracking-[1px]">
          КОЛОНИЙ
        </span>
      </div>
    </section>
  );
};
