import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { motion } from 'motion/react';

import { PlanetHood } from '@/pages/home/planet-hood';
import { PlanetSlider } from '@/pages/home/planet-slider';

import { useWorlds } from '@/shared/api/xenochoice';
import { STATIC_ROUTES } from '@/shared/constants/routes';
import type { GlobeBodyId } from '@/shared/ui/globe';

import { usePlanetTransition } from '@/features/planet-transition';

import { worldsToPlanetInfoMap } from './planet-info';

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState<GlobeBodyId>('earth');
  const phase = usePlanetTransition((s) => s.phase);
  const transitionBody = usePlanetTransition((s) => s.body);
  const navigated = useRef(false);

  const worldsQuery = useWorlds();
  const catalog = useMemo(
    () => worldsToPlanetInfoMap(worldsQuery.data),
    [worldsQuery.data],
  );

  const handingOff = phase === 'handoff';
  const activeInfo = catalog[activeSlide];

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
        catalog={catalog}
      />
      {/* No dossier until `/worlds` answers — nothing here is invented locally. */}
      {activeInfo ? (
        <PlanetHood activeBody={activeSlide} info={activeInfo} />
      ) : null}
    </motion.div>
  );
};
