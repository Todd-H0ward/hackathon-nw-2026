import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import {
  GLOBE_BODY_IDS,
  type GlobeBodyId,
  GlobeCarouselCanvas,
} from '@/shared/ui/globe';

interface PlanetSliderProps {
  activeSlide: GlobeBodyId;
  setActiveSlide: (value: GlobeBodyId) => void;
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
}: PlanetSliderProps) => {
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
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Previous planet"
        className="absolute top-[42%] left-2 z-10 -translate-y-1/2 text-white/80 hover:bg-white/10 hover:text-white md:left-6"
        onClick={() => setActiveSlide(shiftBody(activeSlide, -1))}
      >
        <ChevronLeft className="size-7" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Next planet"
        className="absolute top-[42%] right-2 z-10 -translate-y-1/2 text-white/80 hover:bg-white/10 hover:text-white md:right-6"
        onClick={() => setActiveSlide(shiftBody(activeSlide, 1))}
      >
        <ChevronRight className="size-7" />
      </Button>

    </div>
  );
};
