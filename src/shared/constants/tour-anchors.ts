/** data-tour anchors for lab step-by-step onboarding. */

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

export const TOUR_ANCHORS = {
  ROLE: 'role',
  NAV: 'nav',
  HABITAT: 'habitat',
  SETTINGS: 'settings',
  VIEWPORT: 'viewport',
  TIME_CONTROLS: 'time-controls',
  INTERVENTIONS: 'interventions',
  METRICS: 'metrics',
  COLONIES: 'colonies',
  ADD_COLONY: 'add-colony',
  INSPECTOR: 'inspector',
  EXPORT: 'export',
} as const;

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type TourAnchor = (typeof TOUR_ANCHORS)[keyof typeof TOUR_ANCHORS];

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

export const tourAnchorSelector = (anchor: TourAnchor) =>
  `[data-tour="${anchor}"]` as const;
