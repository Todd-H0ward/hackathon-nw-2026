import { useLab } from '@/contexts/lab';

import {
  ColoniesPanel,
  EnvironmentPanel,
  InterventionBar,
  MetricGrid,
  PlanetViewport,
  TimeControls,
} from './ui';

export const SandboxPage = () => {
  const lab = useLab();

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)_270px] border border-[#222c37] rounded-[10px] overflow-hidden min-h-[705px] group-data-[expanded=true]/lab:grid-cols-1 min-[1600px]:grid-cols-[250px_minmax(0,1fr)_310px] max-[1180px]:grid-cols-[185px_minmax(0,1fr)_235px] max-[980px]:grid-cols-[190px_minmax(0,1fr)] max-[700px]:grid-cols-1">
      <EnvironmentPanel
        body={lab.body}
        sim={lab.sim}
        onSelectWorld={lab.selectWorld}
        onSettings={lab.settings}
      />

      <main className="min-w-0 bg-[#080d14]">
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
  );
};
