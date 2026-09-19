precision highp float;

uniform float atmOpacity;
uniform float atmPowFactor;
uniform float atmMultiplier;
uniform vec3 atmosphereColor;
uniform float atmColorDotDiv;
uniform float atmColorScale;

varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vModelDir;
varying vec2 vUv;

float hash31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (dot(p, p) + 33.0));
}

float interleavedGradientNoise(vec2 xy) {
  return fract(52.9829189 * fract(dot(xy, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 e = normalize(vEye);
  float facing = clamp(dot(n, e), 0.0, 1.0);

  float fresnel = 1.0 - facing;
  float fw = max(fwidth(facing), 0.001);
  float rim = smoothstep(0.04 - fw, 0.9 + fw, fresnel);

  float thick = smoothstep(0.03, 0.995, facing);
  float raw = pow(thick, atmPowFactor) * atmMultiplier;
  float factor = 1.0 - exp(-raw * 0.34);

  float dotAdd = facing / max(atmColorDotDiv, 1e-4);
  vec3 atmColor = (atmosphereColor + vec3(dotAdd)) * atmColorScale;

  float intensity = rim * factor;
  float igm = interleavedGradientNoise(gl_FragCoord.xy);
  intensity = max(intensity + (igm - 0.5) * (4.0 / 255.0), 0.0);

  float alpha = intensity * atmOpacity;
  vec3 color = atmColor * intensity;

  float dither = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453123);
  color += (dither - 0.5) * (4.0 / 255.0);
  alpha = clamp(alpha + (dither - 0.5) * (3.0 / 255.0), 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
