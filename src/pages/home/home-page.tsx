import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { motion } from 'motion/react';

import { PlanetHood } from '@/pages/home/planet-hood';
import { PlanetSlider } from '@/pages/home/planet-slider';

import { useWorlds } from '@/shared/api/xenochoice';
import { STATIC_ROUTES } from '@/shared/constants/routes';
import type { GlobeBodyId } from '@/shared/ui/globe';

import {
  getTransitionState,
  useTransitionBody,
  useTransitionPhase,
} from '@/store';

import { worldsToPlanetInfoMap } from './planet-info';

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState<GlobeBodyId>('earth');
  const phase = useTransitionPhase();
  const transitionBody = useTransitionBody();
  const navigated = useRef(false);

  const worldsQuery = useWorlds();
  const catalog = useMemo(
    () => worldsToPlanetInfoMap(worldsQuery.data),
    [worldsQuery.data],
  );

  const handingOff = phase === 'handoff';
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

  return (
    <motion.div
      className="fixed inset-0 h-dvh w-dvw overflow-hidden bg-black"
      style={{ pointerEvents: phase === 'idle' ? undefined : 'none' }}
      animate={{ opacity: handingOff ? 0 : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (navigated.current) return;
        if (getTransitionState().phase !== 'handoff') return;
        navigated.current = true;
        navigate(STATIC_ROUTES.SANDBOX);
      }}
    >
      <PlanetSlider
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        hiddenBody={handingOff ? transitionBody : null}
        catalog={catalog}
      />
      {activeInfo ? (
        <PlanetHood activeBody={activeSlide} info={activeInfo} />
      ) : null}
    </motion.div>
  );
};
