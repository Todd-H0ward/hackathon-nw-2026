import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Input,
} from '@/shared/ui';

import type { LabModal } from '@/store';

export type LabDialogStats = {
  seed: number;
  tick: number;
  births: number;
  deaths: number;
  splits: number;
  interventionCount: number;
};

interface LabDialogProps {
  modal: LabModal;
  stats: LabDialogStats;
  seed: string;
  onSeedChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onReset: () => void;
  onReplay: () => void;
  onRestart?: () => void;
  onAddColony?: () => void;
  onOpenDemo?: () => void;
}

export const LabDialog = ({
  modal,
  stats,
  seed,
  onSeedChange,
  onClose,
  onDownload,
  onReset,
  onReplay,
  onRestart,
  onAddColony,
  onOpenDemo,
}: LabDialogProps) => (
  <Dialog
    open={modal !== null}
    onClose={onClose}
    className="max-w-[620px] border-border bg-popover"
  >
    <DialogClose aria-label="Закрыть">×</DialogClose>

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
          Будут воспроизведены seed {stats.seed}, {stats.tick} тактов и{' '}
          {stats.interventionCount} вмешательств.
        </DialogDescription>
        <div className="flex justify-end gap-2.5 mt-5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onReplay}>
            Воспроизвести и сравнить
          </Button>
        </div>
      </>
    )}

    {modal === 'extinct' && (
      <>
        <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          КОНЕЦ ПОПУЛЯЦИИ
        </p>
        <DialogTitle>Все особи погибли</DialogTitle>
        <DialogDescription>
          На такте {stats.tick} живых особей не осталось. За прогон: рождений{' '}
          {stats.births}, угасших {stats.deaths}, делений колоний {stats.splits}
          . Seed {stats.seed}. Можно начать заново или создать новую колонию в
          том же эксперименте.
        </DialogDescription>
        <div className="mt-4 grid grid-cols-3 gap-2 max-mobile:grid-cols-1">
          <div className="rounded-md border border-border px-3 py-2">
            <div className="font-mono text-[8px] tracking-[1px] text-muted-foreground">
              ТАКТ
            </div>
            <div className="mt-1 font-mono text-[16px] tabular-nums">
              {stats.tick}
            </div>
          </div>
          <div className="rounded-md border border-border px-3 py-2">
            <div className="font-mono text-[8px] tracking-[1px] text-muted-foreground">
              РОЖДЕНИЙ
            </div>
            <div className="mt-1 font-mono text-[16px] tabular-nums">
              {stats.births}
            </div>
          </div>
          <div className="rounded-md border border-border px-3 py-2">
            <div className="font-mono text-[8px] tracking-[1px] text-muted-foreground">
              УГАСШИХ
            </div>
            <div className="mt-1 font-mono text-[16px] tabular-nums">
              {stats.deaths}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Закрыть
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            Экспортировать
          </Button>
          {onOpenDemo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenDemo}
            >
              Демо-режим
            </Button>
          ) : null}
          {onAddColony ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddColony}
            >
              Создать колонию
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onRestart?.()}
          >
            Начать заново
          </Button>
        </div>
      </>
    )}
  </Dialog>
);
