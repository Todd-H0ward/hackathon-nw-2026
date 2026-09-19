import { useMemo } from 'react';

import { BufferGeometry, Float32BufferAttribute, Sphere, Vector3 } from 'three';

const SHELL = 1.15;

export const createPointGrid = (size: number) => {
  const count = size * size;
  const uv = new Float32Array(count * 2);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      uv[index * 2] = (j + 0.5) / size;
      uv[index * 2 + 1] = (i + 0.5) / size;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  geometry.setDrawRange(0, count);
  geometry.boundingSphere = new Sphere(new Vector3(0, 0, 0), SHELL);
  return geometry;
};

export const usePointGrid = (size: number) =>
  useMemo(() => createPointGrid(size), [size]);
