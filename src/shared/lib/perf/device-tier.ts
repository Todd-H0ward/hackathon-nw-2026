/**
 * Coarse device tier for adaptive WebGL quality.
 * Prefer under-drawing on weak GPUs over hitching the lab.
 */

export type DeviceTier = 'low' | 'mid' | 'high';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

let cached: DeviceTier | null = null;

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

export const shouldEnableComposerNoise = (): boolean =>
  resolveDeviceTier() !== 'low';
