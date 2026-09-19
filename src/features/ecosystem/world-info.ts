import type { World } from '@/shared/api/xenochoice';
import type { GlobeBodyId } from '@/shared/ui/globe';

/** Matches the live engine behind `/api/v2`. */
export const MODEL_VERSION = 'xenochoice-api-v2';

/** Accent colors used by the lab chrome (not provided by the API). */
export const WORLD_COLORS: Record<GlobeBodyId, string> = {
  earth: '#70e0c4',
  mars: '#ffb66e',
  venus: '#d8bd80',
};

/** Human label for `world.model.organismType` — falls back to a humanized slug. */
const ORGANISM_LABELS: Record<string, string> = {
  mineral_conductive: 'Электрические градиенты',
  dust_resonator: 'Трибоэлектрические импульсы',
  thermal_structure: 'Локальные тепловые градиенты',
};

const humanize = (slug: string) =>
  slug.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Orbital position from the Sun — cosmetic flavor, not part of the API. */
const SOL_POSITION: Record<GlobeBodyId, string> = {
  venus: 'SOL / 02',
  earth: 'SOL / 03',
  mars: 'SOL / 04',
};

/** Display-facing planet info, derived entirely from `/worlds`. */
export type WorldInfo = {
  id: GlobeBodyId;
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
  baseFlow: number;
  noiseAmplitude: number;
  /** Engine ceilings from `world.model` — the lab must not offer to exceed them. */
  maxPopulation: number;
  maxColonies: number;
};

export const worldToInfo = (world: World): WorldInfo => ({
  id: world.id,
  name: world.name,
  english: world.reference.bodyName.toUpperCase(),
  code: SOL_POSITION[world.id],
  temperature: Math.round(world.reference.meanTemperatureCelsius),
  gravity: world.reference.gravity,
  pressure: world.reference.surfacePressureBar,
  process: world.scenario.regionName,
  phenomenon:
    ORGANISM_LABELS[world.model.organismType] ??
    humanize(world.model.organismType),
  description: world.description,
  color: WORLD_COLORS[world.id],
  baseFlow: world.scenario.baseFlow,
  noiseAmplitude: world.scenario.noiseAmplitude,
  maxPopulation: world.model.maxPopulation,
  maxColonies: world.model.maxColonies,
});

/**
 * Planet catalog keyed by body. Bodies missing from `/worlds` stay absent —
 * there are no offline placeholders, so the UI must skip what it cannot show.
 */
export type WorldCatalog = Partial<Record<GlobeBodyId, WorldInfo>>;

export const worldsToInfoMap = (worlds: World[] | undefined): WorldCatalog => {
  const map: WorldCatalog = {};
  for (const world of worlds ?? []) {
    map[world.id] = worldToInfo(world);
  }
  return map;
};
