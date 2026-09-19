import { useState } from 'react';

import { PlanetSlider } from '@/pages/home/planet-slider.tsx';

import type { GlobeBodyId } from '@/shared/ui/globe';

export const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState<GlobeBodyId>('earth');

  return (
    <div className="fixed inset-0 h-dvh w-dvw overflow-hidden bg-black">
      <PlanetSlider activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
    </div>
  );
};
