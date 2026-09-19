import type { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

// ═══════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[1.5px] uppercase rounded px-[7px] py-[5px] leading-none select-none',
  {
    variants: {
      variant: {
        /** Default bordered tag — matches .tag */
        default: 'border border-[#394131] bg-[#252a23] text-[#b3bbac]',
        /** Accent / active state — orange */
        accent: 'border border-primary/40 bg-primary/10 text-primary',
        /** Green / healthy */
        green:
          'border border-[var(--xeno-green)]/30 bg-[var(--xeno-green)]/10 text-[var(--xeno-green)]',
        /** Subtle outline only */
        outline: 'border border-border text-muted-foreground bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { Badge, badgeVariants };
