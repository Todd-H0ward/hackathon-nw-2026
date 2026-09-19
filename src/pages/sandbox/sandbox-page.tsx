import type { CSSProperties } from 'react';

import { downloadExperiment } from './lib';
import {
  AnalyticsView,
  ColoniesPanel,
  EnvironmentPanel,
  InterventionBar,
  LabDialog,
  LabFooter,
  LabHeader,
  LabTitle,
  LabToast,
  MetricGrid,
  PlanetViewport,
  TimeControls,
} from './ui';
import { useLaboratory } from './use-laboratory';

export const SandboxPage = () => {
  const lab = useLaboratory();

  return (
    <div
      className="group/lab min-h-screen bg-[#090d12] text-[#e6edf1] text-xs px-8 pb-[18px] font-['Geist_Variable',Arial,sans-serif] min-[1600px]:px-12 max-[1180px]:px-[18px] max-[700px]:px-3 max-[700px]:pb-[15px] motion-reduce:[&_*]:scroll-auto motion-reduce:[&_*]:!transition-none [&_button]:cursor-pointer [&_button]:transition-[background,border-color,color] [&_button]:duration-[180ms] [&_button:disabled]:opacity-40 [&_button:disabled]:cursor-not-allowed [&_button]:[-webkit-tap-highlight-color:transparent] [&_a]:[-webkit-tap-highlight-color:transparent] [&_input]:[-webkit-tap-highlight-color:transparent] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#90d3c1] [&_button:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-[#90d3c1] [&_a:focus-visible]:outline-offset-4 [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-[#90d3c1] [&_input:focus-visible]:outline-offset-4"
      data-expanded={lab.expanded || undefined}
      style={{ '--world-color': lab.world.color } as CSSProperties}
    >
      <LabHeader
        view={lab.view}
        onViewChange={lab.setView}
        onOpenGuide={() => lab.setModal('guide')}
        onOpenAtlas={() => lab.setModal('atlas')}
      />

      <LabTitle
        seed={lab.sim.seed}
        onExport={() => {
          downloadExperiment(lab.sim);
          lab.setToast('Эксперимент экспортирован в JSON');
        }}
      />

      <div className="grid grid-cols-[220px_minmax(0,1fr)_270px] border border-[#222c37] rounded-[10px] overflow-hidden min-h-[705px] group-data-[expanded=true]/lab:grid-cols-1 min-[1600px]:grid-cols-[250px_minmax(0,1fr)_310px] max-[1180px]:grid-cols-[185px_minmax(0,1fr)_235px] max-[980px]:grid-cols-[190px_minmax(0,1fr)] max-[700px]:grid-cols-1">
        <EnvironmentPanel
          body={lab.body}
          sim={lab.sim}
          onSelectWorld={lab.selectWorld}
          onSettings={lab.settings}
        />

        <main className="min-w-0 bg-[#080d14]">
          {lab.view === 'lab' ? (
            <PlanetViewport
              body={lab.body}
              sim={lab.sim}
              running={lab.running}
              selected={lab.selected}
              showLinks={lab.showLinks}
              showLabels={lab.showLabels}
              expanded={lab.expanded}
              cameraReset={lab.cameraReset}
              aliveCount={lab.alive.length}
              colonyCount={lab.colonies.length}
              onSelect={lab.setSelected}
              onToggleLinks={lab.toggleShowLinks}
              onToggleLabels={lab.toggleShowLabels}
              onResetCamera={lab.bumpCameraReset}
              onToggleExpanded={lab.toggleExpanded}
            />
          ) : (
            <AnalyticsView
              body={lab.body}
              sim={lab.sim}
              onOpenReplay={() => lab.setModal('replay')}
            />
          )}

          <TimeControls
            running={lab.running}
            speed={lab.speed}
            tick={lab.sim.tick}
            seed={lab.sim.seed}
            onToggleRunning={lab.toggleRunning}
            onStep={lab.step}
            onOpenReset={() => lab.setModal('reset')}
            onSpeedChange={lab.setSpeed}
          />

          <InterventionBar
            onPulse={() => lab.intervene({ type: 'pulse' })}
            onStorm={() => lab.intervene({ type: 'storm' })}
            onScarcity={() => lab.intervene({ type: 'scarcity' })}
          />

          <MetricGrid current={lab.metrics} history={lab.history} />
        </main>

        <ColoniesPanel
          sim={lab.sim}
          colonies={lab.colonies}
          selected={lab.selected}
          aliveCount={lab.alive.length}
          colony={lab.colony}
          group={lab.group}
          focused={lab.focused}
          onSelect={lab.setSelected}
          onAddColony={lab.addColony}
        />
      </div>

      <LabFooter onOpenGuide={() => lab.setModal('guide')} />

      <LabDialog
        dialogRef={lab.dialogRef}
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

      <LabToast message={lab.toast} />
    </div>
  );
};
