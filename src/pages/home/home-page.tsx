import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { motion } from 'motion/react';

import { PlanetHood } from '@/pages/home/planet-hood';
import { PlanetSlider } from '@/pages/home/planet-slider';

import { STATIC_ROUTES } from '@/shared/constants/routes';
import type { GlobeBodyId } from '@/shared/ui/globe';

import { usePlanetTransition } from '@/features/planet-transition';

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState<GlobeBodyId>('earth');
  const phase = usePlanetTransition((s) => s.phase);
  const transitionBody = usePlanetTransition((s) => s.body);
  const navigated = useRef(false);

  // The overlay has taken over the planet: hide ours, fade the page, then leave.
  const handingOff = phase === 'handoff';

  return (
    <motion.div
      className="fixed inset-0 h-dvh w-dvw overflow-hidden bg-black"
      style={{ pointerEvents: phase === 'idle' ? undefined : 'none' }}
      animate={{ opacity: handingOff ? 0 : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (navigated.current) return;
        if (usePlanetTransition.getState().phase !== 'handoff') return;
        navigated.current = true;
        navigate(STATIC_ROUTES.SANDBOX);
      }}
    >
      <PlanetSlider
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        hiddenBody={handingOff ? transitionBody : null}
      />
      <PlanetHood activeBody={activeSlide} />
    </motion.div>
  );
};
