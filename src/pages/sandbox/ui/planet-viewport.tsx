import { useEffect, useRef } from 'react';

import { Focus, Layers3, Maximize2, Radio, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import { TOUR_ANCHORS } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import {
  GLOBE_DEFAULTS,
  GLOBE_FILL_CAMERA,
  type GlobeBodyId,
  GlobeCanvas,
  type PlanetScreenPose,
  projectedRadius,
} from '@/shared/ui/globe';

import {
  type Simulation,
  SurfaceLife,
  type WorldInfo,
} from '@/features/ecosystem';
import { registerSandboxPose } from '@/features/planet-transition';
import {
  getTransitionState,
  useTransitionDirection,
  useTransitionPhase,
} from '@/store';

import { ResearchScene } from '../research-scene';
import { SceneBoundary } from './scene-boundary';

interface PlanetViewportProps {
  body: GlobeBodyId;
  world: WorldInfo;
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
}

const toolClass =
  'inline-flex size-8 items-center justify-center rounded-[5px] border border-border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:bg-secondary hover:text-foreground aria-pressed:border-primary/50 aria-pressed:bg-secondary aria-pressed:text-foreground';

const measureViewportPose = (
  el: HTMLElement | null,
): PlanetScreenPose | null => {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return null;
  const distance = GLOBE_FILL_CAMERA.position[2];
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    radius: projectedRadius(
      GLOBE_DEFAULTS.RADIUS,
      distance,
      GLOBE_FILL_CAMERA.fov,
      rect.height,
    ),
    distance,
  };
};

export const PlanetViewport = ({
  body,
  world,
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
  const sectionRef = useRef<HTMLElement>(null);
  const transitionPhase = useTransitionPhase();
  const transitionDirection = useTransitionDirection();
  // The planet is still in flight — show ours once it lands.
  const sceneHidden =
    transitionPhase === 'launch' ||
    transitionPhase === 'handoff' ||
    transitionPhase === 'flight';
  // Keep colonies/overlays off until the ferry has fully handed off.
  const showSurface =
    transitionPhase === 'idle' ||
    (transitionDirection === 'back' && !sceneHidden);

  useEffect(() => {
    const resolve = () => measureViewportPose(sectionRef.current);
    registerSandboxPose(resolve);
    return () => registerSandboxPose(null);
  }, []);

  // Forward arrival only — reverse lands on the home carousel.
  useEffect(() => {
    const { phase, direction, setTarget } = getTransitionState();
    if (phase === 'idle' || direction !== 'forward') return;

    setTarget(() => measureViewportPose(sectionRef.current));
    return () => {
      const state = getTransitionState();
      if (state.direction === 'forward') state.setTarget(null);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-tour={TOUR_ANCHORS.VIEWPORT}
      className="relative min-h-[360px] flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_50%_50%,color-mix(in_oklch,var(--world-color)_9%,transparent),transparent_62%)] max-mobile:min-h-[380px]"
      aria-label="Интерактивная планета с особями и колониями"
    >
      <div className="pointer-events-none absolute top-4 right-4 left-4 z-[11] flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[8px] tracking-[1.45px] text-muted-foreground">
            {world.code}{' '}
            <span className="mx-[7px] text-muted-foreground/50">/</span>{' '}
            ПОВЕРХНОСТНЫЙ СЛОЙ · SEED {sim.seed}
          </span>
          <h2 className="mt-1.5 text-[22px] font-normal tracking-[-0.6px]">
            {world.name}
            <span className="mt-1 block text-[10px] tracking-normal text-muted-foreground">
              {world.process}
            </span>
          </h2>
        </div>
        <span
          className={cn(
            'flex items-center gap-[7px] rounded border px-2 py-1.5 font-mono text-[8px] tracking-[1px]',
            running
              ? 'border-xeno-green/30 bg-xeno-green/10 text-xeno-green'
              : 'border-border bg-secondary text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'size-1 rounded-full',
              running ? 'bg-xeno-green' : 'bg-muted-foreground',
            )}
          />
          {running ? 'НАБЛЮДЕНИЕ' : 'ПАУЗА'}
        </span>
      </div>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: sceneHidden ? 0 : 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Defer WebGL until land/idle — avoid a third canvas during ferry. */}
        {!sceneHidden ? (
          <SceneBoundary key={body}>
            <GlobeCanvas
              body={body}
              cameraReset={cameraReset}
              fill
              stars
              interactive
            >
              {showSurface ? (
                <>
                  <ResearchScene
                    sim={sim}
                    selected={selected}
                    reset={cameraReset}
                  />
                  <SurfaceLife
                    simulation={sim}
                    selected={selected}
                    showLinks={showLinks}
                    showLabels={showLabels}
                    onSelect={onSelect}
                  />
                </>
              ) : null}
            </GlobeCanvas>
          </SceneBoundary>
        ) : null}
      </motion.div>
      <div className="absolute top-[88px] right-3 z-[11] grid gap-1.5">
        <button
          type="button"
          className={toolClass}
          title="Показать связи"
          aria-label="Показать связи"
          aria-pressed={showLinks}
          onClick={onToggleLinks}
        >
          <Radio size={17} />
        </button>
        <button
          type="button"
          className={toolClass}
          title="Подписи колоний"
          aria-label="Подписи колоний"
          aria-pressed={showLabels}
          onClick={onToggleLabels}
        >
          <Layers3 size={17} />
        </button>
        <button
          type="button"
          className={toolClass}
          title="Исходный ракурс"
          aria-label="Исходный ракурс"
          onClick={onResetCamera}
        >
          <Focus size={17} />
        </button>
        <button
          type="button"
          className={toolClass}
          title="Расширить сцену"
          aria-label="Расширить сцену"
          aria-pressed={expanded}
          onClick={onToggleExpanded}
        >
          <Maximize2 size={17} />
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-[46px] left-4 grid gap-1.5 font-mono text-[7px] tracking-[1.1px] text-muted-foreground/60">
        <span>ПОВОРОТ — ПЕРЕТАСКИВАНИЕ</span>
        <span>МАСШТАБ — КОЛЕСО МЫШИ</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex gap-3.5 text-[8px] text-muted-foreground max-laptop:gap-[9px] max-mobile:text-[7px]">
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
          <span className="h-px w-2.5 bg-muted-foreground" />
          Связь
        </span>
      </div>
      {sim.effect && (
        <div
          className={cn(
            'absolute bottom-[50px] left-1/2 flex -translate-x-1/2 items-center gap-[9px] whitespace-nowrap rounded-md border border-xeno-green/40 bg-card/90 px-[13px] py-[9px] text-[9px] text-xeno-green backdrop-blur max-mobile:bottom-[100px] max-mobile:p-2 max-mobile:text-[8px]',
            (sim.effect.kind === 'scarcity' || sim.effect.kind === 'storm') &&
              'border-destructive/40 text-destructive',
          )}
        >
          <Zap size={15} />
          {sim.effect.kind === 'pulse'
            ? 'Энергетический импульс'
            : sim.effect.kind === 'storm'
              ? 'Возмущение среды'
              : 'Истощение ресурса'}
          <span className="font-mono text-[8px] opacity-60 max-mobile:text-[7px]">
            {sim.effect.until - sim.tick} тактов
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute right-4 bottom-4 grid grid-cols-[auto_auto] items-center gap-x-2 gap-y-1">
        <b className="text-[20px] font-[350] text-foreground">{aliveCount}</b>
        <span className="font-mono text-[7px] tracking-[1px] text-muted-foreground">
          ОСОБЕЙ
        </span>
        <i className="col-span-full my-1 border-t border-border" />
        <b className="text-[20px] font-[350] text-foreground">{colonyCount}</b>
        <span className="font-mono text-[7px] tracking-[1px] text-muted-foreground">
          КОЛОНИЙ
        </span>
      </div>
    </section>
  );
};
