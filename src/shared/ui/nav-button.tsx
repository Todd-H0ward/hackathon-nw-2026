import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface NavButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof navButtonVariants> {
  icon?: ReactNode;
  count?: number | string;
}

// ═══════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════

const navButtonVariants = cva(
  'w-full flex items-center gap-0 text-left border-0 rounded-[7px] px-[13px] py-[13px] text-[13px] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      active: {
        true: 'text-primary bg-[#2b211d]',
        false: 'text-[#999c9e] bg-transparent hover:bg-secondary hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

function NavButton({
  className,
  active,
  icon,
  count,
  children,
  ...props
}: NavButtonProps) {
  return (
    <button
      data-slot="nav-button"
      type="button"
      className={cn(navButtonVariants({ active }), className)}
      {...props}
    >
      {icon && (
        <span className="inline-block w-[29px] text-[17px] leading-none shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {count !== undefined && (
        <span className="font-mono text-[10px] border border-[#45403c] px-[5px] py-[3px] rounded-[4px] ml-1">
          {count}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { NavButton, navButtonVariants };
