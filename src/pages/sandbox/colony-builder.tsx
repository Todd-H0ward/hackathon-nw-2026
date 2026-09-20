import { useState } from 'react';

import { Button, Input, Select } from '@/shared/ui';

import { numericId } from '@/features/ecosystem';
import { useLabStore } from '@/store/lab/store';

import { performIntervention } from './research-api';

/** Floating colony creation form: coordinates, parameters, and strategy. */

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const ColonyBuilder = () => {
  const draft = useLabStore((s) => s.colonyDraft);
  const body = useLabStore((s) => s.body);
  const [name, setName] = useState('Новая колония');
  const [count, setCount] = useState(6);
  const [energy, setEnergy] = useState(35);
  const [biomass, setBiomass] = useState(5);
  const [spread, setSpread] = useState(2);
  const [power, setPower] = useState(2);
  const [strategy, setStrategy] = useState('balanced');
  const [color, setColor] = useState('#81d6b9');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!draft) return null;
  const create = async () => {
    setBusy(true);
    setError('');
    try {
      const weights =
        strategy === 'growth'
          ? [0.2, 0.2, 0.1, 0.4, 0.1]
          : strategy === 'cooperation'
            ? [0.2, 0.2, 0.4, 0.1, 0.1]
            : [0.3, 0.25, 0.2, 0.15, 0.1];
      const existing = new Set(
        useLabStore.getState().sims[body].snapshot?.colonies.map((c) => c.id),
      );
      const snapshot = await performIntervention({
        type: 'add_inoculum',
        targetId: body,
        value: energy,
        name,
        color,
        params: { ...draft, count, biomass, spread, power },
        genome: {
          wE: weights[0],
          wD: weights[1],
          wC: weights[2],
          wR: weights[3],
          wCost: weights[4],
          lambda: 0.8,
          hThreshold: 0.005,
        },
      });
      const trimmedName = name.trim();
      const colony = snapshot.colonies.find(
        (c) =>
          !existing.has(c.id) &&
          (c.name === trimmedName || c.name === name) &&
          !c.parentColonyId,
      );
      if (!colony)
        throw new Error(
          'Колония не создана: проверьте лимиты популяции и сообществ',
        );
      useLabStore.getState().setColonyDraft(null);
      useLabStore.getState().setSelected(numericId(colony.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать колонию');
    } finally {
      setBusy(false);
    }
  };
  return (
    <aside
      className="fixed bottom-4 right-4 z-40 max-h-[85dvh] w-[340px] max-w-[94vw] overflow-auto rounded-xl border border-primary/40 bg-card p-4 shadow-2xl"
      aria-label="Создание колонии"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-base font-medium">Создать колонию</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => useLabStore.getState().setColonyDraft(null)}
          aria-label="Закрыть создание колонии"
        >
          ×
        </Button>
      </div>
      <p className="my-3 text-xs text-muted-foreground">
        Перетащите зародыш на планету или задайте координаты. Цветная точка
        показывает место размещения.
      </p>
      <Button
        type="button"
        variant="outline"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', 'colony');
          e.dataTransfer.effectAllowed = 'copy';
        }}
        className="my-3 w-full cursor-grab border-dashed border-primary py-3 text-center"
      >
        ✦ Перетащить колонию на планету
      </Button>
      <div className="my-2">
        <Input
          label="Название"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: 'Широта',
            value: draft.lat,
            min: -89,
            max: 89,
            set: (v: number) =>
              useLabStore.getState().setColonyDraft({ ...draft, lat: v }),
          },
          {
            label: 'Долгота',
            value: draft.lng,
            min: -180,
            max: 180,
            set: (v: number) =>
              useLabStore.getState().setColonyDraft({ ...draft, lng: v }),
          },
          { label: 'Особей', value: count, min: 1, max: 24, set: setCount },
          {
            label: 'Энергия / особь',
            value: energy,
            min: 1,
            max: 100,
            set: setEnergy,
          },
          {
            label: 'Структура / особь',
            value: biomass,
            min: 1,
            max: 20,
            set: setBiomass,
          },
          {
            label: 'Радиус, °',
            value: spread,
            min: 0.1,
            max: 15,
            set: setSpread,
          },
          {
            label: 'Мощность связей',
            value: power,
            min: 0.1,
            max: 20,
            set: setPower,
          },
        ].map((f) => (
          <Input
            key={f.label}
            label={f.label}
            type="number"
            inputSize="sm"
            min={f.min}
            max={f.max}
            step={f.label === 'Особей' ? 1 : 0.1}
            value={Number(f.value.toFixed(2))}
            onChange={(e) =>
              f.set(Math.max(f.min, Math.min(f.max, Number(e.target.value))))
            }
          />
        ))}
        <Input
          label="Цвет"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          inputSize="sm"
          className="h-[31px] p-1 cursor-pointer"
        />
      </div>
      <div className="my-3">
        <Select
          label="Наследуемая стратегия"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        >
          <option value="balanced">Баланс и сохранение</option>
          <option value="growth">Рост и размножение</option>
          <option value="cooperation">Помощь соседям</option>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        Ресурс определяет запас прочности, структура — готовность к делению,
        расстояния и мощность связей — передачу энергии. Стратегия меняет оценки
        решений.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-destructive">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="primary"
        disabled={busy || !name.trim()}
        onClick={() => void create()}
        className="mt-3 w-full"
      >
        {busy ? 'Создаём…' : 'Создать в выбранном месте'}
      </Button>
    </aside>
  );
};
