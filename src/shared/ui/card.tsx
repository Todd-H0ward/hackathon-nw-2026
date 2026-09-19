import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
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
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
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
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-[12px] font-medium text-foreground', className)}
      {...props}
    />
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div
      data-slot="card-content"
      className={cn('px-5 pb-5', className)}
      {...props}
    />
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = ({ className, ...props }: CardFooterProps) => {
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
};
