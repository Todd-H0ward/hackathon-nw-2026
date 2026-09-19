import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

/* ── Card ── */
function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card border border-border rounded-[10px] overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

/* ── CardHeader ── */
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex items-center justify-between px-5 py-[18px]',
        className,
      )}
      {...props}
    />
  );
}

/* ── CardTitle ── */
function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-[12px] font-medium text-foreground', className)}
      {...props}
    />
  );
}

/* ── CardContent ── */
function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-5 pb-5', className)}
      {...props}
    />
  );
}

/* ── CardFooter ── */
function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center justify-between px-5 py-[14px] border-t border-border',
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
