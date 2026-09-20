/// <reference types="vite/client" />
/// <reference types="vite-plugin-glsl/ext" />

/** Vite, env var, and R3F element type declarations. */

import type { Object3DNode } from '@react-three/fiber';
import type { ShaderMaterial } from 'three';

// ═══════════════════════════════════════════
// ENVIRONMENT VARIABLES
// ═══════════════════════════════════════════

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_XENOCHOICE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// ═══════════════════════════════════════════
// R3F ELEMENTS
// ═══════════════════════════════════════════

declare module '@react-three/fiber' {
  interface ThreeElements {
    sparkMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
    hazeMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial>;
  }
}
