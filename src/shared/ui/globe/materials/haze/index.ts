/** Haze atmosphere ShaderMaterial — R3F registration. */

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color } from 'three';

import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

// ═══════════════════════════════════════════
// MATERIAL — UNIFORMS
// ═══════════════════════════════════════════

const HazeMaterial = shaderMaterial(
  {
    atmOpacity: 0.14,
    atmPowFactor: 4.1,
    atmMultiplier: 10.5,
    atmosphereColor: new Color('#6a8aaa'),
    atmColorDotDiv: 8.1,
    atmColorScale: 1.5,
  },
  vertexShader,
  fragmentShader,
);

// ═══════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════

extend({ HazeMaterial });
