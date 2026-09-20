import { Button, Dialog, DialogDescription, DialogTitle } from '@/shared/ui';

/** First-run dialog — offers a short lab overview. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface LabFirstRunDialogProps {
  open: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

/** Blocking welcome before dense UI — first visit only. */
export const LabFirstRunDialog = ({
  open,
  onStartTour,
  onSkip,
}: LabFirstRunDialogProps) => (
  <Dialog
    open={open}
    onClose={onSkip}
    className="max-w-[440px] border-border bg-popover"
  >
    <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
      ПЕРВЫЙ ВХОД
    </p>
    <DialogTitle className="mt-2">Лаборатория XenoChoice</DialogTitle>
    <DialogDescription className="mt-2">
      Здесь много панелей сразу. Короткий обзор покажет среду, время,
      воздействия и колонии — около минуты. Можно пропустить и открыть обучение
      позже в боковой панели.
    </DialogDescription>
    <div className="mt-5 flex flex-wrap justify-end gap-2.5">
      <Button type="button" variant="outline" size="sm" onClick={onSkip}>
        Пропустить
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        autoFocus
        onClick={onStartTour}
      >
        Начать обзор
      </Button>
    </div>
  </Dialog>
);
