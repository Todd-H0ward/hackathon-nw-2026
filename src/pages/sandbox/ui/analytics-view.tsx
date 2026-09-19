import { RotateCcw } from 'lucide-react';

import type { GlobeBodyId } from '@/shared/ui/globe';

import { type Simulation, WORLDS } from '@/features/ecosystem/model';

import { worldCaseName } from '../lib';
import { Sparkline } from './sparkline';

type AnalyticsViewProps = {
  body: GlobeBodyId;
  sim: Simulation;
  onOpenReplay: () => void;
};

export const AnalyticsView = ({
  body,
  sim,
  onOpenReplay,
}: AnalyticsViewProps) => {
  const world = WORLDS[body];

  return (
    <section className="p-7 h-[496px] overflow-auto bg-[radial-gradient(ellipse_at_top_right,#20382f55,transparent_70%)] min-[1600px]:h-[580px] max-[700px]:h-[420px] max-[700px]:p-[22px]">
      <div className="[font:9px_monospace] tracking-[1.45px] text-[#82929f]">
        ДАННЫЕ ТЕКУЩЕГО ПРОГОНА
      </div>
      <h2 className="text-[25px] font-normal my-3.5 mb-[7px] tracking-[-0.6px]">
        От импульса к сообществу.
      </h2>
      <p className="text-[11px] text-[#7d959f]">
        Изменения на {worldCaseName(world.name)} · последние{' '}
        {sim.history.length} тактов
      </p>
      <div className="flex gap-10 my-[25px] max-[700px]:gap-5">
        <div className="text-[#7e9a9d] text-[9px]">
          <b className="block [font:25px_monospace] text-[#c6ddd0] mb-[7px]">
            {sim.births}
          </b>
          Рождений
        </div>
        <div className="text-[#7e9a9d] text-[9px]">
          <b className="block [font:25px_monospace] text-[#c6ddd0] mb-[7px]">
            {sim.splits}
          </b>
          Делений колоний
        </div>
        <div className="text-[#7e9a9d] text-[9px]">
          <b className="block [font:25px_monospace] text-[#c6ddd0] mb-[7px]">
            {sim.deaths}
          </b>
          Угасших особей
        </div>
      </div>
      {[
        {
          name: 'Численность особей',
          values: sim.history.map((h) => h.population),
          color: '#70e0c4',
        },
        {
          name: 'Информационная энтропия · бит',
          values: sim.history.map((h) => h.entropy),
          color: '#b9a1ff',
        },
      ].map((item) => (
        <div
          className="py-[13px] px-4 border border-[#2c3c43] rounded-[7px] mb-3 bg-[#111c25]"
          key={item.name}
        >
          <h3 className="text-[#97b2af] text-[10px] font-normal m-0 mb-2.5">
            {item.name}
          </h3>
          <Sparkline values={item.values} color={item.color} className="w-full h-[65px]" />
          <span className="block text-[#566f7d] [font:8px_monospace] mt-2.5">
            Такт {sim.history[0]?.tick}{' '}
            <span className="float-right">{sim.tick}</span>
          </span>
        </div>
      ))}
      <p className="leading-[1.7] my-[18px]">
        Рост популяции не доказывает адаптацию. Для проверки сравнивайте
        одинаковые seed с мутациями и без них.
      </p>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-[9px] border border-[#33414d] bg-[#151d25] text-[#bfcdd6] text-[11px] py-[11px] px-[15px] rounded-md hover:bg-[#1f2b36]"
        onClick={onOpenReplay}
      >
        <RotateCcw size={15} />
        Проверить воспроизводимость
      </button>
    </section>
  );
};
