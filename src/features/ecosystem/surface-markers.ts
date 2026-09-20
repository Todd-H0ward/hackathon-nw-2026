/**
 * Marker colors for surface life / viewport legend.
 * Keep in sync with `surface-life.tsx` and `research-scene.tsx`.
 */
export const SURFACE_MARKER = {
  /** Fallback when colony has no color. */
  individual: '#70e0c4',
  /** Default colony builder / legend sample. */
  colonySample: '#81d6b9',
  /** Action `divide`. */
  divide: '#ffffff',
  /** Energy below {@link LOW_ENERGY_THRESHOLD}. */
  lowEnergy: '#ff805e',
  /** Dead individual (death fade). */
  dead: '#ff5d66',
  /** In-transit resource packet. */
  packet: '#ffffff',
  /** Colony draft drop pin. */
  draft: '#ffcd70',
} as const;

/** Individuals below this energy use {@link SURFACE_MARKER.lowEnergy}. */
export const LOW_ENERGY_THRESHOLD = 18;

export type ViewportLegendKind = 'diamond' | 'line' | 'packet' | 'pin';

/** Legend rows for the sandbox viewport modal. */
export const VIEWPORT_LEGEND: ReadonlyArray<{
  key: string;
  label: string;
  hint: string;
  kind: ViewportLegendKind;
  color: string;
}> = [
  {
    key: 'individual',
    label: 'Особь',
    hint: 'Живая особь в цвете своей колонии',
    kind: 'diamond',
    color: SURFACE_MARKER.colonySample,
  },
  {
    key: 'divide',
    label: 'Деление',
    hint: 'Особь выполняет действие DIVIDE',
    kind: 'diamond',
    color: SURFACE_MARKER.divide,
  },
  {
    key: 'lowEnergy',
    label: 'Низкая энергия',
    hint: `Запас энергии ниже ${LOW_ENERGY_THRESHOLD} EU`,
    kind: 'diamond',
    color: SURFACE_MARKER.lowEnergy,
  },
  {
    key: 'dead',
    label: 'Угасание',
    hint: 'Особь погибла и постепенно исчезает',
    kind: 'diamond',
    color: SURFACE_MARKER.dead,
  },
  {
    key: 'link',
    label: 'Связь / контур',
    hint: 'Контур колонии и связи между особями (кнопка «Связи»)',
    kind: 'line',
    color: SURFACE_MARKER.colonySample,
  },
  {
    key: 'packet',
    label: 'Передача',
    hint: 'Пакет ресурса в пути между особями',
    kind: 'packet',
    color: SURFACE_MARKER.packet,
  },
  {
    key: 'draft',
    label: 'Точка размещения',
    hint: 'Место будущей колонии при создании',
    kind: 'pin',
    color: SURFACE_MARKER.draft,
  },
];
