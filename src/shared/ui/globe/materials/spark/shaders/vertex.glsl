precision highp float;

uniform sampler2D uPositions;

uniform float uPointSize;
uniform float uScreenScale;
uniform float uRadius;
uniform float uDepthRadius;
uniform float uSimSize;

varying vec2 vUv;
varying float vDepth;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

vec2 snapSimUv(vec2 rawUv, float size) {
  return (floor(rawUv * size) + 0.5) / size;
}

vec2 directionToMapUv(vec3 dir) {
  vec3 n = normalize(dir);
  float u = atan(n.z, n.x) / TAU + 0.5;
  float v = 1.0 - acos(clamp(n.y, -1.0, 1.0)) / PI;
  return vec2(u, v);
}

vec2 mirrorU(vec2 uv) {
  return vec2(1.0 - uv.x, uv.y);
}

float sphereDepth(vec3 centerEye, float radius, vec3 positionEye) {
  float r = max(radius, 1e-4);
  float currentDepth = -positionEye.z;
  float centerDepth = -centerEye.z;
  float nearDepth = centerDepth - r;
  float farDepth = centerDepth + r;
  return clamp(
    (currentDepth - nearDepth) / max(farDepth - nearDepth, 1e-4),
    0.0,
    1.0
  );
}

void main() {
  vec2 simUv = snapSimUv(uv, uSimSize);
  vec4 particle = texture2D(uPositions, simUv);
  vec3 raw = particle.xyz;
  float len = length(raw);
  vec3 dir = len > 1e-4 ? raw / len : vec3(0.0, 1.0, 0.0);

  vec2 mapUv = mirrorU(directionToMapUv(dir));
  vUv = mapUv;

  vec3 displaced = dir * uRadius;

  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * dir);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  float dist = max(0.01, -mvPosition.z);

  gl_PointSize = uPointSize * uRadius * (uScreenScale / dist);
  gl_Position = projectionMatrix * mvPosition;

  vec3 centerEye = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vDepth = sphereDepth(centerEye, uDepthRadius, mvPosition.xyz);
}
