import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { motion, useReducedMotion } from 'motion/react';

import { STATIC_ROUTES } from '@/shared/constants/routes';
import { ToastProvider } from '@/shared/ui';

import { useWorldCatalog } from '@/features/ecosystem';
import { readSandboxPose } from '@/features/planet-transition';
import {
  getTransitionState,
  useLabBody,
  useLabBooting,
  useLabExpanded,
  useLabModal,
  useLabSeed,
  useLabSetModal,
  useLabSetSeed,
  useLabSim,
  useLabStreamStatus,
  useTransitionDirection,
  useTransitionLaunch,
  useTransitionPhase,
} from '@/store';

import { ColonyBuilder } from './colony-builder';
import { ResearchPanel } from './research-panel';
import { LabDialog, LabRail, LabStatus } from './ui';
import { useLabActions } from './use-lab-actions';
import { useLabBootstrap } from './use-lab-bootstrap';

const shellClassName =
  'group/lab flex h-dvh overflow-hidden bg-background text-foreground text-xs max-mobile:flex-col motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:!transition-none';

const SandboxShell = () => {
  useLabBootstrap();

  const navigate = useNavigate();
  const launchTransition = useTransitionLaunch();
  const reduceMotion = useReducedMotion();
  const phase = useTransitionPhase();
  const direction = useTransitionDirection();
  const navigatedHome = useRef(false);

  const actions = useLabActions();
  const worlds = useWorldCatalog();

  const body = useLabBody();
  const sim = useLabSim();
  const seed = useLabSeed();
  const setSeed = useLabSetSeed();
  const modal = useLabModal();
  const setModal = useLabSetModal();
  const expanded = useLabExpanded();
  const booting = useLabBooting();
  const streamStatus = useLabStreamStatus();

  const world = worlds.catalog[body];

  const [arriving] = useState(
    () =>
      getTransitionState().phase !== 'idle' &&
      getTransitionState().direction === 'forward',
  );
  const leavingHome =
    direction === 'back' &&
    (phase === 'handoff' || phase === 'flight' || phase === 'land');

  const goHome = () => {
    if (reduceMotion) {
      navigate(STATIC_ROUTES.HOME);
      return;
    }
    const pose = readSandboxPose();
    if (!pose) {
      navigate(STATIC_ROUTES.HOME);
      return;
    }
    navigatedHome.current = false;
    launchTransition(body, pose, 'back');
  };

  useEffect(() => {
    if (phase !== 'handoff' || direction !== 'back') return;
    if (navigatedHome.current) return;
    navigatedHome.current = true;
    navigate(STATIC_ROUTES.HOME);
  }, [phase, direction, navigate]);

  return (
    <motion.div
      className={shellClassName}
      initial={arriving ? { opacity: 0 } : false}
      animate={{ opacity: leavingHome ? 0 : 1 }}
      transition={{
        duration: leavingHome ? 0.35 : 0.8,
        ease: 'easeOut',
        delay: arriving && !leavingHome ? 0.15 : 0,
      }}
      data-expanded={expanded || undefined}
      style={
        {
          pointerEvents: phase !== 'idle' ? 'none' : undefined,
          '--world-color': world?.color ?? '#70e0c4',
        } as CSSProperties
      }
    >
      <LabRail
        seed={sim.seed}
        onExport={actions.exportExperiment}
        onOpenGuide={() => navigate(STATIC_ROUTES.FAQ)}
        onGoHome={goHome}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <ResearchPanel />
        <ColonyBuilder />
        <LabStatus
          booting={booting}
          streamStatus={streamStatus}
          worldsLoading={worlds.isLoading}
          worldsError={worlds.isError}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          {world ? <Outlet /> : null}
        </div>
      </div>

      <LabDialog
        modal={modal}
        sim={sim}
        seed={seed}
        onSeedChange={setSeed}
        onClose={() => setModal(null)}
        onDownload={actions.exportExperiment}
        onReset={() => {
          void actions.resetExperiment();
        }}
        onReplay={actions.runReplay}
      />
    </motion.div>
  );
};

export const SandboxLayout = () => (
  <ToastProvider duration={3500}>
    <SandboxShell />
  </ToastProvider>
);
