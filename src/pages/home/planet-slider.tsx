import { type RefObject, useRef } from 'react';
import { useNavigate } from 'react-router';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

import { STATIC_ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/ui';
import {
  GLOBE_BODY_IDS,
  type GlobeBodyId,
  GlobeCarouselCanvas,
  type PlanetHoverPayload,
  type PlanetScreenPose,
} from '@/shared/ui/globe';

import { useLabSetBody, useTransitionLaunch } from '@/store';

import {
  PlanetHoverCursor,
  type PlanetHoverCursorHandle,
} from './planet-hover-cursor';
import type { PlanetInfoCatalog } from './planet-info';

interface PlanetSliderProps {
  activeSlide: GlobeBodyId;
  setActiveSlide: (value: GlobeBodyId) => void;
  hiddenBody?: GlobeBodyId | null;
  catalog: PlanetInfoCatalog;
  poseMeasureRef?: RefObject<
    ((body: GlobeBodyId) => PlanetScreenPose | null) | null
  >;
}

const shiftBody = (current: GlobeBodyId, delta: number): GlobeBodyId => {
  const index = GLOBE_BODY_IDS.indexOf(current);
  const next =
    (((index + delta) % GLOBE_BODY_IDS.length) + GLOBE_BODY_IDS.length) %
    GLOBE_BODY_IDS.length;
  return GLOBE_BODY_IDS[next];
};

export const PlanetSlider = ({
  activeSlide,
  setActiveSlide,
  hiddenBody = null,
  catalog,
  poseMeasureRef,
}: PlanetSliderProps) => {
  const navigate = useNavigate();
  const setBody = useLabSetBody();
  const launchTransition = useTransitionLaunch();
  const reduceMotion = useReducedMotion();
  const cursorRef = useRef<PlanetHoverCursorHandle>(null);
  const lastBodyRef = useRef<GlobeBodyId | null>(null);

  const handleHoverPlanet = (payload: PlanetHoverPayload | null) => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (!payload) {
      lastBodyRef.current = null;
      cursor.hide();
      return;
    }

    if (lastBodyRef.current !== payload.body) {
      lastBodyRef.current = payload.body;
      cursor.show(payload.body, payload.clientX, payload.clientY);
      return;
    }

    cursor.move(payload.clientX, payload.clientY);
  };

  const handlePlanetClick = (
    body: GlobeBodyId,
    pose: PlanetScreenPose | null,
  ) => {
    cursorRef.current?.hide();
    setBody(body);

    // HomePage navigates once the overlay has picked the planet up.
    if (pose && !reduceMotion) {
      launchTransition(body, pose, 'forward');
      return;
    }
    navigate(STATIC_ROUTES.SANDBOX);
  };

  const lastShiftTime = useRef(0);
  const handleShift = (delta: number) => {
    const now = Date.now();
    if (now - lastShiftTime.current < 350) return;
    lastShiftTime.current = now;
    setActiveSlide(shiftBody(activeSlide, delta));
  };

  return (
    <div className="relative h-full w-full min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,160,255,0.16)_0%,transparent_58%)]"
        aria-hidden
      />

      <GlobeCarouselCanvas
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        activeBody={activeSlide}
        onBodyChange={setActiveSlide}
        onHoverPlanet={handleHoverPlanet}
        onPlanetClick={handlePlanetClick}
        hiddenBody={hiddenBody}
        poseMeasureRef={poseMeasureRef}
      />

      <PlanetHoverCursor ref={cursorRef} catalog={catalog} />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Предыдущая планета"
        className="absolute top-[42%] left-2 z-10 -translate-y-1/2 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white md:left-6"
        onClick={() => handleShift(-1)}
      >
        <ChevronLeft className="size-7" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Следующая планета"
        className="absolute top-[42%] right-2 z-10 -translate-y-1/2 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white md:right-6"
        onClick={() => handleShift(1)}
      >
        <ChevronRight className="size-7" />
      </Button>
    </div>
  );
};
