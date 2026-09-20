import { useWorldCatalog, type WorldInfo } from '@/features/ecosystem';
import {
  useLabBody,
  useLabBumpCameraReset,
  useLabCameraReset,
  useLabExpanded,
  useLabMetricsStrip,
  useLabRunning,
  useLabSetModal,
  useLabSetSelected,
  useLabShowLabels,
  useLabShowLinks,
  useLabSimSeed,
  useLabSimSettings,
  useLabSimTick,
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
import { usePopulationEnd } from './use-population-end';

/** Settings + habitat — ignores 10 Hz individuals churn. */
const SandboxEnvironment = ({
  world,
  worlds,
}: {
  world: WorldInfo;
  worlds: WorldInfo[];
}) => {
  const body = useLabBody();
  const settings = useLabSimSettings();
  const actions = useLabActions();

  return (
    <EnvironmentPanel
      body={body}
      settings={settings}
      world={world}
      worlds={worlds}
      onSelectWorld={actions.selectWorld}
      onSettings={actions.applySettings}
    />
  );
};

/** 3D + colonies overlay — still needs the full simulation snapshot. */
const SandboxViewportColumn = ({ world }: { world: WorldInfo }) => {
  const body = useLabBody();
  const { sim, selected, colonies, alive } = useLabDerived();
  usePopulationEnd(alive.length, sim.tick);

  const setSelected = useLabSetSelected();
  const running = useLabRunning();
  const showLinks = useLabShowLinks();
  const showLabels = useLabShowLabels();
  const expanded = useLabExpanded();
  const cameraReset = useLabCameraReset();
  const toggleShowLinks = useLabToggleShowLinks();
  const toggleShowLabels = useLabToggleShowLabels();
  const toggleExpanded = useLabToggleExpanded();
  const bumpCameraReset = useLabBumpCameraReset();

  return (
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
  );
};

const SandboxTimeBar = () => {
  const actions = useLabActions();
  const setModal = useLabSetModal();
  const running = useLabRunning();
  const speed = useLabSpeed();
  const tick = useLabSimTick();
  const seed = useLabSimSeed();

  return (
    <TimeControls
      running={running}
      speed={speed}
      tick={tick}
      seed={seed}
      onToggleRunning={actions.toggleRunning}
      onStep={actions.step}
      onOpenReset={() => setModal('reset')}
      onSpeedChange={actions.setSpeed}
    />
  );
};

const SandboxInterventions = () => {
  const actions = useLabActions();
  return (
    <InterventionBar
      onPulse={() => actions.applyIntervention({ type: 'pulse' })}
      onStorm={() => actions.applyIntervention({ type: 'storm' })}
      onScarcity={() => actions.applyIntervention({ type: 'scarcity' })}
    />
  );
};

const SandboxMetrics = () => {
  const { history, tip } = useLabMetricsStrip(70);
  return <MetricGrid current={tip} history={history} />;
};

const SandboxColonies = ({ world }: { world: WorldInfo }) => {
  const actions = useLabActions();
  const setSelected = useLabSetSelected();
  const { sim, selected, colonies, alive, colony, group, focused } =
    useLabDerived();

  return (
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
  );
};

export const SandboxPage = () => {
  const worlds = useWorldCatalog();
  const body = useLabBody();
  const world = worlds.catalog[body];

  // The layout holds the route back until `/worlds` resolves.
  if (!world) return null;

  return (
    <div className="grid h-full grid-cols-[220px_minmax(0,1fr)_270px] group-data-[expanded=true]/lab:grid-cols-1 ultrawide:grid-cols-[250px_minmax(0,1fr)_300px] max-laptop:grid-cols-[190px_minmax(0,1fr)_235px] max-tablet:h-auto max-tablet:grid-cols-[190px_minmax(0,1fr)] max-mobile:grid-cols-1">
      <SandboxEnvironment world={world} worlds={worlds.available} />

      <main className="flex min-h-0 min-w-0 flex-col bg-background max-tablet:min-h-[calc(100dvh-1px)]">
        <SandboxViewportColumn world={world} />
        <SandboxTimeBar />
        <SandboxInterventions />
        <SandboxMetrics />
      </main>

      <SandboxColonies world={world} />
    </div>
  );
};
