import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[7px] border text-[13px] font-medium whitespace-nowrap transition-all outline-none select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Default — transparent with border, matches base .button */
        default:
          'border-border bg-transparent text-foreground hover:bg-secondary',
        /** Primary — orange accent, matches .primary */
        primary:
          'border-primary bg-primary text-primary-foreground font-bold hover:bg-primary/85',
        /** Ghost — no border, subtle hover */
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
        /** Ghost with accent text on hover — nav links */
        'ghost-accent':
          'border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-primary',
        /** Play button — small orange square-ish */
        play: 'border-0 bg-primary text-[#191919] font-bold hover:bg-primary/85',
        /** Destructive */
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20',
        /** Outline */
        outline:
          'border-border bg-transparent hover:bg-secondary hover:text-foreground',
        /** Link-style */
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[39px] gap-1.5 px-[14px] py-[10px]',
        sm: 'h-[31px] gap-1 px-[10px] py-[7px] text-[12px]',
        xs: 'h-6 gap-1 px-2 text-[10px] rounded-[4px]',
        lg: 'h-[44px] gap-2 px-5',
        icon: 'size-[31px] rounded-[7px] p-0',
        'icon-sm': 'size-6 rounded-[4px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { Button, buttonVariants };
