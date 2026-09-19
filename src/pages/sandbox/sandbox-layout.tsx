import { type CSSProperties, useState } from 'react';
import { Outlet } from 'react-router';

import { motion } from 'motion/react';

import { LabProvider, useLab } from '@/contexts/lab';

import { ToastProvider } from '@/shared/ui';

import { usePlanetTransition } from '@/features/planet-transition';

import { LabDialog, LabRail, LabStatus } from './ui';

const shellClassName =
  'group/lab flex h-dvh overflow-hidden bg-background text-foreground text-xs max-[700px]:flex-col motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:!transition-none';

const SandboxShell = () => {
  const lab = useLab();
  // Arriving with a planet in flight: fade the lab in around it.
  const [arriving] = useState(
    () => usePlanetTransition.getState().phase !== 'idle',
  );

  return (
    <motion.div
      className={shellClassName}
      initial={arriving ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      data-expanded={lab.expanded || undefined}
      style={
        { '--world-color': lab.world?.color ?? '#70e0c4' } as CSSProperties
      }
    >
      <LabRail
        seed={lab.sim.seed}
        onExport={lab.exportExperiment}
        onOpenGuide={() => lab.setModal('guide')}
      />

      {/*
        Anchors the floating LabStatus without reserving height. Scrolling lives
        on the inner layer so the notice stays pinned instead of scrolling away.
      */}
      <div className="relative min-h-0 min-w-0 flex-1">
        <LabStatus
          booting={lab.booting}
          streamStatus={lab.streamStatus}
          worldsLoading={lab.worldsLoading}
          worldsError={lab.worldsError}
        />
        {/* Pages assume a loaded planet catalog; the notice explains the wait. */}
        <div className="h-full overflow-y-auto">
          {lab.world ? <Outlet /> : null}
        </div>
      </div>

      <LabDialog
        modal={lab.modal}
        sim={lab.sim}
        seed={lab.seed}
        onSeedChange={lab.setSeed}
        onClose={() => lab.setModal(null)}
        onDownload={lab.exportExperiment}
        onReset={() => {
          void lab.resetExperiment();
        }}
        onReplay={lab.runReplay}
      />
    </motion.div>
  );
};

export const SandboxLayout = () => (
  <ToastProvider duration={3500}>
    <LabProvider>
      <SandboxShell />
    </LabProvider>
  </ToastProvider>
);
