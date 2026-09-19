import { MetricCard } from '@/shared/ui';

type MetricPoint = {
  power: number;
  delay: number | null;
  efficiency: number;
  entropy: number;
};

type MetricGridProps = {
  current: MetricPoint;
  history: MetricPoint[];
};

export const MetricGrid = ({ current, history }: MetricGridProps) => {
  const items = [
    {
      title: 'Входная мощность',
      value: current.power.toFixed(1),
      unit: 'EU/такт',
      data: history.map((h) => ({ value: h.power })),
      color: '#70e0c4',
    },
    {
      title: 'Задержка сигнала',
      value: current.delay === null ? '—' : current.delay.toFixed(1),
      unit: 'такта',
      data: history.map((h) => ({ value: h.delay ?? 0 })),
      color: '#7cc9ff',
    },
    {
      title: 'Использование ресурса',
      value: current.efficiency.toFixed(1),
      unit: '%',
      data: history.map((h) => ({ value: h.efficiency })),
      color: '#ffb66e',
    },
    {
      title: 'Энтропия решений',
      value: current.entropy.toFixed(2),
      unit: 'бит',
      data: history.map((h) => ({ value: h.entropy })),
      color: '#b9a1ff',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-0 bg-[#10171f] max-[700px]:grid-cols-2">
      {items.map((item) => (
        <MetricCard
          key={item.title}
          label={item.title}
          value={item.value}
          unit={item.unit}
          sparkData={item.data}
          sparkColor={item.color}
          className="rounded-none border-0 border-r border-[#222c37] bg-transparent last:border-r-0 max-[700px]:border-b"
        />
      ))}
    </div>
  );
};
