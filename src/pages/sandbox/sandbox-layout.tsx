import { type CSSProperties, useState } from 'react';
import { Outlet } from 'react-router';

import { motion } from 'motion/react';

import { LabProvider, useLab } from '@/contexts/lab';

import { ToastProvider } from '@/shared/ui';

import { usePlanetTransition } from '@/features/planet-transition';

import { downloadExperiment } from './lib';
import { LabDialog, LabRail } from './ui';

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
      style={{ '--world-color': lab.world.color } as CSSProperties}
    >
      <LabRail
        seed={lab.sim.seed}
        onExport={() => {
          downloadExperiment(lab.sim);
          lab.notify('Эксперимент экспортирован в JSON');
        }}
        onOpenGuide={() => lab.setModal('guide')}
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>

      <LabDialog
        modal={lab.modal}
        sim={lab.sim}
        seed={lab.seed}
        onSeedChange={lab.setSeed}
        onClose={() => lab.setModal(null)}
        onDownload={() => downloadExperiment(lab.sim)}
        onReset={lab.resetExperiment}
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
