import type { CSSProperties } from 'react';
import { Outlet } from 'react-router';

import { LabProvider, useLab } from '@/contexts/lab';

import { ToastProvider } from '@/shared/ui';

import { downloadExperiment } from './lib';
import { LabDialog, LabFooter, LabHeader, LabTitle } from './ui';

const shellClassName =
  "group/lab min-h-screen overflow-y-auto bg-[#090d12] text-[#e6edf1] text-xs px-8 pb-[18px] font-['Geist_Variable',Arial,sans-serif] min-[1600px]:px-12 max-[1180px]:px-[18px] max-[700px]:px-3 max-[700px]:pb-[15px] motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:!transition-none";

const SandboxShell = () => {
  const lab = useLab();

  return (
    <div
      className={shellClassName}
      data-expanded={lab.expanded || undefined}
      style={{ '--world-color': lab.world.color } as CSSProperties}
    >
      <LabHeader
        onOpenGuide={() => lab.setModal('guide')}
        onOpenAtlas={() => lab.setModal('atlas')}
      />

      <LabTitle
        seed={lab.sim.seed}
        onExport={() => {
          downloadExperiment(lab.sim);
          lab.notify('Эксперимент экспортирован в JSON');
        }}
      />

      <Outlet />

      <LabFooter onOpenGuide={() => lab.setModal('guide')} />

      <LabDialog
        modal={lab.modal}
        sim={lab.sim}
        seed={lab.seed}
        onSeedChange={lab.setSeed}
        onClose={() => lab.setModal(null)}
        onSelectWorld={lab.selectWorld}
        onDownload={() => downloadExperiment(lab.sim)}
        onReset={lab.resetExperiment}
        onReplay={lab.runReplay}
      />
    </div>
  );
};

export const SandboxLayout = () => (
  <ToastProvider duration={3500}>
    <LabProvider>
      <SandboxShell />
    </LabProvider>
  </ToastProvider>
);
