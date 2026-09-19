precision highp float;

uniform sampler2D uPrev;
uniform sampler2D uRest;
uniform float uSize;
uniform float uTime;
uniform float uSpin;
uniform float uJitter;

varying vec2 vUv;

const float TAU = 6.28318530718;

vec2 snapSimUv(vec2 rawUv, float size) {
  return (floor(rawUv * size) + 0.5) / size;
}

float hash11(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

mat3 rotationY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

void main() {
  vec2 simUv = snapSimUv(vUv, uSize);

  // Ping-pong input (bound each pass); idle pose is fully determined by rest.
  vec4 prev = texture2D(uPrev, simUv);

  vec4 rest = texture2D(uRest, simUv);
  vec3 baseDir = normalize(rest.xyz);
  float phase = rest.w;

  float h1 = hash11(phase * 17.13 + 0.31);
  float h2 = hash11(phase * 41.97 + 1.07);
  float h3 = hash21(simUv * 97.0 + phase);

  float spinAngle = uTime * uSpin * (0.35 + h1 * 1.1)
    + sin(uTime * (0.17 + h2 * 0.4) + phase * TAU) * uSpin * 0.15;
  vec3 spun = rotationY(spinAngle) * baseDir;

  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(up, spun));
  if (dot(tangent, tangent) < 1e-6) {
    tangent = normalize(cross(vec3(1.0, 0.0, 0.0), spun));
  }
  vec3 bitangent = cross(spun, tangent);

  float t1 = uTime * (0.37 + h1 * 1.85) + phase * TAU;
  float t2 = uTime * (0.91 + h2 * 2.41) + h3 * TAU;

  float amp = uJitter * (0.55 + h1 * 1.35);
  vec3 offset =
    tangent * (sin(t1) * amp)
    + bitangent * (cos(t2) * amp * 0.85);

  vec3 dir = normalize(spun + offset);

  gl_FragColor = vec4(dir, phase);
}
