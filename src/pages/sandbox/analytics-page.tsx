import { RotateCcw } from 'lucide-react';

import { useLab } from '@/contexts/lab';
import type { Metric } from '@/features/ecosystem/model';
import { WORLDS } from '@/features/ecosystem/model';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
} from '@/shared/ui';

import { worldCaseName } from './lib';
import { Sparkline } from './ui/sparkline';

export const AnalyticsPage = () => {
  const lab = useLab();
  const { sim, body } = lab;
  const world = WORLDS[body];

  const charts = [
    {
      name: 'Численность особей',
      values: sim.history.map((h: Metric) => h.population),
      color: '#70e0c4',
    },
    {
      name: 'Информационная энтропия · бит',
      values: sim.history.map((h: Metric) => h.entropy),
      color: '#b9a1ff',
    },
  ];

  return (
    <div className="rounded-[10px] border border-[#222c37] overflow-hidden bg-[#080d14] min-h-[705px]">
      <section className="p-7 min-[1600px]:p-8 max-[700px]:p-[22px]">
        <div className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          ДАННЫЕ ТЕКУЩЕГО ПРОГОНА
        </div>
        <h2 className="text-[25px] font-normal my-3.5 tracking-[-0.6px] text-foreground">
          От импульса к сообществу.
        </h2>
        <p className="text-[11px] text-muted-foreground mb-6">
          Изменения на {worldCaseName(world.name)} · последние{' '}
          {sim.history.length} тактов
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6 max-[700px]:grid-cols-1">
          <MetricCard label="Рождений" value={sim.births} />
          <MetricCard label="Делений колоний" value={sim.splits} />
          <MetricCard label="Угасших особей" value={sim.deaths} />
        </div>

        <div className="grid gap-3 mb-6">
          {charts.map((item) => (
            <Card key={item.name} className="bg-[#111c25] border-[#2c3c43]">
              <CardHeader className="pb-0">
                <CardTitle className="text-[10px] text-[#97b2af] font-normal">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Sparkline
                  values={item.values}
                  color={item.color}
                  className="w-full h-[65px]"
                />
                <span className="mt-2.5 block font-mono text-[8px] text-[#566f7d]">
                  Такт {sim.history[0]?.tick}{' '}
                  <span className="float-right">{sim.tick}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="leading-[1.7] text-[11px] text-muted-foreground mb-4">
          Рост популяции не доказывает адаптацию. Для проверки сравнивайте
          одинаковые seed с мутациями и без них.
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => lab.setModal('replay')}
        >
          <RotateCcw size={15} />
          Проверить воспроизводимость
        </Button>
      </section>
    </div>
  );
};
