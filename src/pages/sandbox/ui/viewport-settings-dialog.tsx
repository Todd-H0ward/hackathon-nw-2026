import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  Slider,
} from '@/shared/ui';

import {
  PARTICLE_BRIGHTNESS_MAX,
  PARTICLE_BRIGHTNESS_MIN,
} from './viewport-settings-storage';

interface ViewportSettingsDialogProps {
  open: boolean;
  brightnessPercent: number;
  onBrightnessChange: (percent: number) => void;
  onClose: () => void;
  onReset?: () => void;
}

/** Lab viewport look settings — particle brightness for the spark globe. */
export const ViewportSettingsDialog = ({
  open,
  brightnessPercent,
  onBrightnessChange,
  onClose,
  onReset,
}: ViewportSettingsDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    className="max-w-[420px] border-border bg-popover"
  >
    <DialogClose aria-label="Закрыть">×</DialogClose>

    <p className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
      ВИЗУАЛИЗАЦИЯ
    </p>
    <DialogTitle className="text-[18px]">Настройки сцены</DialogTitle>
    <DialogDescription className="my-3 text-[12px] leading-[1.6]">
      Яркость точечного облака планеты. Не влияет на симуляцию — только на
      отрисовку во вьюпорте.
    </DialogDescription>

    <Slider
      label="Яркость частиц"
      outputValue={`${brightnessPercent}%`}
      min={PARTICLE_BRIGHTNESS_MIN}
      max={PARTICLE_BRIGHTNESS_MAX}
      step={5}
      value={brightnessPercent}
      onChange={(e) => onBrightnessChange(Math.round(+e.target.value))}
      minLabel="Тускло"
      maxLabel="Ярко"
    />

    <div className="mt-5 flex justify-end gap-2.5">
      {onReset ? (
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Сбросить
        </Button>
      ) : null}
      <Button type="button" variant="primary" size="sm" onClick={onClose}>
        Готово
      </Button>
    </div>
  </Dialog>
);
