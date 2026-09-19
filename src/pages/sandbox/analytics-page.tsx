import { RotateCcw } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
} from '@/shared/ui';

import { type Metric, useWorldCatalog } from '@/features/ecosystem';
import { useLabBody, useLabSetModal, useLabSim } from '@/store';

import { worldCaseName } from './lib';
import { Sparkline } from './ui/sparkline';

export const AnalyticsPage = () => {
  const sim = useLabSim();
  const body = useLabBody();
  const setModal = useLabSetModal();
  const world = useWorldCatalog().catalog[body];

  if (!world) return null;

  const charts = [
    {
      name: 'Численность особей',
      values: sim.history.map((h: Metric) => h.population),
      color: 'var(--chart-2)',
    },
    {
      name: 'Информационная энтропия · бит',
      values: sim.history.map((h: Metric) => h.entropy),
      color: 'var(--chart-1)',
    },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="px-5 py-6 max-mobile:px-3 max-mobile:py-4">
        <div className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
          ДАННЫЕ ТЕКУЩЕГО ПРОГОНА
        </div>
        <h1 className="mt-2 mb-1.5 text-[24px] font-normal tracking-[-0.6px] text-foreground">
          От импульса к сообществу.
        </h1>
        <p className="mb-5 text-[11px] text-muted-foreground">
          Изменения на {worldCaseName(world.name)} · последние{' '}
          {sim.history.length} тактов
        </p>

        <div className="mb-3 grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
          <MetricCard label="Рождений" value={sim.births} />
          <MetricCard label="Делений колоний" value={sim.splits} />
          <MetricCard label="Угасших особей" value={sim.deaths} />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 max-tablet:grid-cols-1">
          {charts.map((item) => (
            <Card key={item.name} className="border-border bg-card">
              <CardHeader className="pb-0">
                <CardTitle className="text-[10px] font-normal text-muted-foreground">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Sparkline
                  values={item.values}
                  color={item.color}
                  className="w-full h-[65px]"
                />
                <span className="mt-2.5 block font-mono text-[8px] text-muted-foreground">
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
          onClick={() => setModal('replay')}
        >
          <RotateCcw size={15} />
          Проверить воспроизводимость
        </Button>
      </section>
    </div>
  );
};
