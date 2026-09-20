import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  CircleHelp,
  GitBranch,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { LabRail } from '@/pages/sandbox/ui/lab-rail';

import { xenoApi } from '@/shared/api/xenochoice/client';
import type { DecisionTrace, Individual } from '@/shared/api/xenochoice/types';
import { STATIC_ROUTES } from '@/shared/constants';

import './demo.css';

type Action = 'STORE' | 'TRANSFER' | 'GROW' | 'DIVIDE';
type Frame = {
  title: string;
  context: string;
  before: Individual;
  after: Individual;
  decision: DecisionTrace;
  explanation: {
    weights: number[];
    terms: Partial<Record<Action, number[]>>;
    blocked: Partial<Record<Action, string>>;
  };
  population: number;
};
type Episode = { seed: number; frames: Frame[] };
const actions: Action[] = ['STORE', 'TRANSFER', 'GROW', 'DIVIDE'];
const labels: Record<Action, string> = {
  STORE: 'Сохранить',
  TRANSFER: 'Передать',
  GROW: 'Расти',
  DIVIDE: 'Разделиться',
};
const verbs: Record<Action, string> = {
  STORE: 'Сохраняет ресурс',
  TRANSFER: 'Помогает соседу',
  GROW: 'Наращивает структуру',
  DIVIDE: 'Создаёт потомка',
};
const terms = ['Запас', 'Дефицит', 'Помощь', 'Размножение', 'Потери'];
const stages = ['Наблюдает', 'Сравнивает', 'Выбирает'];
const chapterSeconds = 18;
const number = (n: number, digits = 2) => n.toFixed(digits);
const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(5)}`;

function explanation(frame: Frame) {
  const { decision: d, before: b } = frame;
  if (d.selectedAction === 'STORE')
    return 'Ни один доступный вариант не дал достаточного улучшения относительно сохранения. Машина остаётся на STORE: высокий балл сам по себе ещё не гарантирует переключение.';
  return `${labels[d.selectedAction as Action]} — лучший доступный вариант, прошедший порог переключения. Преимущество перед STORE: ${number(d.chosenScore - d.scores.STORE, 5)}, при пороге h = ${number(b.genome.hThreshold, 5)}.${d.selectedTarget ? ` Получатель: ${d.selectedTarget}.` : ''}`;
}

function scoreExplanation(frame: Frame) {
  const contributions =
    frame.explanation.terms[frame.decision.selectedAction as Action] ?? [];
  const strongest = contributions.reduce(
    (best, value, i) => (value > (contributions[best] ?? 0) ? i : best),
    0,
  );
  return (
    `Для ${frame.decision.selectedAction} наибольший положительный вклад даёт «${terms[strongest]}»: ${signed(contributions[strongest] ?? 0)}. ` +
    `Итог: ${number(frame.decision.chosenScore, 5)}. Машина также учитывает остальные выгоды и штрафы; для переключения улучшение относительно STORE должно быть не меньше ${number(frame.before.genome.hThreshold, 3)}.`
  );
}

export function DemoPage() {
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
  const total = (query.data?.frames.length ?? 0) * chapterSeconds;
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
    Math.floor(elapsed / chapterSeconds),
    (query.data?.frames.length ?? 1) - 1,
  );
  const frame = query.data?.frames[frameIndex];
  const stage = finished ? 2 : Math.floor((elapsed % chapterSeconds) / 6);
  const restart = () => {
    setElapsed(0);
    setPlaying(true);
  };

  return (
    <div className="demo-shell flex h-dvh overflow-hidden bg-background text-foreground max-mobile:flex-col">
      <LabRail showResearchVoice={false} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="demo-container">
          <header className="demo-header">
            <div>
              <p className="demo-eyebrow">
                <Radio size={13} /> XENOCHOICE / ДЕМО-РЕЖИМ
              </p>
              <h1>
                Внутри машины выбора<span>.</span>
              </h1>
              <p className="demo-muted">
                Один сценарий. Настоящие решения. Понятные причины.
              </p>
            </div>
            {frame && (
              <div className="demo-playback">
                <span>
                  {finished
                    ? 'Показ завершён'
                    : `${Math.min(elapsed, total)} / ${total} сек`}
                </span>
                <button
                  type="button"
                  className="demo-icon"
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
                    <RotateCcw size={18} />
                  ) : playing ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                </button>
                <button
                  type="button"
                  className="demo-icon"
                  aria-label="С начала"
                  onClick={restart}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            )}
          </header>
          {!frame ? (
            <section className="demo-loading" role="status">
              <Sparkles size={30} />
              <h2>
                {query.isError
                  ? 'Не удалось загрузить показ'
                  : 'Готовим историю решений…'}
              </h2>
              <p>
                {query.isError
                  ? 'Проверьте доступность сервера и повторите загрузку.'
                  : 'Движок рассчитывает повторяемый сценарий на Земле.'}
              </p>
              {query.isError && (
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => void query.refetch()}
                >
                  Повторить загрузку
                </button>
              )}
            </section>
          ) : (
            <>
              <nav className="demo-chapters" aria-label="Эпизоды демонстрации">
                {query.data?.frames.map((f, i) => (
                  <button
                    key={f.decision.tick}
                    aria-label={`Эпизод ${i + 1}: ${f.title}`}
                    type="button"
                    aria-current={i === frameIndex ? 'step' : undefined}
                    onClick={() => {
                      setElapsed(i * chapterSeconds);
                      setPlaying(true);
                    }}
                  >
                    <span className="demo-chapter-number">
                      {i < frameIndex ? <Check size={13} /> : `0${i + 1}`}
                    </span>
                    <span>{f.title}</span>
                    <i
                      style={{
                        width: `${i < frameIndex || finished ? 100 : i === frameIndex ? ((elapsed % chapterSeconds) / chapterSeconds) * 100 : 0}%`,
                      }}
                    />
                  </button>
                ))}
              </nav>
              <section
                className="demo-narration"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="demo-narration-top">
                  <p className="demo-eyebrow">
                    ЭПИЗОД 0{frameIndex + 1} / ТАКТ {frame.decision.tick}
                  </p>
                  <div className="demo-steps">
                    {stages.map((label, i) => (
                      <span className={stage === i ? 'active' : ''} key={label}>
                        {i + 1}
                        <small>{label}</small>
                        {i < 2 && <ArrowRight size={13} />}
                      </span>
                    ))}
                  </div>
                </div>
                <h3>
                  {stage === 0
                    ? frame.title
                    : stage === 1
                      ? 'Каждое действие получает объяснимую оценку'
                      : verbs[frame.decision.selectedAction as Action]}
                </h3>
                <p>
                  {stage === 0
                    ? `${frame.context} Особь ${frame.before.id} принимает решение с энергией ${number(frame.before.energy)} и структурой ${number(frame.before.biomass)}. Память ${number(frame.before.memory, 3)} влияет на приоритеты. Недоступные действия исключаются до выбора.`
                    : stage === 1
                      ? scoreExplanation(frame)
                      : explanation(frame)}
                </p>
                {stage === 2 && (
                  <div className="demo-outcome">
                    <span>Итог всего такта</span>
                    <b>
                      E: {number(frame.before.energy)} →{' '}
                      {number(frame.after.energy)}
                    </b>
                    <b>
                      B: {number(frame.before.biomass)} →{' '}
                      {number(frame.after.biomass)}
                    </b>
                    <small>
                      Включает действие и последующие расходы такта, в том числе
                      сигналы.
                    </small>
                  </div>
                )}
              </section>
              <div className="demo-grid">
                <section
                  className={`demo-panel demo-organism stage-${stage}`}
                  aria-label="Состояние особи перед решением"
                >
                  <div className="demo-panel-heading">
                    <span>01 / ВХОДНЫЕ ДАННЫЕ</span>
                    <span className="demo-tag">До действия</span>
                  </div>
                  <div className="demo-orbit" aria-hidden="true">
                    <div className="demo-orbit-ring" />
                    <div className="demo-orbit-ring second" />
                    <span className="demo-satellite one" />
                    <span className="demo-satellite two" />
                    <span className="demo-satellite three" />
                    <div className="demo-core">
                      <GitBranch size={32} />
                      <span>{frame.before.id}</span>
                      <small>поколение {frame.before.generation}</small>
                    </div>
                    <span className="demo-orbit-caption">
                      {frame.population} особей в конце такта
                    </span>
                  </div>
                  <div className="demo-metrics">
                    {[
                      ['Энергия · EU', frame.before.energy, 100],
                      ['Структура · BU', frame.before.biomass, 20],
                      ['Память · M', frame.before.memory, 1],
                    ].map(([label, value, max]) => (
                      <div key={String(label)}>
                        <span>{label}</span>
                        <strong>
                          {number(
                            Number(value),
                            label === 'Память · M' ? 3 : 2,
                          )}
                        </strong>
                        <div className="demo-meter">
                          <i
                            style={{
                              width: `${Math.min(100, (Math.abs(Number(value)) / Number(max)) * 100)}%`,
                              background:
                                Number(value) < 0
                                  ? 'var(--primary)'
                                  : undefined,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="demo-note">
                    {frame.before.memory < 0
                      ? 'Память отрицательная: безопасность получает больший вес, помощь и размножение — меньший.'
                      : 'Память неотрицательная: используются нормированные базовые веса генома.'}
                  </p>
                  <section
                    className="demo-weights"
                    aria-label="Веса после учёта памяти"
                  >
                    {['wE', 'wD', 'wC', 'wR', 'wCost'].map((key, i) => (
                      <span key={key}>
                        {key}
                        <b>{number(frame.explanation.weights[i], 3)}</b>
                      </span>
                    ))}
                  </section>
                </section>
                <section
                  className="demo-panel demo-decisions"
                  aria-label="Сравнение действий"
                >
                  <div className="demo-panel-heading">
                    <span>02 / ОЦЕНКА АЛЬТЕРНАТИВ</span>
                    <span className="demo-tag">
                      h = {number(frame.before.genome.hThreshold, 3)}
                    </span>
                  </div>
                  <h3>Почему именно {frame.decision.selectedAction}?</h3>
                  <p className="demo-muted">
                    Доступность → полезность → порог переключения
                  </p>
                  <div className="demo-scores">
                    {actions.map((action) => {
                      const available = Boolean(
                        frame.explanation.terms[action],
                      );
                      const selected = action === frame.decision.selectedAction;
                      const score = frame.decision.scores[action];
                      const delta = score - frame.decision.scores.STORE;
                      return (
                        <div
                          key={action}
                          className={`demo-score ${selected ? 'winner' : ''} ${!available ? 'blocked' : ''}`}
                        >
                          <div className="demo-score-top">
                            <span>
                              <b>{action}</b>
                              <small>{labels[action]}</small>
                            </span>
                            <strong>
                              {available ? number(score, 5) : 'Недоступно'}
                              {selected && <Check size={15} />}
                            </strong>
                          </div>
                          <div className="demo-score-track">
                            <i
                              style={{
                                width: available
                                  ? `${Math.min(100, Math.max(2, Math.abs(score) * 160))}%`
                                  : '0%',
                              }}
                            />
                          </div>
                          <p>
                            {!available
                              ? frame.explanation.blocked[action]
                              : selected
                                ? 'Выбран движком'
                                : action === 'STORE'
                                  ? 'Базовый вариант для сравнения'
                                  : delta < frame.before.genome.hThreshold
                                    ? `Улучшение ${number(delta, 5)} < h: переключение не оправдано`
                                    : 'Порог пройден, но у победителя оценка выше'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="demo-score-equation">
                    {(
                      frame.explanation.terms[
                        frame.decision.selectedAction as Action
                      ] ?? []
                    )
                      .map((v) => signed(v))
                      .join(' ')}{' '}
                    = {number(frame.decision.chosenScore, 5)}
                  </p>
                </section>
              </div>
              <details className="demo-panel demo-formula">
                <summary>Подробнее: формула и вклад каждого показателя</summary>
                <div className="demo-panel-heading">
                  <span>03 / РАСЧЁТ ПОБЕДИВШЕГО ДЕЙСТВИЯ</span>
                  <CircleHelp size={15} />
                </div>
                <p className="demo-equation">
                  score = wE·R − wD·D + wC·C + wR·Rᵣ − wCost·K
                </p>
                <div className="demo-terms">
                  {terms.map((label, i) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>
                        {signed(
                          frame.explanation.terms[
                            frame.decision.selectedAction as Action
                          ]?.[i] ?? 0,
                        )}
                      </strong>
                      <small>
                        вес {number(frame.explanation.weights[i], 4)}
                      </small>
                    </div>
                  ))}
                  <div className="demo-sum">
                    <span>Итого</span>
                    <strong>{number(frame.decision.chosenScore, 5)}</strong>
                    <small>{frame.decision.selectedAction}</small>
                  </div>
                </div>
                <p className="demo-note">
                  R — запас относительно целевого резерва; D — нехватка на два
                  такта; C — ожидаемая помощь соседу; Rᵣ — готовность к
                  размножению; K — необратимые потери. Все признаки ограничены
                  диапазоном 0…1. Вклады выше уже умножены на веса; возможна
                  погрешность округления.
                </p>
              </details>
              {finished && (
                <section className="demo-finale">
                  <Sparkles size={24} />
                  <div>
                    <h2>Выбор можно объяснить.</h2>
                    <p>
                      Состояние → ограничения → оценки → действие. При изменении
                      среды меняются входные данные и приоритеты, а правило
                      выбора остаётся тем же.
                    </p>
                  </div>
                  <Link className="demo-button" to={STATIC_ROUTES.SANDBOX}>
                    Открыть лабораторию <ArrowRight size={16} />
                  </Link>
                </section>
              )}
              <footer className="demo-footer">
                <span>
                  Автопоказ · Земля · adaptive · seed {query.data?.seed} · 90
                  секунд
                </span>
                <span>
                  Реальный движок, фиксированный сценарий. Ваш эксперимент не
                  изменяется.
                </span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
