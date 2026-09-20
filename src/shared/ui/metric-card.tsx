/** Metric card with label, value, and built-in sparkline. */

import type { HTMLAttributes, ReactNode, SVGProps } from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type SparklinePoint = {
  value: number;
};

interface MetricSparklineProps extends SVGProps<SVGSVGElement> {
  data: SparklinePoint[];
  color?: string;
  strokeWidth?: number;
}

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: ReactNode;
  value: ReactNode;
  unit?: string;
  description?: string;
  sparkData?: SparklinePoint[];
  sparkColor?: string;
}

// ═══════════════════════════════════════════
// HELPER COMPONENT
// ═══════════════════════════════════════════

/**
 * Inline 68×20 spark for the card footer. Deliberately not exported: the shared
 * full-width chart is `shared/ui/sparkline.tsx` with its own geometry.
 */
const MetricSparkline = ({
  data,
  color = '#c08162',
  strokeWidth = 1.5,
  className,
  ...props
}: MetricSparklineProps) => {
  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.value), 0.001);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 68;
      const y = 19 - (d.value / max) * 17;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 68 20"
      className={cn('w-[68px] h-[20px]', className)}
      aria-hidden="true"
      {...props}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        points={points}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const MetricCard = ({
  className,
  label,
  icon,
  value,
  unit,
  description,
  sparkData,
  sparkColor,
  ...props
}: MetricCardProps) => {
  return (
    <div
      data-slot="metric-card"
      className={cn(
        'bg-card border border-border rounded-[10px] px-[18px] py-[17px]',
        className,
      )}
      {...props}
    >
      {/* Top row */}
      <div className="flex justify-between items-start text-[10px] text-muted-foreground">
        <span>{label}</span>
        {icon && <span className="text-[#737976]">{icon}</span>}
      </div>

      {/* Value */}
      <div className="font-[500] text-[28px] tracking-[-1px] my-[15px] mb-[7px] text-foreground leading-none">
        {value}
        {unit && (
          <small className="text-[12px] text-muted-foreground tracking-normal ml-[5px]">
            {unit}
          </small>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-center text-[9px] text-[#a2b593]">
        {description && <span>{description}</span>}
        {sparkData && <MetricSparkline data={sparkData} color={sparkColor} />}
      </div>
    </div>
  );
};
