import type { World } from '@/shared/api/xenochoice';
import type { GlobeBodyId } from '@/shared/ui/globe';

/** Physical property row for the home-page planet dossier. */
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

/** Catalog keyed by body; a missing entry means `/worlds` has not provided it. */
export type PlanetInfoCatalog = Partial<Record<GlobeBodyId, PlanetInfo>>;

const formatTemp = (celsius: number) => {
  const rounded = Math.round(celsius);
  return rounded > 0 ? `+${rounded}` : String(rounded);
};

const formatNumber = (n: number, digits = 2) => {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(digits).replace(/\.?0+$/, '');
};

/** Dossier built from a live `/worlds` entry — NASA reference plus scenario. */
export const worldToPlanetInfo = (world: World): PlanetInfo => ({
  id: world.id,
  name: world.name,
  summary: world.description,
  stats: [
    {
      label: 'Температура',
      value: formatTemp(world.reference.meanTemperatureCelsius),
      unit: '°C',
    },
    {
      label: 'Кельвин',
      value: String(Math.round(world.reference.temperatureKelvin)),
      unit: 'K',
    },
    {
      label: 'Гравитация',
      value: formatNumber(world.reference.gravity, 1),
      unit: 'м/с²',
    },
    {
      label: 'Давление',
      value: formatNumber(world.reference.surfacePressureBar, 2),
      unit: 'бар',
    },
    {
      label: 'Приток',
      value: formatNumber(world.scenario.baseFlow, 1),
      unit: 'EU',
    },
    {
      label: 'Шум',
      value: formatNumber(world.scenario.noiseAmplitude, 2),
    },
  ],
});

export const worldsToPlanetInfoMap = (
  worlds: World[] | undefined,
): PlanetInfoCatalog => {
  const map: PlanetInfoCatalog = {};
  for (const world of worlds ?? []) {
    map[world.id] = worldToPlanetInfo(world);
  }
  return map;
};
