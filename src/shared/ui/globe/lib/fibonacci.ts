const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;

const fract = (value: number) => value - Math.floor(value);

const particlePhase = (index: number, u: number, v: number) => {
  const part1 = Math.sin(index * 12.9898 + index * 0.37 * 78.233) * 43758.5453;
  const part2 = Math.sin(u * 39.346 + v * 11.135) * 24634.317;
  return fract(part1 + part2);
};

/** N×N RGBA float grid: xyz = unit direction, w = phase. */
export const buildFibonacciField = (size: number) => {
  const count = size * size;
  const data = new Float32Array(count * 4);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      const u = (j + 0.5) / size;
      const v = (i + 0.5) / size;

      const k = index + 0.5;
      const y = 1 - (2 * k) / count;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = (index * GOLDEN_ANGLE) % TAU;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const offset = index * 4;
      data[offset] = x;
      data[offset + 1] = y;
      data[offset + 2] = z;
      data[offset + 3] = particlePhase(index, u, v);
    }
  }

  return data;
};
