precision highp float;

uniform float uStrengthPow;
uniform float uDepthMin;
uniform float uDepthMax;
uniform vec3 uTint;
uniform float uEnvIntensity;
uniform float uBrightness;

uniform sampler2D uColor;

varying vec2 vUv;
varying float vDepth;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

float interleavedGradientNoise(vec2 xy) {
  return fract(52.9829189 * fract(dot(xy, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec2 pointUv = gl_PointCoord.xy;

  float radial = clamp(1.0 - distance(pointUv, vec2(0.5)), 0.0, 1.0);
  float strength = pow(smoothstep(0.45, 0.62, radial), max(uStrengthPow, 0.01));

  float depthFade = mix(uDepthMax, uDepthMin, vDepth);
  float alpha = strength * depthFade;

  if (alpha < 0.004) {
    discard;
  }

  vec3 albedo = texture2D(uColor, vUv).rgb;
  vec3 baseColor = albedo * uTint;

  float hemi = 0.55 + 0.45 * max(vWorldNormal.y, 0.0);
  vec3 litColor = baseColor * (1.0 + uEnvIntensity * (hemi - 0.5));

  vec3 hdrColor = litColor * 1.35 * uBrightness;
  float grain = interleavedGradientNoise(gl_FragCoord.xy);
  hdrColor += (grain - 0.5) * (2.0 / 255.0);

  gl_FragColor = vec4(hdrColor, alpha);
}
