import type { GlobeBodyId } from '@/shared/ui/globe';

export const MODEL_VERSION = 'surface-ecology-1.0';
export const COLORS = [
  '#70e0c4',
  '#ffb66e',
  '#b9a1ff',
  '#7cc9ff',
  '#f38bad',
  '#d8e985',
];
export const WORLDS = {
  earth: {
    name: 'Земля',
    english: 'EARTH',
    code: 'SOL / 03',
    temperature: 15,
    gravity: 9.8,
    pressure: 1,
    process: 'Минеральные сети',
    phenomenon: 'Электрические градиенты',
    description:
      'Гипотетические минеральные структуры накапливают заряд и передают импульсы по проводящим связям.',
    color: '#70e0c4',
    harvest: 1.15,
    stress: 0.8,
    signalDelay: 2,
  },
  mars: {
    name: 'Марс',
    english: 'MARS',
    code: 'SOL / 04',
    temperature: -65,
    gravity: 3.7,
    pressure: 0.01,
    process: 'Пылевые резонаторы',
    phenomenon: 'Трибоэлектрические импульсы',
    description:
      'Условные пылевые структуры используют заряд от взаимодействия частиц. Буря усиливает поток и одновременно повреждает связи.',
    color: '#ffb66e',
    harvest: 0.9,
    stress: 1.15,
    signalDelay: 4,
  },
  venus: {
    name: 'Венера',
    english: 'VENUS',
    code: 'SOL / 02',
    temperature: 464,
    gravity: 8.9,
    pressure: 92,
    process: 'Тепловые структуры',
    phenomenon: 'Локальные тепловые градиенты',
    description:
      'Гипотетические структуры используют перепады температуры. Высокая средняя температура сама по себе не является источником полезной работы.',
    color: '#d8bd80',
    harvest: 1.35,
    stress: 1.4,
    signalDelay: 3,
  },
} satisfies Record<
  GlobeBodyId,
  {
    name: string;
    english: string;
    code: string;
    temperature: number;
    gravity: number;
    pressure: number;
    process: string;
    phenomenon: string;
    description: string;
    color: string;
    harvest: number;
    stress: number;
    signalDelay: number;
  }
>;

export type Action = 'accumulate' | 'signal' | 'divide' | 'starve';
export const ACTIONS: Record<Action, string> = {
  accumulate: 'Накапливает ресурс',
  signal: 'Передаёт импульс',
  divide: 'Воспроизводится',
  starve: 'Экономит ресурс',
};
export type Individual = {
  id: number;
  colony: number;
  parent: number | null;
  lat: number;
  lon: number;
  energy: number;
  threshold: number;
  memory: number;
  born: number;
  generation: number;
  dead: number | null;
  action: Action;
  reason: string;
};
export type Colony = {
  id: number;
  parent: number | null;
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
export type Intervention = {
  tick: number;
  type: 'seed' | 'pulse' | 'storm' | 'scarcity' | 'settings';
  settings?: Settings;
};
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
  body: GlobeBodyId;
  seed: number;
  rng: number;
  tick: number;
  individuals: Individual[];
  colonies: Colony[];
  packets: Packet[];
  events: Event[];
  interventions: Intervention[];
  history: Metric[];
  settings: Settings;
  effect: { kind: 'pulse' | 'storm' | 'scarcity'; until: number } | null;
  nextId: number;
  nextColony: number;
  nextEvent: number;
  input: number;
  spent: number;
  initial: number;
  delivered: number;
  delayTotal: number;
  births: number;
  deaths: number;
  splits: number;
};
const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));
function random(s: Simulation) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
function event(s: Simulation, kind: Event['kind'], text: string) {
  s.events.unshift({ id: s.nextEvent++, tick: s.tick, kind, text });
  s.events = s.events.slice(0, 100);
}
export function living(s: Simulation) {
  return s.individuals.filter((i) => i.dead === null);
}
export function members(s: Simulation, colony: number) {
  return living(s).filter((i) => i.colony === colony);
}
export function activeColonies(s: Simulation) {
  return s.colonies.filter((c) =>
    s.individuals.some((i) => i.colony === c.id && i.dead === null),
  );
}
export function position(
  i: Pick<Individual, 'lat' | 'lon'>,
  radius = 2.33,
): [number, number, number] {
  return [
    radius * Math.cos(i.lat) * Math.sin(i.lon),
    radius * Math.sin(i.lat),
    radius * Math.cos(i.lat) * Math.cos(i.lon),
  ];
}
function seedColony(s: Simulation) {
  if (living(s).length > 172 || activeColonies(s).length >= 12) return;
  const c = s.nextColony++;
  const lat = (random(s) - 0.5) * 1.65;
  const lon = (random(s) - 0.5) * 3.7;
  s.colonies.push({
    id: c,
    parent: null,
    born: s.tick,
    name: `Колония ${String(c).padStart(2, '0')}`,
    color: COLORS[(c - 1) % COLORS.length],
  });
  for (let j = 0; j < 8; j++) {
    const energy = 35 + random(s) * 25;
    s.initial += energy;
    s.individuals.push({
      id: s.nextId++,
      colony: c,
      parent: null,
      lat: clamp(lat + (random(s) - 0.5) * 0.28, -1.4, 1.4),
      lon: lon + (random(s) - 0.5) * 0.32,
      energy,
      threshold: 58 + random(s) * 12,
      memory: 0,
      born: s.tick,
      generation: 0,
      dead: null,
      action: 'accumulate',
      reason: 'Первичный зародыш. Накапливает ресурс среды.',
    });
  }
  event(s, 'seed', `${s.colonies.at(-1)?.name}: внесены 8 первичных структур`);
}
export function createSimulation(body: GlobeBodyId, seed = 2048): Simulation {
  const s: Simulation = {
    body,
    seed,
    rng: seed >>> 0,
    tick: 0,
    individuals: [],
    colonies: [],
    packets: [],
    events: [],
    interventions: [],
    history: [],
    settings: { resource: 68, noise: 18, mutation: true },
    effect: null,
    nextId: 1,
    nextColony: 1,
    nextEvent: 1,
    input: 0,
    spent: 0,
    initial: 0,
    delivered: 0,
    delayTotal: 0,
    births: 0,
    deaths: 0,
    splits: 0,
  };
  seedColony(s);
  seedColony(s);
  seedColony(s);
  s.history.push(metric(s, 0));
  return s;
}
export function intervene(
  state: Simulation,
  command: Omit<Intervention, 'tick'>,
): Simulation {
  const s = structuredClone(state);
  s.interventions.push({ ...command, tick: s.tick });
  if (command.type === 'seed') seedColony(s);
  else if (command.type === 'settings' && command.settings) {
    s.settings = {
      resource: clamp(command.settings.resource, 0, 100),
      noise: clamp(command.settings.noise, 0, 100),
      mutation: !!command.settings.mutation,
    };
    event(s, 'environment', 'Исследователь изменил параметры среды');
  } else if (command.type !== 'settings') {
    s.effect = { kind: command.type, until: s.tick + 60 };
    event(
      s,
      'environment',
      {
        pulse: 'Импульс: приток ресурса усилен на 60 тактов',
        storm: 'Возмущение: шум и затраты возросли на 60 тактов',
        scarcity: 'Истощение: приток отключён на 60 тактов',
      }[command.type],
    );
  }
  return s;
}
function metric(s: Simulation, received: number): Metric {
  const alive = living(s),
    counts: Record<Action, number> = {
      accumulate: 0,
      signal: 0,
      divide: 0,
      starve: 0,
    };
  for (const i of alive) counts[i.action]++;
  const entropy = Object.values(counts).reduce((sum, n) => {
    const p = n / alive.length;
    return n ? sum - p * Math.log2(p) : sum;
  }, 0);
  return {
    tick: s.tick,
    population: alive.length,
    colonies: activeColonies(s).length,
    power: received,
    efficiency:
      s.input + s.initial
        ? Math.min(100, (s.spent / (s.input + s.initial)) * 100)
        : 0,
    entropy,
    delay: s.delivered ? s.delayTotal / s.delivered : null,
  };
}
export function step(state: Simulation): Simulation {
  const s = structuredClone(state);
  s.tick++;
  const world = WORLDS[s.body];
  if (s.effect && s.tick > s.effect.until) {
    event(
      s,
      'environment',
      'Воздействие завершено · базовые условия восстановлены',
    );
    s.effect = null;
  }
  const alive = living(s),
    receivedPackets = s.packets.filter((p) => p.arrival <= s.tick);
  s.packets = s.packets.filter((p) => p.arrival > s.tick);
  for (const p of receivedPackets) {
    const target = alive.find((i) => i.id === p.to);
    if (target) {
      target.energy = Math.min(100, target.energy + p.energy);
      target.memory += p.energy * 0.1;
      s.delivered++;
      s.delayTotal += p.arrival - p.sent;
    }
  }
  let input = 0;
  for (const i of alive) {
    const noise =
      s.settings.noise / 100 + (s.effect?.kind === 'storm' ? 0.7 : 0);
    const field = 0.7 + 0.3 * Math.cos(i.lat * 3 + s.tick * 0.025);
    // Real gravity affects maintenance; environmental coefficients are model assumptions.
    const flow = Math.max(
      0,
      (s.settings.resource / 100) *
        world.harvest *
        3.1 *
        field *
        (1 + (random(s) - 0.5) * noise),
    );
    const incoming =
      s.effect?.kind === 'scarcity'
        ? 0
        : flow * (s.effect?.kind === 'pulse' ? 2.4 : 1);
    const accepted = Math.min(100 - i.energy, incoming);
    input += Math.max(0, accepted);
    s.input += Math.max(0, accepted);
    const cost =
      0.38 +
      world.gravity * 0.024 +
      world.stress * noise * 0.75 +
      (s.effect?.kind === 'storm' ? 0.9 : 0);
    i.energy = Math.min(100, i.energy + incoming);
    const used = Math.min(i.energy, cost);
    s.spent += used;
    i.energy -= used;
    i.memory = i.memory * 0.9 + (incoming - cost) * 0.1;
    if (i.energy <= 0.001) {
      i.dead = s.tick;
      s.deaths++;
      i.reason =
        'Ресурс исчерпан: поступление не покрывает поддержание структуры.';
      event(s, 'death', `Особь #${i.id} угасла · дефицит ресурса`);
      continue;
    }
    i.action = i.energy < 18 ? 'starve' : 'accumulate';
    i.reason =
      i.energy < 18
        ? 'Низкий запас. Сигналы и деление приостановлены.'
        : `Запас ${i.energy.toFixed(1)} EU; порог деления ${i.threshold.toFixed(1)} EU. Память потока ${i.memory.toFixed(2)}.`;
  }
  const survivors = alive.filter((i) => i.dead === null);
  for (const i of survivors) {
    if (
      i.energy > i.threshold &&
      s.tick - i.born > 12 &&
      living(s).length < 180
    ) {
      const childEnergy = (i.energy - 4) * 0.45;
      i.energy -= childEnergy + 4;
      s.spent += 4;
      const mutation = (random(s) - 0.5) * (s.settings.mutation ? 7 : 0);
      const child: Individual = {
        ...i,
        id: s.nextId++,
        parent: i.id,
        lat: clamp(i.lat + (random(s) - 0.5) * 0.15, -1.4, 1.4),
        lon: i.lon + (random(s) - 0.5) * 0.18,
        energy: childEnergy,
        threshold: clamp(i.threshold + mutation, 48, 88),
        generation: i.generation + 1,
        born: s.tick,
        dead: null,
        action: 'accumulate',
        reason: `Потомок #${i.id}. Порог наследован${s.settings.mutation ? ' с мутацией' : ' без мутации'}.`,
      };
      s.individuals.push(child);
      s.births++;
      i.action = 'divide';
      i.reason = `Ресурс превысил порог: создана особь #${child.id}. Передано ${childEnergy.toFixed(1)} EU, стоимость 4 EU.`;
      event(
        s,
        'birth',
        `Особь #${child.id} родилась · поколение ${child.generation}`,
      );
    } else if (i.energy > 28 && s.tick % 5 === i.id % 5) {
      const target = survivors
        .filter(
          (n) =>
            n.id !== i.id &&
            n.energy < i.energy - 8 &&
            Math.hypot(n.lat - i.lat, n.lon - i.lon) < 0.75,
        )
        .sort((a, b) => a.energy - b.energy || a.id - b.id)[0];
      if (target) {
        i.energy -= 2;
        s.packets.push({
          from: i.id,
          to: target.id,
          sent: s.tick,
          arrival: s.tick + world.signalDelay,
          energy: 1.8,
        });
        i.action = 'signal';
        i.reason = `Сосед #${target.id} испытывает дефицит. Передано 2 EU, потери 10%, задержка ${world.signalDelay} такта.`;
      }
    }
  }
  // Budding separates an existing connected family; no new energy or individuals are created.
  for (const c of [...s.colonies]) {
    const group = members(s, c.id);
    if (
      group.length >= 18 &&
      s.tick - c.born >= 25 &&
      activeColonies(s).length < 12
    ) {
      const id = s.nextColony++;
      const daughter = group.slice(Math.floor(group.length / 2));
      for (const i of daughter) {
        i.colony = id;
        i.lon += 0.13;
      }
      s.colonies.push({
        id,
        parent: c.id,
        born: s.tick,
        name: `Колония ${String(id).padStart(2, '0')}`,
        color: COLORS[(id - 1) % COLORS.length],
      });
      s.splits++;
      event(
        s,
        'split',
        `Колония ${String(c.id).padStart(2, '0')} → ${String(id).padStart(2, '0')} · отделились ${daughter.length} особей`,
      );
    }
  }
  s.individuals = s.individuals.filter(
    (i) => i.dead === null || s.tick - i.dead < 16,
  );
  s.history.push(metric(s, input));
  if (s.history.length > 1200) s.history.shift();
  return s;
}
export function replay(
  body: GlobeBodyId,
  seed: number,
  interventions: Intervention[],
  ticks: number,
): Simulation {
  let state = createSimulation(body, seed);
  for (let t = 0; t <= ticks; t++) {
    for (const e of interventions.filter((e) => e.tick === t))
      state = intervene(state, e);
    if (t < ticks) state = step(state);
  }
  return state;
}
