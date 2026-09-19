import { cn } from '@/shared/lib/utils';

interface OrbitalSpinnerProps {
  className?: string;
  size?: number;
}

export const OrbitalSpinner = ({
  className,
  size = 112,
}: OrbitalSpinnerProps) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Мягкое глубинное акцентное свечение в центре */}
      <div className="absolute size-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

      {/* SVG астрономический орбитальный спиннер */}
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label="Загрузка"
        className="size-full overflow-visible"
      >
        <title>Орбитальный индикатор загрузки</title>

        <defs>
          {/* Градиент основной вращающейся орбиты */}
          <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          {/* Градиент вторичной обратной орбиты */}
          <linearGradient
            id="orbit-grad-reverse"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Фоновый тонкий статический координатный контур */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Четыре навигационные отсечки на внешней шкале (0°, 90°, 180°, 270°) */}
        <line
          x1="60"
          y1="9"
          x2="60"
          y2="14"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />
        <line
          x1="111"
          y1="60"
          x2="106"
          y2="60"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />
        <line
          x1="60"
          y1="111"
          x2="60"
          y2="106"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />
        <line
          x1="9"
          y1="60"
          x2="14"
          y2="60"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />

        {/* 2. Внешняя вращающаяся орбитальная дуга с планетой-спутником */}
        <g className="origin-center animate-[spin_2.8s_linear_infinite]">
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="url(#orbit-grad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="160 142"
          />
          {/* Спутник на конце дуги */}
          <circle
            cx="60"
            cy="12"
            r="2.5"
            className="fill-primary drop-shadow-[0_0_6px_var(--primary)]"
          />
        </g>

        {/* 3. Средняя обратная пунктирная орбита */}
        <g className="origin-center animate-[spin_4.2s_linear_infinite_reverse]">
          <circle
            cx="60"
            cy="60"
            r="35"
            fill="none"
            stroke="url(#orbit-grad-reverse)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="4 8 16 8"
          />
          {/* Малая точка на средней орбите */}
          <circle cx="25" cy="60" r="1.5" fill="rgba(255, 255, 255, 0.7)" />
        </g>

        {/* 4. Внутренняя быстрая дуга */}
        <g className="origin-center animate-[spin_1.6s_linear_infinite]">
          <circle
            cx="60"
            cy="60"
            r="22"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="45 93"
            opacity="0.85"
          />
        </g>

        {/* 5. Центральное светило / планетарное ядро */}
        <circle
          cx="60"
          cy="60"
          r="4.5"
          className="fill-primary drop-shadow-[0_0_8px_var(--primary)]"
        />
        <circle cx="60" cy="60" r="1.75" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
};
