import { cn } from '@/shared/lib/utils';

type SparklineProps = {
  values: number[];
  color?: string;
  className?: string;
};

export const Sparkline = ({
  values,
  color = '#8bd6c2',
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
