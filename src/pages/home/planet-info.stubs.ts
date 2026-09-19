import type { GlobeBodyId } from '@/shared/ui/globe';

/** Physical property row — shape matches a future API payload. */
export type PlanetStat = {
  label: string;
  value: string;
  unit?: string;
};

export type PlanetInfo = {
  id: GlobeBodyId;
  name: string;
  summary: string;
  stats: PlanetStat[];
};

/** Stub catalog until planet details arrive from the backend. */
export const PLANET_INFO_STUBS: Record<GlobeBodyId, PlanetInfo> = {
  earth: {
    id: 'earth',
    name: 'Земля',
    summary:
      'Каменистая планета в зоне обитаемости с жидкой водой и азотно-кислородной атмосферой.',
    stats: [
      { label: 'Масса', value: '5.97×10²⁴', unit: 'кг' },
      { label: 'Радиус', value: '6 371', unit: 'км' },
      { label: 'Гравитация', value: '9.81', unit: 'м/с²' },
      { label: 'Сутки', value: '23.9', unit: 'ч' },
      { label: 'Год', value: '365.3', unit: 'сут' },
      { label: 'Температура', value: '15', unit: '°C' },
    ],
  },
  mars: {
    id: 'mars',
    name: 'Марс',
    summary:
      'Холодная пустынная планета с тонкой атмосферой CO₂ и следами древней воды.',
    stats: [
      { label: 'Масса', value: '6.42×10²³', unit: 'кг' },
      { label: 'Радиус', value: '3 390', unit: 'км' },
      { label: 'Гравитация', value: '3.72', unit: 'м/с²' },
      { label: 'Сутки', value: '24.6', unit: 'ч' },
      { label: 'Год', value: '687', unit: 'сут' },
      { label: 'Температура', value: '−63', unit: '°C' },
    ],
  },
  venus: {
    id: 'venus',
    name: 'Венера',
    summary:
      'Плотная парниковая атмосфера и экстремальный жар поверхности под плотными облаками.',
    stats: [
      { label: 'Масса', value: '4.87×10²⁴', unit: 'кг' },
      { label: 'Радиус', value: '6 052', unit: 'км' },
      { label: 'Гравитация', value: '8.87', unit: 'м/с²' },
      { label: 'Сутки', value: '243', unit: 'сут' },
      { label: 'Год', value: '224.7', unit: 'сут' },
      { label: 'Температура', value: '464', unit: '°C' },
    ],
  },
};

export const getPlanetInfo = (id: GlobeBodyId): PlanetInfo =>
  PLANET_INFO_STUBS[id];
