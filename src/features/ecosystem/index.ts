// ═══════════════════════════════════════════
// ECOSYSTEM EXPORT CATALOG
// ═══════════════════════════════════════════

export type {
  Action,
  AdapterCarry,
  Colony,
  Event,
  Individual,
  Metric,
  Packet,
  Settings,
  Simulation,
} from './model';
export {
  ACTIONS,
  activeColonies,
  createAdapterCarry,
  emptySimulation,
  living,
  logIntervention,
  members,
  numericId,
  position,
  remoteColonyId,
  remoteIndividualId,
  snapshotToSimulation,
} from './model';
export { SurfaceLife } from './surface-life';
export {
  LOW_ENERGY_THRESHOLD,
  SURFACE_MARKER,
  VIEWPORT_LEGEND,
} from './surface-markers';
export type { ViewportLegendKind } from './surface-markers';
export type { WorldCatalogState } from './use-world-catalog';
export { useWorldCatalog } from './use-world-catalog';
export type { WorldCatalog, WorldInfo } from './world-info';
export {
  MODEL_VERSION,
  WORLD_COLORS,
  worldsToInfoMap,
  worldToInfo,
} from './world-info';
