import {
  Component,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Atom,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Dna,
  Focus,
  GitBranch,
  Globe2,
  Layers3,
  Leaf,
  Maximize2,
  Microscope,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Settings2,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Waves,
  X,
  Zap,
} from 'lucide-react';

import { type GlobeBodyId, GlobeCanvas } from '@/shared/ui/globe';

import {
  ACTIONS,
  activeColonies,
  createSimulation,
  intervene,
  living,
  MODEL_VERSION,
  members,
  replay,
  type Settings,
  type Simulation,
  step,
  WORLDS,
} from '@/features/ecosystem/model';
import { SurfaceLife } from '@/features/ecosystem/surface-life';

import './laboratory.css';

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <Globe2 size={60} />
        <h3>3D недоступно в этом браузере</h3>
        <p>
          Симуляция, колонии и аналитика продолжают работать.
          <br />
          Откройте страницу в браузере с WebGL 2.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
const ids: GlobeBodyId[] = ['earth', 'mars', 'venus'];
const pad = (n: number) => String(n).padStart(2, '0');
function download(s: Simulation) {
  const data = {
    modelVersion: MODEL_VERSION,
    body: s.body,
    seed: s.seed,
    tick: s.tick,
    interventions: s.interventions,
    state: s,
    note: 'Реальные справочные параметры планеты; гипотетическая модель небиологической жизни. EU — условная энергия.',
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `xenochoice-${s.body}-${s.seed}-${s.tick}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Sparkline({
  values,
  color = '#8bd6c2',
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(1, ...values),
    min = Math.min(0, ...values);
  return (
    <svg
      viewBox="0 0 240 54"
      preserveAspectRatio="none"
      role="img"
      aria-label="Динамика показателя"
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
}
export const SandboxPage = () => {
  const [body, setBody] = useState<GlobeBodyId>('earth');
  const [worlds, setWorlds] = useState<Record<GlobeBodyId, Simulation>>(() => ({
    earth: createSimulation('earth'),
    mars: createSimulation('mars'),
    venus: createSimulation('venus'),
  }));
  const [running, setRunning] = useState(true),
    [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(1),
    [showLinks, setShowLinks] = useState(true),
    [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<'lab' | 'analytics'>('lab');
  const [modal, setModal] = useState<
    'guide' | 'atlas' | 'reset' | 'replay' | null
  >(null);
  const [toast, setToast] = useState(''),
    [cameraReset, setCameraReset] = useState(0),
    [expanded, setExpanded] = useState(false);
  const [seed, setSeed] = useState('2048');
  const dialog = useRef<HTMLDialogElement>(null);
  const sim = worlds[body],
    world = WORLDS[body];
  const colonies = activeColonies(sim),
    alive = living(sim),
    colony = sim.colonies.find((c) => c.id === selected);
  const group = selected === null ? [] : members(sim, selected);
  const m = sim.history.at(-1) ?? {
    population: 0,
    power: 0,
    efficiency: 0,
    entropy: 0,
    delay: null,
  };
  const focused =
    group.find((i) => i.action === 'divide') ??
    group.find((i) => i.action === 'signal') ??
    group[0];
  const update = (fn: (s: Simulation) => Simulation) =>
    setWorlds((prev) => ({ ...prev, [body]: fn(prev[body]) }));
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setWorlds((prev) => {
          let next = prev[body];
          for (let i = 0; i < speed; i++) next = step(next);
          return { ...prev, [body]: next };
        }),
      450,
    );
    return () => clearInterval(timer);
  }, [running, speed, body]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  function selectWorld(next: GlobeBodyId) {
    setBody(next);
    setSelected(1);
    setSeed(String(worlds[next].seed));
  }
  function settings(next: Partial<Settings>) {
    update((s) =>
      intervene(s, { type: 'settings', settings: { ...s.settings, ...next } }),
    );
  }
  function addColony() {
    if (alive.length > 172 || colonies.length >= 12) {
      setToast('Достигнут лимит: 180 особей или 12 колоний');
      return;
    }
    const id = sim.nextColony;
    update((s) => intervene(s, { type: 'seed' }));
    setSelected(id);
    setToast('Зародыш внесён. Внешний ресурс зарегистрирован.');
  }
  const history = sim.history.slice(-70);
  return (
    <div
      className={`laboratory ${expanded ? 'expanded' : ''}`}
      style={{ '--world-color': world.color } as CSSProperties}
    >
      <header className="lab-header">
        <a className="lab-brand" href="/" aria-label="XenoChoice">
          <Atom size={27} />
          <span>
            XENO<span className="brand-light">CHOICE</span>
            <small>EXOBIOLOGY RESEARCH LAB</small>
          </span>
        </a>
        <nav aria-label="Главная навигация">
          <button
            type="button"
            className={view === 'lab' ? 'active' : ''}
            onClick={() => setView('lab')}
          >
            <Microscope size={15} />
            Лаборатория
          </button>
          <button
            type="button"
            className={view === 'analytics' ? 'active' : ''}
            onClick={() => setView('analytics')}
          >
            <Activity size={15} />
            Аналитика
          </button>
          <button type="button" onClick={() => setModal('atlas')}>
            <Globe2 size={15} />
            Атлас миров
          </button>
        </nav>
        <div className="header-right">
          <span className="live-dot" />
          ЛОКАЛЬНАЯ МОДЕЛЬ
          <button
            type="button"
            className="icon-btn"
            aria-label="Роль исследователя"
            onClick={() => setModal('guide')}
          >
            <CircleHelp size={18} />
          </button>
          <span className="researcher-avatar">И</span>
        </div>
      </header>
      <div className="lab-title">
        <div>
          <div className="eyebrow">
            ПРОЕКТ «МАШИНА ВЫБОРА» <span>/</span> ЭКСПЕРИМЕНТ {sim.seed}
          </div>
          <h1>
            Жизнь за пределами биологии<span>.</span>
          </h1>
          <p>Создавайте условия. Наблюдайте выбор. Исследуйте эволюцию.</p>
        </div>
        <button
          type="button"
          className="secondary-btn export-btn"
          onClick={() => {
            download(sim);
            setToast('Эксперимент экспортирован в JSON');
          }}
        >
          <ArrowDownToLine size={15} />
          Экспорт эксперимента
        </button>
      </div>
      <div className="lab-layout">
        <aside className="environment-panel">
          <div className="panel-heading">
            <span>01</span>
            <h2>Среда обитания</h2>
            <Globe2 size={15} />
          </div>
          <div className="world-picker">
            {ids.map((id) => (
              <button
                type="button"
                key={id}
                className={
                  body === id ? 'world-choice selected' : 'world-choice'
                }
                onClick={() => selectWorld(id)}
              >
                <span className={`mini-world ${id}`} />
                <span>
                  {WORLDS[id].name}
                  <small>{WORLDS[id].english}</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="planet-facts">
            <div>
              <span>Средняя температура</span>
              <b>
                {world.temperature > 0 ? '+' : ''}
                {world.temperature} <small>°C</small>
              </b>
            </div>
            <div>
              <span>Гравитация</span>
              <b>
                {world.gravity} <small>м/с²</small>
              </b>
            </div>
            <div>
              <span>Давление у поверхности</span>
              <b>
                {world.pressure} <small>бар</small>
              </b>
            </div>
            <a
              href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
              target="_blank"
              rel="noreferrer"
            >
              Справочные данные NASA <ArrowUpRight size={11} />
            </a>
          </div>
          <div className="process-card">
            <Waves size={17} />
            <span>ФИЗИЧЕСКИЙ МЕХАНИЗМ</span>
            <b>{world.phenomenon}</b>
            <p>Гипотетическая модель · условные единицы</p>
          </div>
          <div className="panel-heading second">
            <span>02</span>
            <h2>Условия эксперимента</h2>
            <Settings2 size={15} />
          </div>
          <label className="range-field">
            <span>
              Приток ресурса<output>{sim.settings.resource}%</output>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={sim.settings.resource}
              onChange={(e) => settings({ resource: +e.target.value })}
            />
            <small>
              Слабый<span>Интенсивный</span>
            </small>
          </label>
          <label className="range-field">
            <span>
              Шум среды<output>{sim.settings.noise}%</output>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={sim.settings.noise}
              onChange={(e) => settings({ noise: +e.target.value })}
            />
            <small>
              Стабильность<span>Возмущения</span>
            </small>
          </label>
          <label className="evolution-toggle">
            <span>
              <Dna size={15} />
              Мутации при делении
            </span>
            <input
              type="checkbox"
              checked={sim.settings.mutation}
              onChange={(e) => settings({ mutation: e.target.checked })}
            />
          </label>
          <div className="research-tip">
            <BookOpen size={16} />
            <p>
              Планета — среда.
              <br />
              Особь — структура.
              <br />
              <strong>Колония — их сообщество.</strong>
            </p>
          </div>
        </aside>
        <main className="central-panel">
          {view === 'lab' ? (
            <section
              className="planet-viewport"
              aria-label="Интерактивная планета с особями и колониями"
            >
              <div className="viewport-heading">
                <div>
                  <span className="eyebrow">
                    {world.code} <span>/</span> ПОВЕРХНОСТНЫЙ СЛОЙ
                  </span>
                  <h2>
                    {world.name}
                    <span>{world.process}</span>
                  </h2>
                </div>
                <span className={`state-pill ${running ? '' : 'paused'}`}>
                  <span />
                  {running ? 'НАБЛЮДЕНИЕ' : 'ПАУЗА'}
                </span>
              </div>
              <div className="globe-stage">
                <SceneBoundary key={body}>
                  <GlobeCanvas
                    body={body}
                    cameraReset={cameraReset}
                    fill
                    stars
                    interactive
                  >
                    <SurfaceLife
                      simulation={sim}
                      selected={selected}
                      showLinks={showLinks}
                      showLabels={showLabels}
                      onSelect={setSelected}
                    />
                  </GlobeCanvas>
                </SceneBoundary>
              </div>
              <div className="viewport-tools">
                <button
                  type="button"
                  className="icon-btn"
                  title="Показать связи"
                  aria-label="Показать связи"
                  aria-pressed={showLinks}
                  onClick={() => setShowLinks(!showLinks)}
                >
                  <Radio size={17} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Подписи колоний"
                  aria-label="Подписи колоний"
                  aria-pressed={showLabels}
                  onClick={() => setShowLabels(!showLabels)}
                >
                  <Layers3 size={17} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Исходный ракурс"
                  aria-label="Исходный ракурс"
                  onClick={() => setCameraReset((n) => n + 1)}
                >
                  <Focus size={17} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Расширить сцену"
                  aria-label="Расширить сцену"
                  aria-pressed={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Maximize2 size={17} />
                </button>
              </div>
              <div className="planet-coordinate">
                <span>ПОВОРОТ — ПЕРЕТАСКИВАНИЕ</span>
                <span>МАСШТАБ — КОЛЕСО МЫШИ</span>
              </div>
              <div className="scene-key">
                <span>
                  <i className="key-life" />
                  Особь
                </span>
                <span>
                  <i className="key-birth" />
                  Рождение
                </span>
                <span>
                  <i className="key-death" />
                  Угасание
                </span>
                <span>
                  <span className="key-line" />
                  Связь
                </span>
              </div>
              {sim.effect && (
                <div className={`effect-notice ${sim.effect.kind}`}>
                  <Zap size={15} />
                  {sim.effect.kind === 'pulse'
                    ? 'Энергетический импульс'
                    : sim.effect.kind === 'storm'
                      ? 'Возмущение среды'
                      : 'Истощение ресурса'}
                  <span>{sim.effect.until - sim.tick} тактов</span>
                </div>
              )}
              <div className="population-overlay">
                <b>{alive.length}</b>
                <span>ОСОБЕЙ</span>
                <i />
                <b>{colonies.length}</b>
                <span>КОЛОНИЙ</span>
              </div>
            </section>
          ) : (
            <section className="analytics-view">
              <div className="eyebrow">ДАННЫЕ ТЕКУЩЕГО ПРОГОНА</div>
              <h2>От импульса к сообществу.</h2>
              <p>
                Изменения на{' '}
                {world.name === 'Земля'
                  ? 'Земле'
                  : world.name === 'Марс'
                    ? 'Марсе'
                    : 'Венере'}{' '}
                · последние {sim.history.length} тактов
              </p>
              <div className="analytics-counters">
                <div>
                  <b>{sim.births}</b>Рождений
                </div>
                <div>
                  <b>{sim.splits}</b>Делений колоний
                </div>
                <div>
                  <b>{sim.deaths}</b>Угасших особей
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
                <div className="large-chart" key={item.name}>
                  <h3>{item.name}</h3>
                  <Sparkline values={item.values} color={item.color} />
                  <span>
                    Такт {sim.history[0]?.tick} <span>{sim.tick}</span>
                  </span>
                </div>
              ))}
              <p className="model-note">
                Рост популяции не доказывает адаптацию. Для проверки сравнивайте
                одинаковые seed с мутациями и без них.
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setModal('replay')}
              >
                <RotateCcw size={15} />
                Проверить воспроизводимость
              </button>
            </section>
          )}
          <div className="time-controls">
            <div>
              <button
                type="button"
                className="play-btn"
                aria-label={running ? 'Пауза' : 'Продолжить'}
                onClick={() => setRunning(!running)}
              >
                {running ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Один такт"
                disabled={running}
                onClick={() => update(step)}
              >
                <SkipForward size={17} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Сбросить эксперимент"
                onClick={() => setModal('reset')}
              >
                <RotateCcw size={15} />
              </button>
              <span className="tick">
                ТАКТ <b>{String(sim.tick).padStart(5, '0')}</b>
              </span>
            </div>
            <div className="speed-controls">
              {[1, 2, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={speed === n ? 'active' : ''}
                  onClick={() => setSpeed(n)}
                >
                  {n}×
                </button>
              ))}
            </div>
            <span className="seed-display">SEED {sim.seed}</span>
          </div>
          <div className="intervention-bar">
            <div>
              <Zap size={15} />
              <span>
                Воздействовать
                <br />
                <small>60 модельных тактов</small>
              </span>
            </div>
            <button
              type="button"
              onClick={() => update((s) => intervene(s, { type: 'pulse' }))}
            >
              <Sparkles size={14} />
              Импульс
            </button>
            <button
              type="button"
              onClick={() => update((s) => intervene(s, { type: 'storm' }))}
            >
              <Waves size={14} />
              Возмущение
            </button>
            <button
              type="button"
              onClick={() => update((s) => intervene(s, { type: 'scarcity' }))}
            >
              <ShieldAlert size={14} />
              Истощение
            </button>
          </div>
          <div className="metric-grid">
            {[
              {
                title: 'Входная мощность',
                value: m.power.toFixed(1),
                unit: 'EU/такт',
                data: history.map((h) => h.power),
                color: '#70e0c4',
              },
              {
                title: 'Задержка сигнала',
                value: m.delay === null ? '—' : m.delay.toFixed(1),
                unit: 'такта',
                data: history.map((h) => h.delay ?? 0),
                color: '#7cc9ff',
              },
              {
                title: 'Использование ресурса',
                value: m.efficiency.toFixed(1),
                unit: '%',
                data: history.map((h) => h.efficiency),
                color: '#ffb66e',
              },
              {
                title: 'Энтропия решений',
                value: m.entropy.toFixed(2),
                unit: 'бит',
                data: history.map((h) => h.entropy),
                color: '#b9a1ff',
              },
            ].map((item) => (
              <article className="lab-metric" key={item.title}>
                <span>{item.title}</span>
                <div>
                  <b>{item.value}</b>
                  <small>{item.unit}</small>
                </div>
                <Sparkline values={item.data} color={item.color} />
              </article>
            ))}
          </div>
        </main>
        <aside className="colonies-panel">
          <div className="panel-heading">
            <span>03</span>
            <h2>Живые сообщества</h2>
            <span className="number-badge">{colonies.length}</span>
          </div>
          <div className="colony-list">
            {colonies.length ? (
              colonies.map((c) => {
                const population = members(sim, c.id);
                const energy =
                  population.reduce((v, i) => v + i.energy, 0) /
                  population.length;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`colony-row ${selected === c.id ? 'selected' : ''}`}
                    style={{ '--colony-color': c.color } as CSSProperties}
                  >
                    <span className="colony-symbol">
                      <GitBranch size={19} />
                    </span>
                    <span>
                      <b>{c.name}</b>
                      <small>
                        {population.length} особей ·{' '}
                        {c.parent ? `потомок C—${pad(c.parent)}` : 'первичная'}
                      </small>
                      <span className="energy-track">
                        <i style={{ width: `${energy}%` }} />
                      </span>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                );
              })
            ) : (
              <div className="empty-state">
                <Leaf size={23} />
                <b>Среда без жизни</b>
                <p>
                  Внесите новые зародыши или восстановите исходный эксперимент.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="seed-button"
            onClick={addColony}
            disabled={alive.length > 172 || colonies.length >= 12}
          >
            <Plus size={15} />
            Внести зародыши
          </button>
          <div className="inspector">
            <div className="eyebrow">
              ИНСПЕКТОР <span>/</span>{' '}
              {colony ? `C—${pad(colony.id)}` : 'ВЫБЕРИТЕ КОЛОНИЮ'}
            </div>
            <h3>
              {colony?.name ?? 'Наблюдение за жизнью'}
              <span
                className="live-dot"
                style={{ background: group.length ? colony?.color : '#f48980' }}
              />
            </h3>
            <div className="inspector-stats">
              <span>
                Поколение
                <b>
                  {group.length
                    ? Math.max(...group.map((i) => i.generation))
                    : '—'}
                </b>
              </span>
              <span>
                Средний запас
                <b>
                  {group.length
                    ? (
                        group.reduce((v, i) => v + i.energy, 0) / group.length
                      ).toFixed(0)
                    : '—'}
                  <small> EU</small>
                </b>
              </span>
            </div>
            <div className="decision-card">
              <div>
                <span className="live-dot" />
                <b>{focused ? ACTIONS[focused.action] : 'Нет живых особей'}</b>
              </div>
              <p>
                {focused
                  ? `Особь #${focused.id}: ${focused.reason}`
                  : 'Колония угасла. Планета продолжает существовать как среда.'}
              </p>
            </div>
          </div>
          <div className="events-heading">
            <h3>Полевой журнал</h3>
            <span>LIVE</span>
          </div>
          <div className="event-list" role="log" aria-live="off" aria-label="Журнал событий">
            {sim.events.slice(0, 5).map((e) => (
              <div className={`lab-event ${e.kind}`} key={e.id}>
                <span className="event-mark" />
                <div>
                  <p>{e.text}</p>
                  <time>ТАКТ {String(e.tick).padStart(5, '0')}</time>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <footer className="lab-footer">
        <span>
          <span className="live-dot" />
          XENOCHOICE <span>/</span> КОД МЫСЛИ 2026
        </span>
        <span>
          Планета — реальная. Формы жизни — гипотетические.{' '}
          <button type="button" onClick={() => setModal('guide')}>
            О модели <ArrowUpRight size={11} />
          </button>
        </span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        className="lab-dialog"
      >
        <button
          type="button"
          className="dialog-close icon-btn"
          aria-label="Закрыть"
          onClick={() => setModal(null)}
        >
          <X size={19} />
        </button>
        {modal === 'guide' && (
          <>
            <div className="eyebrow">ИНСТРУМЕНТ ИССЛЕДОВАТЕЛЯ</div>
            <h2>
              Не управляйте жизнью.
              <br />
              Создавайте условия.
            </h2>
            <p>
              Вы — исследователь, а не участник голосования. Внесите первичные
              структуры, измените доступный ресурс или вызовите возмущение.
              Затем наблюдайте, какие решения помогают сообществам сохраняться.
            </p>
            <ol>
              <li>
                <b>Выберите среду.</b> Реальные планеты имеют разные условия;
                коэффициенты жизни являются допущениями модели.
              </li>
              <li>
                <b>Запустите эксперимент.</b> Светящиеся кристаллы — не люди, а
                небиологические особи. Их цвет обозначает колонию.
              </li>
              <li>
                <b>Измените условия.</b> Импульс усиливает приток, возмущение
                повышает затраты, истощение временно отключает ресурс.
              </li>
              <li>
                <b>Проверьте гипотезу.</b> Изучите причины решений, рождения,
                смерти и отделение дочерних колоний. Экспортируйте результаты.
              </li>
            </ol>
            <div className="dialog-note">
              Модель {MODEL_VERSION}. В браузере работает отдельный
              демонстрационный движок; подключение к серверной научной модели
              ещё не выполнено. EU — условная энергия. Энтропия —
              информационная, не термодинамическая. Задержка — время доставки
              сигнала, а не доказанная задержка реакции.
            </div>
          </>
        )}
        {modal === 'atlas' && (
          <>
            <div className="eyebrow">ТРИ СРЕДЫ · ТРИ ЭКСПЕРИМЕНТА</div>
            <h2>Атлас миров</h2>
            {ids.map((id) => (
              <button
                type="button"
                className="atlas-world"
                key={id}
                onClick={() => {
                  selectWorld(id);
                  setModal(null);
                }}
              >
                <span className={`mini-world ${id}`} />
                <div>
                  <h3>
                    {WORLDS[id].name}{' '}
                    <small>
                      {WORLDS[id].temperature} °C / {WORLDS[id].gravity} м/с²
                    </small>
                  </h3>
                  <p>{WORLDS[id].description}</p>
                </div>
                <ArrowUpRight size={18} />
              </button>
            ))}
            <p className="dialog-note">
              Состояния миров сохраняются при переключении. Время идёт только в
              открытом мире. Средние справочные значения взяты из{' '}
              <a
                href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
                target="_blank"
                rel="noreferrer"
              >
                NASA Planetary Fact Sheet
              </a>
              . Они не описывают все локальные условия поверхности.
            </p>
          </>
        )}
        {modal === 'reset' && (
          <>
            <div className="eyebrow">НОВЫЙ ЗАПУСК</div>
            <h2>Начать эксперимент заново?</h2>
            <p>
              Состояние текущего мира будет заменено тремя первичными колониями.
              Другие миры сохранятся. При необходимости сначала скачайте JSON.
            </p>
            <label className="seed-input">
              Seed
              <input
                type="number"
                min="1"
                max="999999"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </label>
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => download(sim)}
              >
                Скачать текущий
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const nextSeed = Math.max(
                    1,
                    Math.min(999999, Math.floor(Number(seed) || 2048)),
                  );
                  update(() => createSimulation(body, nextSeed));
                  setSelected(1);
                  setSeed(String(nextSeed));
                  setModal(null);
                  setToast('Исходный эксперимент восстановлен');
                }}
              >
                Начать заново
              </button>
            </div>
          </>
        )}
        {modal === 'replay' && (
          <>
            <div className="eyebrow">ВОСПРОИЗВОДИМОСТЬ</div>
            <h2>Повторить тот же эксперимент</h2>
            <p>
              Будут воспроизведены seed {sim.seed}, {sim.tick} тактов и{' '}
              {sim.interventions.length} вмешательств. Сравниваются состояния
              особей и колоний, очереди сигналов, метрики и генератор случайных
              чисел.
            </p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setRunning(false);
                const rebuilt = replay(
                  body,
                  sim.seed,
                  sim.interventions,
                  sim.tick,
                );
                const equal = JSON.stringify(rebuilt) === JSON.stringify(sim);
                setToast(
                  equal
                    ? 'Совпадение 100%: эксперимент воспроизведён'
                    : 'Обнаружено расхождение воспроизведения',
                );
                setModal(null);
              }}
            >
              Воспроизвести и сравнить
            </button>
          </>
        )}
      </dialog>
      {toast && (
        <div className="lab-toast" role="status">
          <span className="live-dot" />
          {toast}
        </div>
      )}
    </div>
  );
};
