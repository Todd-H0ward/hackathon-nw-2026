import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

function Switch({ className, label, description, id: externalId, ...props }: SwitchProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <label
      htmlFor={id}
      data-slot="switch"
      className="flex justify-between items-center gap-3 cursor-pointer select-none"
    >
      <div className="flex-1 text-[11px] text-foreground">
        {label}
        {description && (
          <span className="block text-[9px] text-muted-foreground mt-1.5">
            {description}
          </span>
        )}
      </div>
      <input
        type="checkbox"
        id={id}
        className={cn(
          'accent-primary w-[30px] h-[17px] cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px]',
          className,
        )}
        {...props}
      />
    </label>
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { Switch };
