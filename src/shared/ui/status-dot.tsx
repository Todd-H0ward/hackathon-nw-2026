import type { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

interface StatusDotProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {}

export const statusDotVariants = cva('inline-block rounded-full shrink-0', {
  variants: {
    variant: {
      /** Green — online / active colony */
      green: 'bg-[var(--xeno-green)]',
      /** Orange — accent / alert */
      accent: 'bg-primary',
      /** Muted — offline */
      muted: 'bg-muted-foreground',
    },
    size: {
      sm: 'size-[5px]',
      md: 'size-[6px]',
      lg: 'size-2',
    },
  },
  defaultVariants: {
    variant: 'green',
    size: 'md',
  },
});

export const StatusDot = ({
  className,
  variant,
  size,
  ...props
}: StatusDotProps) => {
  return (
    <span
      data-slot="status-dot"
      className={cn(statusDotVariants({ variant, size }), className)}
      aria-hidden="true"
      {...props}
    />
  );
};
