// ═══════════════════════════════════════════
// GPGPU BLIT — copy texture into FBO
// ═══════════════════════════════════════════
// Seeds rest pose and settles at zero motion.

precision highp float;

uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}
