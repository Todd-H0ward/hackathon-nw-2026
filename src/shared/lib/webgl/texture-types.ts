/** Framebuffer type selection for postprocessing composer. */

import {
  FloatType,
  HalfFloatType,
  type TextureDataType,
  UnsignedByteType,
  type WebGLRenderer,
} from 'three';

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/** Pick HalfFloat/Float/UnsignedByte based on EXT_float_blend. */
export const getComposerFrameBufferType = (
  gl: WebGLRenderer,
): TextureDataType => {
  if (gl.extensions.has('EXT_float_blend')) {
    return gl.capabilities.isWebGL2 ? HalfFloatType : FloatType;
  }

  return UnsignedByteType;
};
