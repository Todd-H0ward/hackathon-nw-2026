/**
 * Rough device capability estimate for adaptive WebGL quality.
 * Prefer under-rendering on weak GPUs over lab stutters.
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type DeviceTier = 'low' | 'mid' | 'high';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

// ═══════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════

let cached: DeviceTier | null = null;

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Detect device tier from memory, CPU cores, and DPR. */
export const resolveDeviceTier = (): DeviceTier => {
  if (cached) return cached;
  if (typeof navigator === 'undefined') {
    cached = 'mid';
    return cached;
  }

  const memory = (navigator as NavigatorWithMemory).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const dpr =
    typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio || 1, 3)
      : 1;

  // Explicit low-memory / few cores / heavy pixel ratio phones.
  if (
    (memory !== undefined && memory <= 4) ||
    (cores <= 4 && dpr >= 2.5) ||
    cores <= 2
  ) {
    cached = 'low';
    return cached;
  }

  if ((memory !== undefined && memory <= 8) || (cores <= 6 && dpr >= 2)) {
    cached = 'mid';
    return cached;
  }

  cached = 'high';
  return cached;
};

/** Sandbox globe GPGPU / point-cloud resolution (N → N² points). */
export const resolveSandboxResolution = (): number => {
  switch (resolveDeviceTier()) {
    case 'low':
      return 280;
    case 'mid':
      return 320;
    default:
      return 400;
  }
};

/** Dense starfield count for fill canvases. */
export const resolveDenseStarCount = (): number => {
  switch (resolveDeviceTier()) {
    case 'low':
      return 1600;
    case 'mid':
      return 2400;
    default:
      return 3500;
  }
};

/** Home carousel center-planet GPGPU resolution (N → N²). */
export const resolveCarouselResolution = (): number => {
  switch (resolveDeviceTier()) {
    case 'low':
      return 160;
    case 'mid':
      return 200;
    default:
      return 240;
  }
};

export const shouldEnableComposerNoise = (): boolean =>
  resolveDeviceTier() !== 'low';

/** Multipliers applied on top of per-body bloom knobs. */
export const resolveBloomTierScale = (): {
  intensity: number;
  radius: number;
} => {
  switch (resolveDeviceTier()) {
    case 'low':
      return { intensity: 0.5, radius: 0.65 };
    case 'mid':
      return { intensity: 0.72, radius: 0.82 };
    default:
      return { intensity: 1, radius: 1 };
  }
};
