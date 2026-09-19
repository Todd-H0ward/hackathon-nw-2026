precision highp float;

varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vModelDir;
varying vec2 vUv;

void main() {
  vUv = uv;
  vModelDir = normalize(normal);

  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vEye = normalize(mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
