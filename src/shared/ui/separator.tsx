import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <hr
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        'border-none bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full my-5' : 'w-px h-full mx-5',
        className,
      )}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { Separator };
