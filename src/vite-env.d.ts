/// <reference types="vite/client" />
/// <reference types="vite-plugin-glsl/ext" />

import type { Object3DNode } from '@react-three/fiber';
import type { ShaderMaterial } from 'three';

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_XENOCHOICE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    sparkMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
    hazeMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
  }
}
