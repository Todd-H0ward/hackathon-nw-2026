/** Background starfield — opaque clear + AdditiveBlending compatibility. */

import { useLayoutEffect, useMemo, useRef } from 'react';

import { Stars } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Color, type Points } from 'three';

import { resolveDenseStarCount } from '@/shared/lib/perf/device-tier';

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

/**
 * Soft background starfield for home carousel and sandbox viewport.
 *
 * drei Stars builds `vec4(position, 0.5)` so world distance is ~2× the
 * spherical radius — keep camera `far` well above `2 * (radius + depth)`.
 *
 * Opaque black clear is required: Stars use AdditiveBlending, and with a
 * transparent canvas + EffectComposer the points otherwise composite away.
 */
export const Starfield = ({ dense = false }: { dense?: boolean }) => {
  const { scene, gl } = useThree();
  const starsRef = useRef<Points>(null);
  const denseCount = useMemo(
    () => (dense ? resolveDenseStarCount() : 2800),
    [dense],
  );

  // ── Clear color: black background required for AdditiveBlending ──
  useLayoutEffect(() => {
    const prevBackground = scene.background;
    const prevAlpha = gl.getContextAttributes()?.alpha ?? true;
    scene.background = new Color(0x000000);
    gl.setClearColor(0x000000, 1);
    return () => {
      scene.background = prevBackground;
      gl.setClearColor(0x000000, prevAlpha ? 0 : 1);
    };
  }, [gl, scene]);

  // ── Render order: stars drawn first ──
  useLayoutEffect(() => {
    const points = starsRef.current;
    if (!points) return;
    points.renderOrder = -1000;
  }, []);

  return (
    <Stars
      ref={starsRef}
      radius={dense ? 55 : 50}
      depth={dense ? 30 : 28}
      count={denseCount}
      factor={dense ? 4.5 : 4}
      saturation={0}
      fade
      speed={0.15}
    />
  );
};
