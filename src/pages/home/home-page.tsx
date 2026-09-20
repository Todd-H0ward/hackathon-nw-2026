import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { motion } from 'motion/react';

import { PlanetHood } from '@/pages/home/planet-hood';
import { PlanetSlider } from '@/pages/home/planet-slider';

import { useWorlds } from '@/shared/api/xenochoice';
import { STATIC_ROUTES } from '@/shared/constants/routes';
import type { GlobeBodyId, PlanetScreenPose } from '@/shared/ui/globe';

import {
  getLabState,
  getTransitionState,
  useTransitionBody,
  useTransitionDirection,
  useTransitionPhase,
} from '@/store';

import { worldsToPlanetInfoMap } from './planet-info';

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState<GlobeBodyId>(() => {
    const { body, direction, phase } = getTransitionState();
    if (phase !== 'idle' && direction === 'back' && body) return body;
    return 'earth';
  });
  const phase = useTransitionPhase();
  const direction = useTransitionDirection();
  const transitionBody = useTransitionBody();
  const navigated = useRef(false);
  const poseMeasureRef = useRef<
    ((body: GlobeBodyId) => PlanetScreenPose | null) | null
  >(null);

  const worldsQuery = useWorlds();
  const catalog = useMemo(
    () => worldsToPlanetInfoMap(worldsQuery.data),
    [worldsQuery.data],
  );

  const handingOffForward = phase === 'handoff' && direction === 'forward';
  // Keep home under the ferry until land so we don't flash a small carousel planet.
  const showHome = direction !== 'back' || phase === 'land' || phase === 'idle';
  // Freeze carousel GL when visually gone — but keep it running on reverse so
  // poseMeasureRef can arm the landing target.
  const needsCarouselPose = direction === 'back' && phase !== 'idle';
  const freezeCarousel = !needsCarouselPose && (handingOffForward || !showHome);
  const hideTransitionBody =
    !!transitionBody &&
    phase !== 'idle' &&
    (direction === 'forward'
      ? phase === 'handoff'
      : phase === 'handoff' || phase === 'flight');
  const activeInfo = catalog[activeSlide];

  useEffect(() => {
    const prefetch = () => {
      void import('@/pages/sandbox');
    };

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(prefetch, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  // Reverse: arm carousel landing once. Do not depend on `phase` — clearing the
  // target on handoff→flight restarts the ferry (shrink → grow → shrink).
  useEffect(() => {
    if (direction !== 'back') return;
    const body = getTransitionState().body;
    if (!body) return;

    setActiveSlide(body);

    let raf = 0;
    let cancelled = false;
    const startedAt = performance.now();
    const ARM_TIMEOUT_MS = 2500;

    const arm = () => {
      if (cancelled) return;
      if (performance.now() - startedAt > ARM_TIMEOUT_MS) {
        getTransitionState().reset();
        return;
      }
      if (!poseMeasureRef.current?.(body)) {
        raf = window.requestAnimationFrame(arm);
        return;
      }
      getTransitionState().setTarget(
        () => poseMeasureRef.current?.(body) ?? null,
      );
    };
    arm();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      const state = getTransitionState();
      if (state.direction === 'back') state.setTarget(null);
    };
  }, [direction]);

  return (
    <motion.div
      className="fixed inset-0 h-dvh w-dvw overflow-hidden bg-black"
      style={{ pointerEvents: phase === 'idle' ? undefined : 'none' }}
      initial={
        direction === 'back' && phase !== 'idle' ? { opacity: 0 } : false
      }
      animate={{ opacity: handingOffForward || !showHome ? 0 : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (navigated.current) return;
        if (getTransitionState().phase !== 'handoff') return;
        if (getTransitionState().direction !== 'forward') return;
        navigated.current = true;
        navigate(STATIC_ROUTES.SANDBOX);
      }}
    >
      <PlanetSlider
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        hiddenBody={hideTransitionBody ? transitionBody : null}
        catalog={catalog}
        poseMeasureRef={poseMeasureRef}
        paused={freezeCarousel}
      />
      {activeInfo ? (
        <PlanetHood
          activeBody={activeSlide}
          info={activeInfo}
          onEnter={() => {
            getLabState().setBody(activeSlide);
            const pose = poseMeasureRef.current?.(activeSlide);
            if (pose) getTransitionState().launch(activeSlide, pose, 'forward');
            else navigate(STATIC_ROUTES.SANDBOX);
          }}
        />
      ) : null}
    </motion.div>
  );
};
