import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Input,
} from '@/shared/ui';

import type { Simulation } from '@/features/ecosystem/model';
import { MODEL_VERSION } from '@/features/ecosystem/world-info';
import type { LabModal } from '@/store';

type LabDialogProps = {
  modal: LabModal;
  sim: Simulation;
  seed: string;
  onSeedChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onReset: () => void;
  onReplay: () => void;
};

export const LabDialog = ({
  modal,
  sim,
  seed,
  onSeedChange,
  onClose,
  onDownload,
  onReset,
  onReplay,
}: LabDialogProps) => (
  <Dialog
    open={modal !== null}
    onClose={onClose}
    className="max-w-[620px] border-border bg-popover"
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
        <ol className="my-5 grid gap-[13px] pl-[18px] text-xs leading-[1.8] text-muted-foreground">
          <li>
            <b className="font-medium text-foreground">Выберите среду.</b>{' '}
            Реальные планеты имеют разные условия; коэффициенты жизни являются
            допущениями модели.
          </li>
          <li>
            <b className="font-medium text-foreground">
              Запустите эксперимент.
            </b>{' '}
            Светящиеся кристаллы — не люди, а небиологические особи. Их цвет
            обозначает колонию.
          </li>
          <li>
            <b className="font-medium text-foreground">Измените условия.</b>{' '}
            Импульс усиливает приток, возмущение повышает затраты, истощение
            временно отключает ресурс.
          </li>
          <li>
            <b className="font-medium text-foreground">Проверьте гипотезу.</b>{' '}
            Изучите причины решений, рождения, смерти и отделение дочерних
            колоний. Экспортируйте результаты.
          </li>
        </ol>
        <div className="rounded-md border border-xeno-green/25 bg-xeno-green/5 p-3.5 text-[10px] leading-[1.9] text-muted-foreground">
          Планета — реальная. Формы жизни — гипотетические. Модель{' '}
          {MODEL_VERSION}. Все решения и метрики рассчитывает серверный движок.
          Условия, действия и seed сохраняются в записи исследования.
          <span className="mt-1.5 block font-mono text-[8px] tracking-[0.5px]">
            XENOCHOICE / КОД МЫСЛИ 2026
          </span>
        </div>
      </>
    )}

    {modal === 'reset' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          НОВЫЙ ЗАПУСК
        </p>
        <DialogTitle>Начать эксперимент заново?</DialogTitle>
        <DialogDescription>
          Состояние текущего мира будет заменено двумя первичными колониями.
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
