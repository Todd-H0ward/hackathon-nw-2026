import { useEffect, useMemo, useState } from 'react';

import { activeColonies, living } from '@/features/ecosystem/model';
import { useToast } from '@/shared/ui';
import {
  selectBody,
  selectSim,
  selectWorld as selectWorldMeta,
  selectWorlds,
  useLabStore,
} from '@/store';

import type { LabModal } from './types';

/** Builds lab UI + derived simulation state for LabProvider. */
export const useLabState = () => {
  const { toast: notify } = useToast();

  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(1);
  const [showLinks, setShowLinks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [modal, setModal] = useState<LabModal>(null);
  const [cameraReset, setCameraReset] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [seed, setSeed] = useState('2048');

  const body = useLabStore(selectBody);
  const worlds = useLabStore(selectWorlds);
  const sim = useLabStore(selectSim);
  const world = useLabStore(selectWorldMeta);

  const setBody = useLabStore((s) => s.setBody);
  const updateCurrent = useLabStore((s) => s.updateCurrent);
  const stepCurrent = useLabStore((s) => s.stepCurrent);
  const applySettings = useLabStore((s) => s.applySettings);
  const applyIntervention = useLabStore((s) => s.applyIntervention);
  const seedColony = useLabStore((s) => s.seedColony);
  const resetCurrent = useLabStore((s) => s.resetCurrent);
  const replayCurrent = useLabStore((s) => s.replayCurrent);

  const colonies = useMemo(() => activeColonies(sim), [sim]);
  const alive = useMemo(() => living(sim), [sim]);
  const metrics = useMemo(
    () =>
      sim.history.at(-1) ?? {
        population: 0,
        power: 0,
        efficiency: 0,
        entropy: 0,
        delay: null,
      },
    [sim],
  );
  const history = useMemo(() => sim.history.slice(-70), [sim]);
  const colony = useMemo(
    () => sim.colonies.find((c) => c.id === selected),
    [sim, selected],
  );
  const group = useMemo(
    () =>
      selected === null
        ? []
        : sim.individuals.filter(
            (i) => i.dead === null && i.colony === selected,
          ),
    [sim, selected],
  );
  const focused = useMemo(
    () =>
      group.find((i) => i.action === 'divide') ??
      group.find((i) => i.action === 'signal') ??
      group[0],
    [group],
  );

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => stepCurrent(speed), 450);
    return () => clearInterval(timer);
  }, [running, speed, stepCurrent]);

  const selectWorld = (next: typeof body) => {
    setBody(next);
    setSelected(1);
    setSeed(String(worlds[next].seed));
  };

  const addColony = () => {
    if (alive.length > 172 || colonies.length >= 12) {
      notify('Достигнут лимит: 180 особей или 12 колоний');
      return;
    }
    const id = seedColony();
    if (id !== null) setSelected(id);
    notify('Зародыш внесён. Внешний ресурс зарегистрирован.');
  };

  const resetExperiment = () => {
    const nextSeed = Math.max(
      1,
      Math.min(999999, Math.floor(Number(seed) || 2048)),
    );
    resetCurrent(nextSeed);
    setSelected(1);
    setSeed(String(nextSeed));
    setModal(null);
    notify('Исходный эксперимент восстановлен');
  };

  const runReplay = () => {
    setRunning(false);
    const { equal } = replayCurrent();
    notify(
      equal
        ? 'Совпадение 100%: эксперимент воспроизведён'
        : 'Обнаружено расхождение воспроизведения',
    );
    setModal(null);
  };

  return {
    body,
    sim,
    world,
    colonies,
    alive,
    colony,
    group,
    metrics,
    focused,
    history,
    running,
    setRunning,
    toggleRunning: () => setRunning((v) => !v),
    speed,
    setSpeed,
    selected,
    setSelected,
    showLinks,
    toggleShowLinks: () => setShowLinks((v) => !v),
    showLabels,
    toggleShowLabels: () => setShowLabels((v) => !v),
    modal,
    setModal,
    notify,
    cameraReset,
    bumpCameraReset: () => setCameraReset((n) => n + 1),
    expanded,
    toggleExpanded: () => setExpanded((v) => !v),
    seed,
    setSeed,
    update: updateCurrent,
    step: () => stepCurrent(1),
    selectWorld,
    settings: applySettings,
    intervene: applyIntervention,
    addColony,
    resetExperiment,
    runReplay,
  };
};

export type LabState = ReturnType<typeof useLabState>;
