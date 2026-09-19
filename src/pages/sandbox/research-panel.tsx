import { useEffect, useRef, useState } from 'react';

import {
  xenoApiEndpoints as api,
  downloadExperimentExport,
  type ExperimentMode,
} from '@/shared/api/xenochoice';

import { useLabStore } from '@/store/lab/store';

import { applySnapshot, resetLabRuntime } from './lab-runtime';
import { performIntervention } from './research-api';
import { ResearchVoice } from './research-voice';

export const ResearchPanel = () => {
  const sim = useLabStore((s) => s.sims[s.body]);
  const id = useLabStore((s) => s.experimentIds[s.body]);
  const recording = useLabStore((s) => s.recording);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const serial = useRef(0);
  const file = useRef<HTMLInputElement>(null);
  const snap = sim.snapshot;
  const seek = async (tick: number) => {
    const rec = useLabStore.getState().recording;
    if (!rec) return;
    const ticket = ++serial.current;
    try {
      const snapshot = await api.previewExperiment(rec.id, tick);
      if (
        ticket !== serial.current ||
        useLabStore.getState().recording?.id !== rec.id
      )
        return;
      applySnapshot(snapshot.world.id, snapshot);
      useLabStore
        .getState()
        .setRecording({ ...(useLabStore.getState().recording ?? rec), tick });
    } catch (e) {
      setError(String(e));
      useLabStore.getState().setRecording({ ...rec, playing: false });
    }
  };
  const seekRef = useRef(seek);
  seekRef.current = seek;
  useEffect(() => {
    if (!recording?.playing) return;
    const timer = setTimeout(() => {
      if (recording.tick >= recording.maxTick)
        useLabStore.getState().setRecording({ ...recording, playing: false });
      else
        void seekRef.current(Math.min(recording.maxTick, recording.tick + 5));
    }, 350);
    return () => clearTimeout(timer);
  }, [recording]);
  const startRecording = async (imported?: unknown) => {
    setBusy(true);
    setError('');
    try {
      if (id) await api.postCommand(id, { command: 'pause' });
      const exp = imported
        ? await api.importExperiment(imported)
        : id
          ? await api.getExperiment(id)
          : null;
      if (!exp?.latestSnapshot) throw new Error('Сначала создайте эксперимент');
      useLabStore.getState().setRecording({
        id: exp.id,
        maxTick: exp.latestSnapshot.tick,
        tick: 0,
        playing: false,
      });
      useLabStore.getState().setBody(exp.worldId);
      resetLabRuntime(exp.worldId, exp.seed);
      setOpen(true);
      await seek(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка импорта');
    } finally {
      setBusy(false);
    }
  };
  const exit = async () => {
    serial.current++;
    useLabStore.getState().setRecording(null);
    const current = useLabStore.getState();
    const liveId = current.experimentIds[current.body];
    if (liveId) {
      resetLabRuntime(current.body, sim.seed);
      applySnapshot(current.body, await api.getExperimentState(liveId));
    }
  };
  const command = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка запроса');
    } finally {
      setBusy(false);
    }
  };
  const events = [
    ...(snap?.interventions ?? [])
      .filter((i) => i.tick <= sim.tick)
      .map((i) => ({
        tick: i.tick,
        text: `${i.type} · ${i.targetId} · ${i.value}`,
      })),
    ...(snap?.individuals ?? [])
      .filter((i) => i.parentId)
      .map((i) => ({
        tick: i.birthTick,
        text: `Рождение ${i.id}, родитель ${i.parentId}`,
      })),
    ...(snap?.individuals ?? [])
      .filter((i) => !i.alive)
      .map((i) => ({
        tick: (i as typeof i & { deathTick?: number }).deathTick ?? sim.tick,
        text: `Гибель ${i.id}`,
      })),
  ].sort((a, b) => a.tick - b.tick);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2 text-xs">
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={() => setOpen(!open)}
        >
          Исследование и журнал
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1"
          disabled={busy || !id}
          onClick={() => void startRecording()}
        >
          Смотреть запись
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1"
          disabled={busy}
          onClick={() => file.current?.click()}
        >
          Импорт JSON
        </button>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label="Импорт исследования"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            if (f.size > 20 * 1024 * 1024) {
              setError('Файл больше 20 МБ');
              return;
            }
            void f
              .text()
              .then((text) => startRecording(JSON.parse(text)))
              .catch(() => setError('Некорректный JSON'));
          }}
        />
        <button
          type="button"
          className="rounded border px-2 py-1"
          disabled={!id || busy}
          onClick={() =>
            void command(() =>
              downloadExperimentExport(recording?.id ?? id ?? '', 'csv'),
            )
          }
        >
          CSV
        </button>
        <label className="flex items-center gap-1">
          Режим
          <select
            aria-label="Режим решений"
            className="rounded border p-1"
            disabled={!!recording || busy}
            value={snap?.mode ?? 'evolutionary'}
            onChange={(e) =>
              void command(() =>
                performIntervention({
                  type: 'set_mode',
                  targetId: e.target.value as ExperimentMode,
                  value: 0,
                }),
              )
            }
          >
            <option value="reactive">Реакция</option>
            <option value="adaptive">Адаптация</option>
            <option value="evolutionary">Эволюция</option>
          </select>
        </label>
        <ResearchVoice />
        {recording && (
          <div className="flex w-full items-center gap-3 border-t pt-2">
            <b>ЗАПИСЬ</b>
            <button
              type="button"
              onClick={() =>
                useLabStore
                  .getState()
                  .setRecording({ ...recording, playing: !recording.playing })
              }
            >
              {recording.playing ? 'Пауза' : '▶ Воспроизвести'}
            </button>
            <input
              aria-label="Такт записи"
              className="min-w-20 flex-1"
              type="range"
              min={0}
              max={recording.maxTick}
              value={recording.tick}
              onChange={(e) => {
                useLabStore
                  .getState()
                  .setRecording({ ...recording, playing: false });
                void seek(Number(e.target.value));
              }}
            />
            <span>
              {recording.tick} / {recording.maxTick}
            </span>
            <button type="button" onClick={() => void command(exit)}>
              К живому опыту
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="w-full text-destructive">
            {error}
          </p>
        )}
      </div>
      {open && (
        <aside
          className="absolute right-3 top-24 z-30 max-h-[72vh] w-96 max-w-[95vw] overflow-auto rounded-xl border border-border bg-card p-4 shadow-xl"
          aria-label="Журнал исследования"
        >
          <div className="flex justify-between">
            <h2 className="text-base">Исследование · такт {sim.tick}</h2>
            <button
              type="button"
              aria-label="Закрыть журнал"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="my-2 text-xs text-muted-foreground">
            Модель 3.0 · seed {sim.seed}. Запись воспроизводится по исходным
            условиям и точному журналу воздействий. Предыдущие форматы
            отклоняются, чтобы не подменять результаты.
          </p>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <dt>Полезная мощность</dt>
            <dd>{snap?.metrics.usefulPower.toFixed(3)} EU/TU</dd>
            <dt>Энергетическая невязка</dt>
            <dd>{snap?.metrics.balanceResidual.toExponential(2)}</dd>
            <dt>Задержка доставки</dt>
            <dd>
              {snap?.metrics.deliveryMeasured
                ? snap.metrics.deliveryLatency.toFixed(2)
                : 'Нет доставок'}
            </dd>
            <dt>Благо сообщества</dt>
            <dd>{snap?.metrics.meanWelfare.toFixed(1)}%</dd>
          </dl>
          <p className="my-2 text-xs text-muted-foreground">
            Ответ: первое изменение действия после воздействия, наблюдаемая
            задержка. Для причинного вывода сравните с контрольным опытом на том
            же seed.
          </p>
          <h3 className="mb-2 mt-4">Сеть связей</h3>
          <p className="text-xs text-muted-foreground">
            Отключите связь или измените её свойства. Все изменения входят в
            запись.
          </p>
          <div className="my-2 max-h-40 overflow-auto">
            {snap?.channels
              .filter((_, i) => i % 2 === 0)
              .map((ch) => (
                <div key={ch.id} className="my-2 rounded border p-2 text-xs">
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      disabled={!!recording || busy}
                      checked={ch.enabled}
                      onChange={(e) =>
                        void command(() =>
                          performIntervention({
                            type: 'set_channel',
                            targetId: ch.id,
                            value: e.target.checked ? 1 : 0,
                          }),
                        )
                      }
                    />
                    {ch.fromId} → {ch.toId}
                  </label>
                  <div className="mt-1 flex gap-2">
                    {(['power', 'loss', 'delay'] as const).map((key) => (
                      <label key={key}>
                        {key === 'power'
                          ? 'EU/TU'
                          : key === 'loss'
                            ? 'Потери'
                            : 'Задержка'}
                        <input
                          aria-label={`${ch.id} ${key}`}
                          type="number"
                          className="block w-20 rounded border"
                          disabled={!!recording || busy}
                          min={key === 'delay' ? 1 : 0}
                          max={
                            key === 'loss' ? 0.9 : key === 'delay' ? 100 : 20
                          }
                          step={key === 'delay' ? 1 : 0.1}
                          defaultValue={
                            key === 'power'
                              ? ch.maxPower
                              : key === 'loss'
                                ? ch.loss
                                : ch.delayTicks
                          }
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (Number.isFinite(value))
                              void command(() =>
                                performIntervention({
                                  type: 'set_channel',
                                  targetId: ch.id,
                                  value: ch.enabled ? 1 : 0,
                                  params: { [key]: value },
                                }),
                              );
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <h3 className="mt-4">События · {events.length}</h3>
          <ol className="mt-2 grid max-h-60 gap-1 overflow-auto text-xs">
            {events.length ? (
              events.map((event) => (
                <li
                  key={`${event.tick}-${event.text}`}
                  className="rounded bg-secondary p-2"
                >
                  <button
                    type="button"
                    disabled={!recording}
                    onClick={() => void seek(event.tick)}
                  >
                    Такт {event.tick} · {event.text}
                  </button>
                </li>
              ))
            ) : (
              <li>Пока нет событий. Измените условия или создайте колонию.</li>
            )}
          </ol>
        </aside>
      )}
    </>
  );
};
