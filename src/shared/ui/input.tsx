/** shadcn/ui Input wrapper — text field with optional label. */

import { type InputHTMLAttributes, useId } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
}

// ═══════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════

export const inputVariants = cva(
  [
    'w-full bg-field border border-field-border rounded-[6px] text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px]',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-colors',
  ].join(' '),
  {
    variants: {
      inputSize: {
        default: 'px-[11px] py-[11px] text-[11px]',
        sm: 'px-[6px] py-[6px] text-[10px]',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  },
);

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const Input = ({
  className,
  inputSize,
  label,
  id: externalId,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  if (label) {
    return (
      <div data-slot="input-field" className="flex flex-col gap-[10px]">
        <label htmlFor={id} className="text-[11px] text-foreground">
          {label}
        </label>
        <input
          id={id}
          data-slot="input"
          className={cn(inputVariants({ inputSize }), className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      id={id}
      data-slot="input"
      className={cn(inputVariants({ inputSize }), className)}
      {...props}
    />
  );
};
