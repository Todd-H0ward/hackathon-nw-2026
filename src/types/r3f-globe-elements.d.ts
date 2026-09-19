import type { Object3DNode } from '@react-three/fiber';
import type { ShaderMaterial } from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    sparkMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
    hazeMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
  }
}
