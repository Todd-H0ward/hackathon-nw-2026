/** Barrel export for utilities and adaptive WebGL. */

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════

export {
  type DeviceTier,
  resolveBloomTierScale,
  resolveCarouselResolution,
  resolveDenseStarCount,
  resolveDeviceTier,
  resolveSandboxResolution,
  shouldEnableComposerNoise,
} from './perf/device-tier';
export { cn } from './utils';
