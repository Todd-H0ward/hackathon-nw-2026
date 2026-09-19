import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color } from 'three';

import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

const SparkMaterial = shaderMaterial(
  {
    uPositions: null,
    uColor: null,
    uPointSize: 11,
    uScreenScale: 1,
    uStrengthPow: 7,
    uDepthMin: 0.3,
    uDepthMax: 1,
    uDepthRadius: 1.15,
    uRadius: 2.3,
    uSimSize: 400,
    uTint: new Color('#f2f2f2'),
    uEnvIntensity: 0.35,
  },
  vertexShader,
  fragmentShader,
);

extend({ SparkMaterial });
