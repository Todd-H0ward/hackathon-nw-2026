/** Planet screen pose — center, silhouette radius, camera distance. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

/** Where a globe sits on screen: center + silhouette radius in CSS px, eye distance in world units. */
export type PlanetScreenPose = {
  x: number;
  y: number;
  radius: number;
  distance: number;
};

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Screen-space silhouette radius of a sphere seen by a perspective camera. */
export const projectedRadius = (
  worldRadius: number,
  distance: number,
  fovDeg: number,
  viewportHeight: number,
) => {
  const alpha = Math.asin(Math.min(0.999, worldRadius / distance));
  const halfFov = (fovDeg * Math.PI) / 360;
  return (Math.tan(alpha) / Math.tan(halfFov)) * (viewportHeight / 2);
};
