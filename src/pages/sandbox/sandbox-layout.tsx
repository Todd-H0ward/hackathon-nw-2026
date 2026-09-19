import { type CSSProperties, useState } from 'react';
import { Outlet } from 'react-router';

import { motion } from 'motion/react';

import { ToastProvider } from '@/shared/ui';

import { useWorldCatalog } from '@/features/ecosystem/use-world-catalog';
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
} from '@/store';

import { LabDialog, LabRail, LabStatus } from './ui';
import { useLabActions } from './use-lab-actions';
import { useLabBootstrap } from './use-lab-bootstrap';

const shellClassName =
  'group/lab flex h-dvh overflow-hidden bg-background text-foreground text-xs max-mobile:flex-col motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:!transition-none';

const SandboxShell = () => {
  // Single mount point for the experiment lifecycle: one create, one socket.
  useLabBootstrap();

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

  // Arriving with a planet in flight: fade the lab in around it.
  const [arriving] = useState(() => getTransitionState().phase !== 'idle');

  return (
    <motion.div
      className={shellClassName}
      initial={arriving ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      data-expanded={expanded || undefined}
      style={{ '--world-color': world?.color ?? '#70e0c4' } as CSSProperties}
    >
      <LabRail
        seed={sim.seed}
        onExport={actions.exportExperiment}
        onOpenGuide={() => setModal('guide')}
      />

      {/*
        Anchors the floating LabStatus without reserving height. Scrolling lives
        on the inner layer so the notice stays pinned instead of scrolling away.
      */}
      <div className="relative min-h-0 min-w-0 flex-1">
        <LabStatus
          booting={booting}
          streamStatus={streamStatus}
          worldsLoading={worlds.isLoading}
          worldsError={worlds.isError}
        />
        {/* Pages assume a loaded planet catalog; the notice explains the wait. */}
        <div className="h-full overflow-y-auto">
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
