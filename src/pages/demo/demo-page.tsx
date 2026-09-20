import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, Pause, Play, RotateCcw } from 'lucide-react';

import { xenoApi } from '@/shared/api/xenochoice/client';
import { STATIC_ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
} from '@/shared/ui';

import {
  ACTION_LABELS,
  ACTION_VERBS,
  ACTIONS,
  CHAPTER_SECONDS,
  type Episode,
  type Frame,
  formatNum,
  formatSigned,
  narrationForStage,
  SCORE_TERMS,
  STAGES,
} from './lib';

export const DemoPage = () => {
  const query = useQuery({
    queryKey: ['narrated-choice-demo'],
    queryFn: async ({ signal }) => {
      const result = await xenoApi.get<{ success: boolean; data: Episode }>(
        '/demo',
        { signal },
      );
      if (!result.data.success || !result.data.data?.frames?.length)
        throw new Error('Демо пока недоступно');
      return result.data.data;
    },
    staleTime: Infinity,
    retry: 1,
  });

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  const total = (query.data?.frames.length ?? 0) * CHAPTER_SECONDS;
  const finished = total > 0 && elapsed >= total;

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!query.data || !playing || !visible || finished) return;
    const timer = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, [query.data, playing, visible, finished]);

  const frameIndex = Math.min(
    Math.floor(elapsed / CHAPTER_SECONDS),
    (query.data?.frames.length ?? 1) - 1,
  );
  const frame = query.data?.frames[frameIndex];
  const stage = finished ? 2 : Math.floor((elapsed % CHAPTER_SECONDS) / 6);

  const restart = () => {
    setElapsed(0);
    setPlaying(true);
  };

  const jumpTo = (index: number) => {
    setElapsed(index * CHAPTER_SECONDS);
    setPlaying(true);
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="px-5 py-6 max-mobile:px-3 max-mobile:py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] tracking-[1.45px] text-muted-foreground">
              ДЕМО-РЕЖИМ · МАШИНА ВЫБОРА
            </div>
            <h1 className="mt-2 mb-1.5 text-[24px] font-normal tracking-[-0.6px] text-foreground">
              Внутри машины выбора
            </h1>
            <p className="mb-5 max-w-xl text-[11px] text-muted-foreground">
              Один сценарий. Настоящие решения. Понятные причины.
            </p>
          </div>
          {frame ? (
            <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums text-muted-foreground">
              <span>
                {finished
                  ? 'Показ завершён'
                  : `${Math.min(elapsed, total)} / ${total} сек`}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={finished ? restart : () => setPlaying(!playing)}
                aria-label={
                  finished
                    ? 'Повторить демо'
                    : playing
                      ? 'Приостановить показ'
                      : 'Продолжить показ'
                }
              >
                {finished ? (
                  <RotateCcw size={15} />
                ) : playing ? (
                  <Pause size={15} />
                ) : (
                  <Play size={15} />
                )}
              </Button>
              {!finished ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="С начала"
                  onClick={restart}
                >
                  <RotateCcw size={14} />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {!frame ? (
          <LoadingState
            isError={query.isError}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <DemoContent
            frames={query.data?.frames ?? []}
            frame={frame}
            frameIndex={frameIndex}
            stage={stage}
            elapsed={elapsed}
            finished={finished}
            seed={query.data?.seed}
            onJump={jumpTo}
          />
        )}
      </section>
    </div>
  );
};

const LoadingState = ({
  isError,
  onRetry,
}: {
  isError: boolean;
  onRetry: () => void;
}) => (
  <div className="rounded border border-border bg-card p-4" role="status">
    <h2 className="text-[15px] font-normal">
      {isError ? 'Не удалось загрузить показ' : 'Готовим историю решений…'}
    </h2>
    <p className="mt-2 text-[11px] text-muted-foreground">
      {isError
        ? 'Проверьте доступность сервера и повторите загрузку.'
        : 'Движок рассчитывает повторяемый сценарий на Земле.'}
    </p>
    {isError ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
      >
        Повторить загрузку
      </Button>
    ) : null}
  </div>
);

interface DemoContentProps {
  frames: Frame[];
  frame: Frame;
  frameIndex: number;
  stage: number;
  elapsed: number;
  finished: boolean;
  seed?: number;
  onJump: (index: number) => void;
}

const DemoContent = ({
  frames,
  frame,
  frameIndex,
  stage,
  elapsed,
  finished,
  seed,
  onJump,
}: DemoContentProps) => {
  const headline =
    stage === 0
      ? frame.title
      : stage === 1
        ? 'Каждое действие получает объяснимую оценку'
        : ACTION_VERBS[
            frame.decision.selectedAction as keyof typeof ACTION_VERBS
          ];

  return (
    <>
      <nav
        className="mb-4 grid grid-cols-5 gap-2 max-tablet:grid-cols-2 max-mobile:grid-cols-1"
        aria-label="Эпизоды демонстрации"
      >
        {frames.map((f, i) => {
          const progress =
            i < frameIndex || finished
              ? 100
              : i === frameIndex
                ? ((elapsed % CHAPTER_SECONDS) / CHAPTER_SECONDS) * 100
                : 0;
          return (
            <button
              key={f.decision.tick}
              type="button"
              aria-label={`Эпизод ${i + 1}: ${f.title}`}
              aria-current={i === frameIndex ? 'step' : undefined}
              onClick={() => onJump(i)}
              className={cn(
                'relative overflow-hidden rounded border border-border bg-card px-2.5 py-2.5 text-left',
                'text-[10px] leading-[1.45] text-muted-foreground hover:bg-secondary',
                i === frameIndex &&
                  'border-primary/40 bg-primary/5 text-foreground',
              )}
            >
              <span className="font-mono text-primary">
                {i < frameIndex ? (
                  <Check size={12} className="inline" />
                ) : (
                  `0${i + 1}`
                )}
              </span>{' '}
              {f.title}
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-[width] duration-1000 linear"
                style={{ width: `${progress}%` }}
              />
            </button>
          );
        })}
      </nav>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {STAGES.map((label, i) => (
          <span
            key={label}
            className={cn(
              'rounded border border-border px-2 py-0.5 font-mono text-[9px] tracking-[0.6px] text-muted-foreground',
              stage === i && 'border-primary/40 text-foreground',
            )}
          >
            {i + 1} · {label}
          </span>
        ))}
      </div>

      <p className="font-mono text-[9px] tracking-[1.2px] text-muted-foreground">
        ЭПИЗОД 0{frameIndex + 1} · ТАКТ {frame.decision.tick}
      </p>
      <h2 className="mt-1.5 text-[18px] font-normal tracking-[-0.3px]">
        {headline}
      </h2>
      <p
        className="mt-2 mb-4 max-w-3xl text-[11px] leading-[1.7] text-muted-foreground"
        aria-live="polite"
      >
        {narrationForStage(frame, stage)}
      </p>

      {stage === 2 ? (
        <div className="mb-4 grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
          <MetricCard
            label="Энергия · EU"
            value={`${formatNum(frame.before.energy)} → ${formatNum(frame.after.energy)}`}
          />
          <MetricCard
            label="Структура · BU"
            value={`${formatNum(frame.before.biomass)} → ${formatNum(frame.after.biomass)}`}
          />
          <MetricCard label="Особей в конце такта" value={frame.population} />
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-3 max-tablet:grid-cols-1">
        <InputsCard frame={frame} />
        <ScoresCard frame={frame} />
      </div>

      <details className="mb-4 rounded border border-border bg-card p-3">
        <summary className="cursor-pointer text-[11px]">
          Формула и вклад показателей
        </summary>
        <p className="mt-3 font-mono text-[11px]">
          score = wE·R − wD·D + wC·C + wR·Rᵣ − wCost·K
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 max-mobile:grid-cols-2">
          {SCORE_TERMS.map((label, i) => (
            <div key={label} className="rounded border border-border p-2">
              <div className="text-[9px] text-muted-foreground">{label}</div>
              <div className="mt-1 font-mono text-[12px] tabular-nums">
                {formatSigned(
                  frame.explanation.terms[
                    frame.decision.selectedAction as keyof typeof ACTION_LABELS
                  ]?.[i] ?? 0,
                )}
              </div>
              <div className="text-[9px] text-muted-foreground">
                вес {formatNum(frame.explanation.weights[i], 4)}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-[1.6] text-muted-foreground">
          R — запас; D — дефицит; C — помощь; Rᵣ — размножение; K — потери.
          Признаки в диапазоне 0…1. Вклады уже умножены на веса.
        </p>
      </details>

      {finished ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded border border-border bg-card p-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-normal">Выбор можно объяснить.</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Состояние → ограничения → оценки → действие. Правило выбора не
              меняется — меняются входные данные.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            render={<Link to={STATIC_ROUTES.SANDBOX} />}
          >
            Открыть лабораторию
            <ArrowRight size={14} />
          </Button>
        </div>
      ) : null}

      <p className="font-mono text-[8px] tracking-[0.4px] text-muted-foreground">
        Автопоказ · Земля · adaptive · seed {seed} · 90 сек · эксперимент не
        изменяется
      </p>
    </>
  );
};

const InputsCard = ({ frame }: { frame: Frame }) => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-[10px] font-normal text-muted-foreground">
        01 / Входные данные · до действия
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="font-mono text-[12px]">
        {frame.before.id}{' '}
        <span className="text-muted-foreground">
          · поколение {frame.before.generation}
        </span>
      </p>
      <div className="mt-3 grid gap-2.5">
        {(
          [
            ['Энергия · EU', frame.before.energy, 100],
            ['Структура · BU', frame.before.biomass, 20],
            ['Память · M', frame.before.memory, 1],
          ] as const
        ).map(([label, value, max]) => (
          <div key={label}>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono tabular-nums">
                {formatNum(value, label === 'Память · M' ? 3 : 2)}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/75"
                style={{
                  width: `${Math.min(100, (Math.abs(value) / max) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-[1.6] text-muted-foreground">
        {frame.before.memory < 0
          ? 'Память отрицательная: выше вес безопасности.'
          : 'Память неотрицательная: базовые веса генома.'}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {['wE', 'wD', 'wC', 'wR', 'wCost'].map((key, i) => (
          <span
            key={key}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
          >
            {key}{' '}
            <span className="text-foreground">
              {formatNum(frame.explanation.weights[i], 3)}
            </span>
          </span>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ScoresCard = ({ frame }: { frame: Frame }) => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center justify-between gap-2 text-[10px] font-normal text-muted-foreground">
        <span>02 / Оценка альтернатив</span>
        <span className="tabular-nums">
          h = {formatNum(frame.before.genome.hThreshold, 3)}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-3 text-[11px]">
        Почему {frame.decision.selectedAction}?
      </p>
      <div className="grid gap-2">
        {ACTIONS.map((action) => {
          const available = Boolean(frame.explanation.terms[action]);
          const selected = action === frame.decision.selectedAction;
          const score = frame.decision.scores[action];
          const storeScore = frame.decision.scores?.STORE ?? 0;
          const delta = (score ?? 0) - storeScore;
          return (
            <div
              key={action}
              className={cn(
                'rounded border border-border px-2.5 py-2',
                selected && 'border-primary/40 bg-primary/5',
                !available && 'opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-2 text-[11px]">
                <span>
                  <span className="font-mono">{action}</span>
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    {ACTION_LABELS[action]}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] tabular-nums">
                  {available ? formatNum(score, 5) : '—'}
                  {selected ? <Check size={12} /> : null}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {!available
                  ? frame.explanation.blocked[action]
                  : selected
                    ? 'Выбран движком'
                    : action === 'STORE'
                      ? 'Базовый вариант'
                      : delta < frame.before.genome.hThreshold
                        ? `Δ ${formatNum(delta, 5)} < h`
                        : 'Порог пройден, оценка ниже'}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[9px] tabular-nums text-muted-foreground">
        {(
          frame.explanation.terms[
            frame.decision.selectedAction as keyof typeof ACTION_LABELS
          ] ?? []
        )
          .map((v) => formatSigned(v))
          .join(' ')}{' '}
        = {formatNum(frame.decision.chosenScore, 5)}
      </p>
    </CardContent>
  </Card>
);
