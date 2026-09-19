import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = ({ className, label, id, ...props }: SelectProps) => {
  return (
    <div data-slot="select-wrapper" className="flex flex-col gap-[10px]">
      {label && (
        <label htmlFor={id} className="text-[11px] text-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        data-slot="select"
        className={cn(
          'w-full bg-field border border-field-border rounded-[6px] px-[11px] py-[11px] text-[11px] text-foreground',
          'appearance-none cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px]',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
};
