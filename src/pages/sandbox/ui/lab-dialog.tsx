import { ArrowUpRight } from 'lucide-react';

import type { LabModal } from '@/contexts/lab';

import { cn } from '@/shared/lib/utils';
import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Input,
} from '@/shared/ui';
import type { GlobeBodyId } from '@/shared/ui/globe';

import {
  MODEL_VERSION,
  type Simulation,
  WORLDS,
} from '@/features/ecosystem/model';

import { BODY_IDS } from '../lib';

type LabDialogProps = {
  modal: LabModal;
  sim: Simulation;
  seed: string;
  onSeedChange: (value: string) => void;
  onClose: () => void;
  onSelectWorld: (id: GlobeBodyId) => void;
  onDownload: () => void;
  onReset: () => void;
  onReplay: () => void;
};

const worldThumb: Record<GlobeBodyId, string> = {
  earth: "bg-[url('/images/globe/earth_color.jpg')] bg-[position:35%_50%]",
  mars: "bg-[url('/images/globe/mars_color.jpg')]",
  venus: "bg-[url('/images/globe/venus_color.jpg')]",
};

export const LabDialog = ({
  modal,
  sim,
  seed,
  onSeedChange,
  onClose,
  onSelectWorld,
  onDownload,
  onReset,
  onReplay,
}: LabDialogProps) => (
  <Dialog
    open={modal !== null}
    onClose={onClose}
    className="max-w-[620px] bg-[#111b23] border-[#3c514f]"
  >
    <DialogClose aria-label="Закрыть">×</DialogClose>

    {modal === 'guide' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          ИНСТРУМЕНТ ИССЛЕДОВАТЕЛЯ
        </p>
        <DialogTitle className="text-[28px] font-normal tracking-[-0.8px] leading-[1.3]">
          Не управляйте жизнью.
          <br />
          Создавайте условия.
        </DialogTitle>
        <DialogDescription>
          Вы — исследователь, а не участник голосования. Внесите первичные
          структуры, измените доступный ресурс или вызовите возмущение. Затем
          наблюдайте, какие решения помогают сообществам сохраняться.
        </DialogDescription>
        <ol className="pl-[18px] text-[#8fa6af] leading-[1.8] text-xs grid gap-[13px] my-5">
          <li>
            <b className="text-[#c0d7cc] font-medium">Выберите среду.</b>{' '}
            Реальные планеты имеют разные условия; коэффициенты жизни являются
            допущениями модели.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Запустите эксперимент.</b>{' '}
            Светящиеся кристаллы — не люди, а небиологические особи. Их цвет
            обозначает колонию.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Измените условия.</b>{' '}
            Импульс усиливает приток, возмущение повышает затраты, истощение
            временно отключает ресурс.
          </li>
          <li>
            <b className="text-[#c0d7cc] font-medium">Проверьте гипотезу.</b>{' '}
            Изучите причины решений, рождения, смерти и отделение дочерних
            колоний. Экспортируйте результаты.
          </li>
        </ol>
        <div className="bg-[#1c2b2c] border border-[#324a45] p-3.5 rounded-md text-[10px] text-[#849f95] leading-[1.9]">
          Модель {MODEL_VERSION}. В браузере работает отдельный демонстрационный
          движок; подключение к серверной научной модели ещё не выполнено.
        </div>
      </>
    )}

    {modal === 'atlas' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          ТРИ СРЕДЫ · ТРИ ЭКСПЕРИМЕНТА
        </p>
        <DialogTitle>Атлас миров</DialogTitle>
        {BODY_IDS.map((id) => (
          <button
            type="button"
            className="flex w-full items-center gap-[17px] bg-[#16222a] border border-[#2e4149] rounded-[7px] p-[18px] mt-3 text-left"
            key={id}
            onClick={() => {
              onSelectWorld(id);
              onClose();
            }}
          >
            <span
              className={cn(
                'size-[45px] shrink-0 block rounded-full bg-cover shadow-[inset_-10px_-3px_10px_#000c,0_0_13px_#94cfce15]',
                worldThumb[id],
              )}
            />
            <div className="flex-1">
              <h3 className="text-[15px] font-[450] m-0 mb-1.5 text-[#d4e0da]">
                {WORLDS[id].name}{' '}
                <small className="font-mono text-[9px] text-[#6b9291] ml-[9px]">
                  {WORLDS[id].temperature} °C / {WORLDS[id].gravity} м/с²
                </small>
              </h3>
              <p className="text-[10px] text-[#95a9b4] leading-[1.9] m-0">
                {WORLDS[id].description}
              </p>
            </div>
            <ArrowUpRight size={18} className="text-[#a7c7b7] shrink-0" />
          </button>
        ))}
      </>
    )}

    {modal === 'reset' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          НОВЫЙ ЗАПУСК
        </p>
        <DialogTitle>Начать эксперимент заново?</DialogTitle>
        <DialogDescription>
          Состояние текущего мира будет заменено тремя первичными колониями.
          Другие миры сохранятся.
        </DialogDescription>
        <Input
          label="Seed"
          type="number"
          min={1}
          max={999999}
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
          className="mt-4 max-w-[180px]"
        />
        <div className="flex justify-end gap-2.5 mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            Скачать текущий
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onReset}>
            Начать заново
          </Button>
        </div>
      </>
    )}

    {modal === 'replay' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          ВОСПРОИЗВОДИМОСТЬ
        </p>
        <DialogTitle>Повторить тот же эксперимент</DialogTitle>
        <DialogDescription>
          Будут воспроизведены seed {sim.seed}, {sim.tick} тактов и{' '}
          {sim.interventions.length} вмешательств.
        </DialogDescription>
        <Button type="button" variant="primary" size="sm" onClick={onReplay}>
          Воспроизвести и сравнить
        </Button>
      </>
    )}
  </Dialog>
);
