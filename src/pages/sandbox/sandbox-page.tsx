import { useWorldCatalog } from '@/features/ecosystem/use-world-catalog';
import {
  useLabBody,
  useLabBumpCameraReset,
  useLabCameraReset,
  useLabExpanded,
  useLabRunning,
  useLabSetModal,
  useLabSetSelected,
  useLabShowLabels,
  useLabShowLinks,
  useLabSpeed,
  useLabToggleExpanded,
  useLabToggleShowLabels,
  useLabToggleShowLinks,
} from '@/store';

import {
  ColoniesPanel,
  EnvironmentPanel,
  InterventionBar,
  MetricGrid,
  PlanetViewport,
  TimeControls,
} from './ui';
import { useLabActions } from './use-lab-actions';
import { useLabDerived } from './use-lab-derived';

export const SandboxPage = () => {
  const actions = useLabActions();
  const worlds = useWorldCatalog();
  const body = useLabBody();
  const {
    sim,
    selected,
    colonies,
    alive,
    colony,
    group,
    focused,
    metrics,
    history,
  } = useLabDerived();

  const setSelected = useLabSetSelected();
  const setModal = useLabSetModal();
  const running = useLabRunning();
  const speed = useLabSpeed();
  const showLinks = useLabShowLinks();
  const showLabels = useLabShowLabels();
  const expanded = useLabExpanded();
  const cameraReset = useLabCameraReset();
  const toggleShowLinks = useLabToggleShowLinks();
  const toggleShowLabels = useLabToggleShowLabels();
  const toggleExpanded = useLabToggleExpanded();
  const bumpCameraReset = useLabBumpCameraReset();

  const world = worlds.catalog[body];

  // The layout holds the route back until `/worlds` resolves.
  if (!world) return null;

  return (
    <div className="grid h-full grid-cols-[220px_minmax(0,1fr)_270px] group-data-[expanded=true]/lab:grid-cols-1 ultrawide:grid-cols-[250px_minmax(0,1fr)_300px] max-laptop:grid-cols-[190px_minmax(0,1fr)_235px] max-tablet:h-auto max-tablet:grid-cols-[190px_minmax(0,1fr)] max-mobile:grid-cols-1">
      <EnvironmentPanel
        body={body}
        sim={sim}
        world={world}
        worlds={worlds.available}
        onSelectWorld={actions.selectWorld}
        onSettings={actions.applySettings}
      />

      <main className="flex min-h-0 min-w-0 flex-col bg-background max-tablet:min-h-[calc(100dvh-1px)]">
        <PlanetViewport
          body={body}
          world={world}
          sim={sim}
          running={running}
          selected={selected}
          showLinks={showLinks}
          showLabels={showLabels}
          expanded={expanded}
          cameraReset={cameraReset}
          aliveCount={alive.length}
          colonyCount={colonies.length}
          onSelect={setSelected}
          onToggleLinks={toggleShowLinks}
          onToggleLabels={toggleShowLabels}
          onResetCamera={bumpCameraReset}
          onToggleExpanded={toggleExpanded}
        />

        <TimeControls
          running={running}
          speed={speed}
          tick={sim.tick}
          seed={sim.seed}
          onToggleRunning={actions.toggleRunning}
          onStep={actions.step}
          onOpenReset={() => setModal('reset')}
          onSpeedChange={actions.setSpeed}
        />

        <InterventionBar
          onPulse={() => actions.applyIntervention({ type: 'pulse' })}
          onStorm={() => actions.applyIntervention({ type: 'storm' })}
          onScarcity={() => actions.applyIntervention({ type: 'scarcity' })}
        />

        <MetricGrid current={metrics} history={history} />
      </main>

      <ColoniesPanel
        sim={sim}
        colonies={colonies}
        selected={selected}
        aliveCount={alive.length}
        maxPopulation={world.maxPopulation}
        maxColonies={world.maxColonies}
        colony={colony}
        group={group}
        focused={focused}
        onSelect={setSelected}
        onAddColony={actions.addColony}
      />
    </div>
  );
};
