/**
 * Colors and legend for the surface life layer (sandbox viewport).
 * Keep in sync with `surface-life.tsx` and `research-scene.tsx`.
 */

// ═══════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════

/** Marker palette on the sphere. */
export const SURFACE_MARKER = {
  /** Living individual without a colony color (fallback). */
  individual: '#70e0c4',
  /** Colony sample in the legend / builder. */
  colonySample: '#81d6b9',
  /** Individual performing DIVIDE. */
  divide: '#ffffff',
  /** Energy below {@link LOW_ENERGY_THRESHOLD}. */
  lowEnergy: '#ff805e',
  /** Dead individual (fade-out). */
  dead: '#ff5d66',
  /** Resource packet in transit (head on arc). */
  packet: '#ffffff',
  /** Draft pin for a new colony. */
  draft: '#ffcd70',
} as const;

/** EU threshold: below this the marker shows low energy. */
export const LOW_ENERGY_THRESHOLD = 18;

// ═══════════════════════════════════════════
// LEGEND
// ═══════════════════════════════════════════

/** Icon kind in the map legend panel. */
export type ViewportLegendKind = 'diamond' | 'line' | 'packet' | 'pin';

/** Viewport legend rows (toolbar "?" button). */
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
    hint: 'Живая особь в цвете своей колонии (кристалл-октаэдр)',
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
    hint: 'Контур колонии и дуги между особями (кнопка «Связи»)',
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
