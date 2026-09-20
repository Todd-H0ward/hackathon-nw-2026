import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import {
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  WebGLRenderTarget,
} from 'three';

import { buildFibonacciField } from '@/shared/ui/globe/lib/fibonacci';
import blitFrag from '@/shared/ui/globe/sim/shaders/blit.frag';
import evolveFrag from '@/shared/ui/globe/sim/shaders/evolve.frag';
import fullscreenVert from '@/shared/ui/globe/sim/shaders/fullscreen.vert';

export type UsePositionSimParams = {
  size: number;
  spin?: number;
  jitter?: number;
  /**
   * When false, skip the per-frame FBO evolve. Use a ref so a carousel can
   * toggle this from its pose `useFrame` without re-mounting the globe.
   * Defaults to always on (sandbox / single-globe canvases).
   */
  enabledRef?: RefObject<boolean>;
  /**
   * Optional per-frame spin/jitter source (ferry look morph). When set, overrides
   * the static `spin` / `jitter` props inside the evolve loop.
   */
  motionRef?: RefObject<{ spin: number; jitter: number }>;
};

export type UsePositionSimResult = {
  getPositions: () => Texture | null;
  seedTexture: Texture | null;
  ready: boolean;
};

const createTarget = (size: number) =>
  new WebGLRenderTarget(size, size, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });

export const usePositionSim = ({
  size,
  spin = 0,
  jitter = 0,
  enabledRef,
  motionRef,
}: UsePositionSimParams): UsePositionSimResult => {
  const { gl } = useThree();
  const [ready, setReady] = useState(false);
  const [seedTexture, setSeedTexture] = useState<Texture | null>(null);

  const currentRef = useRef<WebGLRenderTarget | null>(null);
  const previousRef = useRef<WebGLRenderTarget | null>(null);
  const flipRef = useRef(false);
  const timeRef = useRef(0);

  const restTexture = useMemo(() => {
    const data = buildFibonacciField(size);
    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }, [size]);

  const scene = useMemo(() => new Scene(), []);
  const camera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  const quad = useMemo(() => {
    const mesh = new Mesh(new PlaneGeometry(2, 2));
    scene.add(mesh);
    return mesh;
  }, [scene]);

  const targets = useMemo(() => {
    const current = createTarget(size);
    const previous = createTarget(size);
    currentRef.current = current;
    previousRef.current = previous;
    return { current, previous };
  }, [size]);

  const blitMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTexture: { value: null as Texture | null } },
        vertexShader: fullscreenVert,
        fragmentShader: blitFrag,
      }),
    [],
  );

  const evolveMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uPrev: { value: null as Texture | null },
          uRest: { value: null as Texture | null },
          uSize: { value: size },
          uTime: { value: 0 },
          uSpin: { value: spin },
          uJitter: { value: jitter },
        },
        vertexShader: fullscreenVert,
        fragmentShader: evolveFrag,
      }),
    [size, spin, jitter],
  );

  const draw = (material: ShaderMaterial, target: WebGLRenderTarget) => {
    quad.material = material;
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  };

  useEffect(() => {
    evolveMaterial.uniforms.uSpin.value = spin;
    evolveMaterial.uniforms.uJitter.value = jitter;
  }, [evolveMaterial, spin, jitter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-seed when FBO size changes
  useEffect(() => {
    const current = currentRef.current;
    const previous = previousRef.current;
    if (!current || !previous) return;

    setReady(false);
    flipRef.current = false;

    blitMaterial.uniforms.uTexture.value = restTexture;
    draw(blitMaterial, current);
    draw(blitMaterial, previous);

    setReady(true);
    setSeedTexture(current.texture);
  }, [gl, blitMaterial, restTexture, size, targets.current, targets.previous]);

  const paramsRef = useRef({ spin, jitter });
  paramsRef.current = { spin, jitter };
  const settleRestRef = useRef(false);

  useFrame((_, delta) => {
    if (!ready) return;
    // Carousel writes this from a higher-priority frame (−2); skip invisible
    // side/wrap planets so their FBO ping-pong never hits the GPU.
    if (enabledRef && !enabledRef.current) return;

    const current = currentRef.current;
    const previous = previousRef.current;
    if (!current || !previous) return;

    const read = flipRef.current ? previous : current;
    const write = flipRef.current ? current : previous;
    const { spin: nextSpin, jitter: nextJitter } =
      motionRef?.current ?? paramsRef.current;

    // When motion stops, blit rest once so the cloud matches a fresh sandbox globe.
    if (nextSpin === 0 && nextJitter === 0) {
      if (!settleRestRef.current) return;
      settleRestRef.current = false;
      blitMaterial.uniforms.uTexture.value = restTexture;
      draw(blitMaterial, write);
      flipRef.current = !flipRef.current;
      return;
    }

    settleRestRef.current = true;
    timeRef.current += delta * 0.3;

    evolveMaterial.uniforms.uPrev.value = read.texture;
    evolveMaterial.uniforms.uRest.value = restTexture;
    evolveMaterial.uniforms.uSize.value = size;
    evolveMaterial.uniforms.uTime.value = timeRef.current;
    evolveMaterial.uniforms.uSpin.value = nextSpin;
    evolveMaterial.uniforms.uJitter.value = nextJitter;

    draw(evolveMaterial, write);
    flipRef.current = !flipRef.current;
  }, -1);

  const getPositions = () => {
    const current = currentRef.current;
    const previous = previousRef.current;
    if (!current || !previous) return null;
    return flipRef.current ? previous.texture : current.texture;
  };

  useEffect(
    () => () => {
      targets.current.dispose();
      targets.previous.dispose();
      restTexture.dispose();
      blitMaterial.dispose();
      evolveMaterial.dispose();
      quad.geometry.dispose();
    },
    [targets, restTexture, blitMaterial, evolveMaterial, quad],
  );

  return { getPositions, seedTexture, ready };
};
