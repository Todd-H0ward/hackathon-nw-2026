import { Sparkline } from './sparkline';

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
      data: history.map((h) => h.power),
      color: '#70e0c4',
    },
    {
      title: 'Задержка сигнала',
      value: current.delay === null ? '—' : current.delay.toFixed(1),
      unit: 'такта',
      data: history.map((h) => h.delay ?? 0),
      color: '#7cc9ff',
    },
    {
      title: 'Использование ресурса',
      value: current.efficiency.toFixed(1),
      unit: '%',
      data: history.map((h) => h.efficiency),
      color: '#ffb66e',
    },
    {
      title: 'Энтропия решений',
      value: current.entropy.toFixed(2),
      unit: 'бит',
      data: history.map((h) => h.entropy),
      color: '#b9a1ff',
    },
  ];

  return (
    <div className="grid grid-cols-4 bg-[#10171f] max-[700px]:grid-cols-2">
      {items.map((item) => (
        <article
          className="pt-[18px] px-[15px] pb-[7px] overflow-hidden border-r border-[#222c37] last:border-r-0 max-[1180px]:pt-3.5 max-[1180px]:px-[9px] max-[1180px]:pb-[5px] max-[700px]:p-[15px] max-[700px]:px-3.5 max-[700px]:border-b max-[700px]:border-[#222c37] max-[700px]:[&:nth-child(2)]:border-r-0"
          key={item.title}
        >
          <span className="text-[8px] text-[#8397a5] max-[1180px]:text-[7px] max-[700px]:text-[9px]">
            {item.title}
          </span>
          <div className="flex items-baseline gap-[5px] mt-2.5">
            <b className="text-[25px] font-normal tracking-[-1px] max-[1180px]:text-[21px] max-[700px]:text-[26px]">
              {item.value}
            </b>
            <small className="text-[8px] text-[#637d8b]">{item.unit}</small>
          </div>
          <Sparkline
            values={item.data}
            color={item.color}
            className="h-[34px] w-full mt-2 opacity-75 max-[700px]:h-[30px]"
          />
        </article>
      ))}
    </div>
  );
};
