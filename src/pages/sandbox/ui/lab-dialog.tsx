import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Input,
} from '@/shared/ui';

import type { Simulation } from '@/features/ecosystem';
import type { LabModal } from '@/store';

interface LabDialogProps {
  modal: LabModal;
  sim: Simulation;
  seed: string;
  onSeedChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onReset: () => void;
  onReplay: () => void;
}

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
