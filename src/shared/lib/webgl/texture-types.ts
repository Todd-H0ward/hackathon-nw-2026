import {
  FloatType,
  HalfFloatType,
  type TextureDataType,
  UnsignedByteType,
  type WebGLRenderer,
} from 'three';

export const getComposerFrameBufferType = (
  gl: WebGLRenderer,
): TextureDataType => {
  if (gl.extensions.has('EXT_float_blend')) {
    return gl.capabilities.isWebGL2 ? HalfFloatType : FloatType;
  }

  return UnsignedByteType;
};
