import { useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import {
  selectAlive,
  selectBody,
  selectColonies,
  selectHistory,
  selectLabActions,
  selectMetrics,
  selectSim,
  selectWorld as selectWorldMeta,
  selectWorlds,
  useLabStore,
} from '@/store';

import type { LabModal, LabView } from './lib';

export const useLaboratory = () => {
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(1);
  const [showLinks, setShowLinks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<LabView>('lab');
  const [modal, setModal] = useState<LabModal>(null);
  const [toast, setToast] = useState('');
  const [cameraReset, setCameraReset] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [seed, setSeed] = useState('2048');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const body = useLabStore(selectBody);
  const worlds = useLabStore(selectWorlds);
  const sim = useLabStore(selectSim);
  const world = useLabStore(selectWorldMeta);
  const colonies = useLabStore(selectColonies);
  const alive = useLabStore(selectAlive);
  const metrics = useLabStore(selectMetrics);
  const history = useLabStore(selectHistory);
  const {
    setBody,
    updateCurrent,
    stepCurrent,
    applySettings,
    applyIntervention,
    seedColony,
    resetCurrent,
    replayCurrent,
  } = useLabStore(useShallow(selectLabActions));

  const colony = sim.colonies.find((c) => c.id === selected);
  const group =
    selected === null
      ? []
      : sim.individuals.filter(
          (i) => i.dead === null && i.colony === selected,
        );
  const focused =
    group.find((i) => i.action === 'divide') ??
    group.find((i) => i.action === 'signal') ??
    group[0];

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => stepCurrent(speed), 450);
    return () => clearInterval(timer);
  }, [running, speed, stepCurrent]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);

  const selectWorld = (next: typeof body) => {
    setBody(next);
    setSelected(1);
    setSeed(String(worlds[next].seed));
  };

  const addColony = () => {
    if (alive.length > 172 || colonies.length >= 12) {
      setToast('Достигнут лимит: 180 особей или 12 колоний');
      return;
    }
    const id = seedColony();
    if (id !== null) setSelected(id);
    setToast('Зародыш внесён. Внешний ресурс зарегистрирован.');
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
    setToast('Исходный эксперимент восстановлен');
  };

  const runReplay = () => {
    setRunning(false);
    const { equal } = replayCurrent();
    setToast(
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
    view,
    setView,
    modal,
    setModal,
    toast,
    setToast,
    cameraReset,
    bumpCameraReset: () => setCameraReset((n) => n + 1),
    expanded,
    toggleExpanded: () => setExpanded((v) => !v),
    seed,
    setSeed,
    dialogRef,
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

export type LaboratoryState = ReturnType<typeof useLaboratory>;
