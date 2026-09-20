/** shadcn/ui Slider wrapper — range input with label and value display. */

import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  /** Rendered value next to the label (e.g. "72 %") */
  outputValue?: ReactNode;
  minLabel?: string;
  maxLabel?: string;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const Slider = ({
  className,
  label,
  outputValue,
  minLabel,
  maxLabel,
  id: externalId,
  ...props
}: SliderProps) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div data-slot="slider" className="flex flex-col">
      {(label || outputValue !== undefined) && (
        <div className="flex justify-between items-center text-[11px] mb-[10px]">
          <label htmlFor={id} className="text-foreground">
            {label}
          </label>
          {outputValue !== undefined && (
            <output htmlFor={id} className="font-mono text-[#c5c7c1]">
              {outputValue}
            </output>
          )}
        </div>
      )}
      <input
        type="range"
        id={id}
        data-slot="slider-input"
        className={cn(
          'w-full h-[3px] accent-primary block my-4 cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px]',
          className,
        )}
        {...props}
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between font-mono text-[9px] text-[#65696b]">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
