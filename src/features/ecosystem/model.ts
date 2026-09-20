/**
 * Adapts XenoChoice backend snapshots (`@/shared/api/xenochoice`) into the
 * shape the lab UI and the 3D scene (`surface-life.tsx`) already render.
 *
 * The backend is authoritative for everything biological — positions,
 * energy, decisions, colonies, metrics. A handful of things it does not
 * report are tracked here, client-side, and are clearly the exception:
 *  - `dead`: the tick an individual was first observed dead (for the fade
 *    animation) — the backend only gives a boolean `alive` flag.
 *  - `events`: a short human-readable log, synthesized by diffing
 *    consecutive snapshots (real transitions, not fabricated data).
 *  - `settings` / `effect`: optimistic UI state for the resource/noise
 *    sliders and the intervention banner — the backend has no "current
 *    settings" or "active effect" endpoint, only one-shot interventions.
 */
import type {
  DecisionAction,
  Colony as RemoteColony,
  Individual as RemoteIndividual,
  StateSnapshot,
} from '@/shared/api/xenochoice';
import type { GlobeBodyId } from '@/shared/ui/globe';

const DEG2RAD = Math.PI / 180;
/** How many ticks a dead individual stays rendered (fading out), like before. */
const DEATH_FADE_TICKS = 16;

export type Action = 'accumulate' | 'signal' | 'divide' | 'grow' | 'starve';
export const ACTIONS: Record<Action, string> = {
  accumulate: 'Накапливает ресурс',
  grow: 'Наращивает структуру',
  signal: 'Передаёт импульс',
  divide: 'Воспроизводится',
  starve: 'Экономит ресурс',
};

export type Individual = {
  id: number;
  remoteId: string;
  colony: number;
  lat: number;
  lon: number;
  energy: number;
  born: number;
  generation: number;
  dead: number | null;
  action: Action;
  reason: string;
};

export type Colony = {
  id: number;
  remoteId: string;
  /** True for a colony present at tick 0 (a founding colony, not a later split). */
  primary: boolean;
  born: number;
  name: string;
  color: string;
};

export type Event = {
  id: number;
  tick: number;
  kind: 'birth' | 'death' | 'split' | 'environment' | 'seed';
  text: string;
};

export type Settings = { resource: number; noise: number; mutation: boolean };

export type Packet = {
  from: number;
  to: number;
  sent: number;
  arrival: number;
  energy: number;
};

export type Metric = {
  tick: number;
  population: number;
  colonies: number;
  power: number;
  efficiency: number;
  entropy: number;
  delay: number | null;
};

export type Simulation = {
  snapshot?: StateSnapshot;
  body: GlobeBodyId;
  seed: number;
  tick: number;
  status: StateSnapshot['status'];
  checksum: string;
  individuals: Individual[];
  colonies: Colony[];
  packets: Packet[];
  events: Event[];
  interventions: { tick: number; type: string }[];
  history: Metric[];
  settings: Settings;
  effect: { kind: 'pulse' | 'storm' | 'scarcity'; until: number } | null;
  births: number;
  deaths: number;
  splits: number;
};

export const living = (s: Simulation) =>
  s.individuals.filter((i) => i.dead === null);

export const members = (s: Simulation, colony: number) =>
  living(s).filter((i) => i.colony === colony);

export const activeColonies = (s: Simulation) =>
  s.colonies.filter((c) =>
    s.individuals.some((i) => i.colony === c.id && i.dead === null),
  );

export const position = (
  i: Pick<Individual, 'lat' | 'lon'>,
  radius = 2.33,
): [number, number, number] => {
  return [
    radius * Math.cos(i.lat) * Math.sin(i.lon),
    radius * Math.sin(i.lat),
    radius * Math.cos(i.lat) * Math.cos(i.lon),
  ];
};

/** Best-effort short id (`ind-07` -> 7) for the numeric ids the UI/3D layer expects. */
const numericId = (remoteId: string): number => {
  const digits = remoteId.match(/(\d+)$/)?.[1];
  if (digits) return parseInt(digits, 10);
  let hash = 0;
  for (let i = 0; i < remoteId.length; i++) {
    hash = (hash * 31 + remoteId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const mapAction = (individual: RemoteIndividual): Action => {
  if (!individual.alive) return 'starve';
  if (individual.starvationTicks > 0) return 'starve';
  const selected: DecisionAction | undefined =
    individual.lastDecision?.selectedAction;
  if (selected === 'GROW') return 'grow';
  if (selected === 'DIVIDE') return 'divide';
  if (selected === 'TRANSFER') return 'signal';
  return 'accumulate';
};

const reasonFor = (individual: RemoteIndividual): string => {
  if (!individual.alive) {
    return 'Особь угасла: ресурс исчерпан или структура разрушена.';
  }
  return (
    individual.lastDecision?.reasoning ??
    'Первичный зародыш. Ожидает первого решения.'
  );
};

/**
 * The live backend reports efficiency as a 0..1 fraction while the swagger
 * example shows whole percents — accept either rather than render "7980 %".
 */
const efficiencyPercent = (raw: number) => {
  const percent = raw;
  return Math.min(100, Math.max(0, percent));
};

/** Per-body, cross-tick state the backend does not report — see file header. */
export type AdapterCarry = {
  bootstrapped: boolean;
  deadSince: Map<number, number>;
  knownIndividualIds: Set<number>;
  aliveIds: Set<number>;
  knownColonyIds: Set<number>;
  events: Event[];
  nextEventId: number;
  history: Metric[];
  interventions: { tick: number; type: string }[];
  settings: Settings;
  effect: Simulation['effect'];
};

export const createAdapterCarry = (): AdapterCarry => ({
  bootstrapped: false,
  deadSince: new Map(),
  knownIndividualIds: new Set(),
  aliveIds: new Set(),
  knownColonyIds: new Set(),
  events: [],
  nextEventId: 1,
  history: [],
  interventions: [],
  settings: { resource: 68, noise: 18, mutation: true },
  effect: null,
});

const pushEvent = (
  carry: AdapterCarry,
  tick: number,
  kind: Event['kind'],
  text: string,
) => {
  carry.events.unshift({ id: carry.nextEventId++, tick, kind, text });
  if (carry.events.length > 100) carry.events.length = 100;
};

/** Diffs `snapshot` against what `carry` last saw and logs real transitions. */
const syncEvents = (snapshot: StateSnapshot, carry: AdapterCarry) => {
  const { tick } = snapshot;
  const individuals = snapshot.individuals ?? [];
  const colonies = snapshot.colonies ?? [];

  if (!carry.bootstrapped) {
    pushEvent(
      carry,
      tick,
      'seed',
      `Эксперимент инициализирован: ${colonies.length} колоний, ${individuals.length} особей`,
    );
    for (const c of colonies) carry.knownColonyIds.add(numericId(c.id));
    for (const i of individuals) {
      carry.knownIndividualIds.add(numericId(i.id));
      if (i.alive) carry.aliveIds.add(numericId(i.id));
    }
    carry.bootstrapped = true;
    return;
  }

  for (const c of colonies) {
    const id = numericId(c.id);
    if (!carry.knownColonyIds.has(id)) {
      carry.knownColonyIds.add(id);
      pushEvent(
        carry,
        tick,
        'split',
        `${c.name}: новое сообщество сформировано`,
      );
    }
  }

  const nowAlive = new Set<number>();
  for (const i of individuals) {
    const id = numericId(i.id);
    if (!carry.knownIndividualIds.has(id)) {
      carry.knownIndividualIds.add(id);
      if (i.alive) {
        pushEvent(
          carry,
          tick,
          'birth',
          `Особь #${id} родилась · поколение ${i.generation}`,
        );
      }
    }
    if (i.alive) {
      nowAlive.add(id);
    } else if (carry.aliveIds.has(id)) {
      pushEvent(carry, tick, 'death', `Особь #${id} угасла · дефицит ресурса`);
    }
  }
  carry.aliveIds = nowAlive;
};

/** Turns a raw backend snapshot into the `Simulation` shape the UI expects. */
export const snapshotToSimulation = (
  body: GlobeBodyId,
  seed: number,
  snapshot: StateSnapshot,
  carry: AdapterCarry,
): Simulation => {
  if (snapshot.tick < (carry.history.at(-1)?.tick ?? 0)) {
    Object.assign(carry, createAdapterCarry());
  }
  syncEvents(snapshot, carry);
  carry.settings = {
    resource: Math.round(snapshot.flow * 50),
    noise: Math.round(snapshot.noise * 100),
    mutation: snapshot.mode === 'evolutionary',
  };
  carry.interventions = (snapshot.interventions ?? [])
    .filter((i) => i.tick <= snapshot.tick)
    .map((i) => ({ tick: i.tick, type: i.type }));

  if (carry.effect && snapshot.tick > carry.effect.until) {
    carry.effect = null;
  }

  const individuals: Individual[] = [];
  // The swagger schema omits `signals`/`inTransit` that the live API sends, so
  // treat every collection as optional rather than trusting either contract.
  for (const remote of snapshot.individuals ?? []) {
    const id = numericId(remote.id);
    if (remote.alive) {
      carry.deadSince.delete(id);
    } else if (!carry.deadSince.has(id)) {
      carry.deadSince.set(id, snapshot.tick);
    }
    const dead = remote.alive
      ? null
      : (carry.deadSince.get(id) ?? snapshot.tick);
    if (dead !== null && snapshot.tick - dead >= DEATH_FADE_TICKS) continue;

    individuals.push({
      id,
      remoteId: remote.id,
      colony: numericId(remote.colonyId),
      lat: remote.lat * DEG2RAD,
      lon: remote.lng * DEG2RAD,
      energy: remote.energy,
      born: remote.birthTick,
      generation: remote.generation,
      dead,
      action: mapAction(remote),
      reason: reasonFor(remote),
    });
  }

  const colonies: Colony[] = (snapshot.colonies ?? []).map(
    (c: RemoteColony) => ({
      id: numericId(c.id),
      remoteId: c.id,
      primary: !c.parentColonyId,
      born: c.formedAtTick,
      name: c.name,
      color: c.color,
    }),
  );

  const packets: Packet[] = (snapshot.inTransit ?? []).map((s) => ({
    from: numericId(s.senderId),
    to: numericId(s.receiverId),
    sent: s.emittedTick,
    arrival: s.deliveryTick,
    energy: s.netEnergy,
  }));

  const remoteMetrics = snapshot.metrics;
  const metric: Metric = {
    tick: remoteMetrics.tick ?? snapshot.tick,
    population: remoteMetrics.population ?? individuals.length,
    colonies: remoteMetrics.activeColonies ?? colonies.length,
    power: remoteMetrics.inputPower ?? 0,
    efficiency: efficiencyPercent(remoteMetrics.efficiency ?? 0),
    entropy: remoteMetrics.decisionEntropy ?? 0,
    delay: remoteMetrics.responseMeasured
      ? remoteMetrics.responseLatency
      : null,
  };
  if (carry.history.at(-1)?.tick !== metric.tick) {
    carry.history.push(metric);
    if (carry.history.length > 1200) carry.history.shift();
  }

  return {
    snapshot,
    body,
    seed,
    tick: snapshot.tick,
    status: snapshot.status,
    checksum: snapshot.checksum,
    individuals,
    colonies,
    packets,
    events: carry.events,
    interventions: carry.interventions,
    history: carry.history,
    settings: carry.settings,
    effect: carry.effect,
    births: remoteMetrics.birthsTotal ?? 0,
    deaths: remoteMetrics.deathsTotal ?? 0,
    splits: remoteMetrics.colonySplitsTotal ?? 0,
  };
};

/** Records an intervention the client just sent (server doesn't echo a running log). */
export const logIntervention = (
  carry: AdapterCarry,
  tick: number,
  type: string,
) => {
  carry.interventions.push({ tick, type });
};

/** Placeholder sim shown while the first API snapshot is in flight. */
export const emptySimulation = (
  body: GlobeBodyId,
  seed = 2048,
): Simulation => ({
  body,
  seed,
  tick: 0,
  status: 'ready',
  checksum: '',
  individuals: [],
  colonies: [],
  packets: [],
  events: [],
  interventions: [],
  history: [],
  settings: { resource: 68, noise: 18, mutation: true },
  effect: null,
  births: 0,
  deaths: 0,
  splits: 0,
});

export const remoteIndividualId = (s: Simulation, id: number) =>
  s.individuals.find((i) => i.id === id)?.remoteId ?? null;

export const remoteColonyId = (s: Simulation, id: number) =>
  s.colonies.find((c) => c.id === id)?.remoteId ?? null;
