import { useLayoutEffect } from 'react';

import { Stars } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';

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

  return (
    <Stars
      radius={dense ? 55 : 50}
      depth={dense ? 30 : 28}
      count={dense ? 3500 : 2800}
      factor={dense ? 4.5 : 4}
      saturation={0}
      fade
      speed={0.15}
    />
  );
};
