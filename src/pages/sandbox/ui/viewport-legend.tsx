import { X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { VIEWPORT_LEGEND, type ViewportLegendKind } from '@/features/ecosystem';

const LegendSwatch = ({
  kind,
  color,
}: {
  kind: ViewportLegendKind;
  color: string;
}) => {
  if (kind === 'diamond') {
    return (
      <i
        className="mt-0.5 size-2 shrink-0 rotate-45 block border border-border/40"
        style={{ background: color }}
        aria-hidden
      />
    );
  }
  if (kind === 'line') {
    return (
      <span
        className="mt-1.5 h-px w-3.5 shrink-0"
        style={{ background: color }}
        aria-hidden
      />
    );
  }
  if (kind === 'packet') {
    return (
      <span
        className="relative mt-1.5 flex h-px w-4 shrink-0 items-center"
        aria-hidden
      >
        <span className="h-full w-full" style={{ background: color }} />
        <span
          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full"
          style={{ background: color }}
        />
      </span>
    );
  }
  return (
    <i
      className="mt-0.5 size-2 shrink-0 rounded-full border border-border/40"
      style={{ background: color }}
      aria-hidden
    />
  );
};

interface ViewportLegendPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Side panel inside the viewport — explains surface markers on the globe. */
export const ViewportLegendPanel = ({
  open,
  onClose,
}: ViewportLegendPanelProps) => {
  if (!open) return null;

  return (
    <aside
      aria-label="Легенда карты"
      className={cn(
        'absolute top-[88px] right-14 z-[11] w-[210px]',
        'rounded-[8px] border border-border bg-card/92 p-3 shadow-[0_8px_28px_rgb(0_0_0/0.35)] backdrop-blur-md',
        'max-mobile:right-3 max-mobile:left-3 max-mobile:top-auto max-mobile:bottom-[72px] max-mobile:w-auto',
      )}
    >
      <header className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[7px] tracking-[1.2px] text-muted-foreground">
            ПОВЕРХНОСТНЫЙ СЛОЙ
          </p>
          <h2 className="mt-0.5 text-[12px] font-medium text-foreground">
            Легенда карты
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Закрыть легенду"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </header>

      <ul className="grid gap-2">
        {VIEWPORT_LEGEND.map((item) => (
          <li key={item.key} className="flex items-start gap-2.5">
            <LegendSwatch kind={item.kind} color={item.color} />
            <div className="min-w-0">
              <div className="text-[10px] leading-tight text-foreground">
                {item.label}
              </div>
              <p className="mt-0.5 text-[9px] leading-[1.45] text-muted-foreground">
                {item.hint}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
