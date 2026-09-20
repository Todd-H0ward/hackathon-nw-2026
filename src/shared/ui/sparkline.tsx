/** SVG sparkline — mini metric trend chart. */

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface SparklineProps {
  values: number[];
  color?: string;
  className?: string;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const Sparkline = ({
  values,
  color = 'var(--xeno-green)',
  className,
}: SparklineProps) => {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);

  return (
    <svg
      viewBox="0 0 240 54"
      preserveAspectRatio="none"
      role="img"
      aria-label="Динамика показателя"
      className={cn(className)}
    >
      <path
        d={`M ${values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 240},${49 - ((v - min) / (max - min)) * 43}`).join(' L ')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
