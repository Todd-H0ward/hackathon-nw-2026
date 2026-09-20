import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { RotateCcw } from 'lucide-react';

import {
  xenoApiEndpoints as api,
  type MetricsSnapshot,
  xenoApi,
} from '@/shared/api/xenochoice';
import { worldCaseName } from '@/shared/constants';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
  Select,
  Sparkline,
} from '@/shared/ui';

import { useWorldCatalog } from '@/features/ecosystem/use-world-catalog';
import {
  useLabBody,
  useLabSetModal,
  useLabSimDialogStats,
  useLabSimTick,
} from '@/store';
import { useLabStore } from '@/store/lab/store';

export const AnalyticsPage = () => {
  const tick = useLabSimTick();
  const stats = useLabSimDialogStats();
  const body = useLabBody();
  const setModal = useLabSetModal();
  const world = useWorldCatalog().catalog[body];

  const [params, setParams] = useSearchParams();
  const metric = params.get('metric') ?? 'population';
  const id = useLabStore((s) => s.recording?.id ?? s.experimentIds[s.body]);
  const [history, setHistory] = useState<MetricsSnapshot[]>([]);
  const [comparison, setComparison] = useState<
    { mode: string; metrics: MetricsSnapshot }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setHistory([]);
    setComparison([]);
    setError('');
    if (!id) return;
    let active = true;
    const load = () =>
      api
        .getMetrics(id)
        .then((data) => {
          if (active) setHistory(data);
        })
        .catch(() => {
          if (active) setError('Не удалось загрузить историю');
        });
    void load();
    const timer = setInterval(() => void load(), 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);
  const visible = history.filter((h) => h.tick <= tick);
  const compare = async () => {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await xenoApi.get(`/experiments/${id}/compare`, {
        params: { ticks: 300 },
        timeout: 60000,
      });
      setComparison(data.data);
    } catch {
      setError('Сравнение не удалось');
    } finally {
      setBusy(false);
    }
  };
  if (!world) return null;

  const definitions = [
    {
      key: 'population',
      name: 'Численность особей',
      value: (h: MetricsSnapshot) => h.population,
    },
    {
      key: 'entropy',
      name: 'Энтропия решений · бит',
      value: (h: MetricsSnapshot) => h.decisionEntropy,
    },
    {
      key: 'power',
      name: 'Входная мощность · EU/TU',
      value: (h: MetricsSnapshot) => h.inputPower,
    },
    {
      key: 'efficiency',
      name: 'Использование ресурса · %',
      value: (h: MetricsSnapshot) => h.efficiency,
    },
  ];
  const charts = definitions
    .filter((d) => metric === 'all' || d.key === metric)
    .map((d) => ({
      name: d.name,
      values: visible.map(d.value),
      color: 'var(--chart-1)',
    }));

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
          Изменения на {worldCaseName(body)} · последние {visible.length} тактов
        </p>

        <div className="mb-3 grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
          <MetricCard label="Рождений" value={stats.births} />
          <MetricCard label="Делений колоний" value={stats.splits} />
          <MetricCard label="Угасших особей" value={stats.deaths} />
        </div>

        <div className="mb-3 max-w-xs">
          <Select
            label="График"
            aria-label="Выбрать график"
            value={metric}
            onChange={(e) => setParams({ metric: e.target.value })}
          >
            <option value="all">Все показатели</option>
            {definitions.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </Select>
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
                  Такт {visible[0]?.tick ?? tick}{' '}
                  <span className="float-right">{tick}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="leading-[1.7] text-[11px] text-muted-foreground mb-4">
          Рост популяции не доказывает адаптацию. Для проверки сравнивайте
          одинаковые seed с мутациями и без них.
        </p>

        <div className="mb-4 rounded border p-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy || !id}
            onClick={() => void compare()}
          >
            {busy ? 'Сравниваем…' : 'Сравнить 3 режима · 300 тактов'}
          </Button>
          <p className="my-2 text-xs text-muted-foreground">
            Одинаковые мир, seed и воздействия до такта 300; переключения режима
            исключены. Исходный опыт не изменяется.
          </p>
          {error && <p role="alert">{error}</p>}
          {comparison.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  <th>Режим</th>
                  <th>Особей</th>
                  <th>Рождений</th>
                  <th>Благо %</th>
                  <th>Энтропия</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r) => (
                  <tr key={r.mode}>
                    <td>{r.mode}</td>
                    <td>{r.metrics?.population ?? '—'}</td>
                    <td>{r.metrics?.birthsTotal ?? '—'}</td>
                    <td>
                      {r.metrics?.meanWelfare != null
                        ? r.metrics.meanWelfare.toFixed(1)
                        : '—'}
                    </td>
                    <td>
                      {r.metrics?.decisionEntropy != null
                        ? r.metrics.decisionEntropy.toFixed(3)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
