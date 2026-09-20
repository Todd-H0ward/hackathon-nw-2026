import type { GlobeBodyId } from '@/shared/ui/globe';

/** Planet texture as a round thumbnail background (atlas, environment panel). */
export const WORLD_THUMB: Record<GlobeBodyId, string> = {
  earth: "bg-[url('/images/globe/earth_color.jpg')] bg-[position:35%_50%]",
  mars: "bg-[url('/images/globe/mars_color.jpg')]",
  venus: "bg-[url('/images/globe/venus_color.jpg')]",
};

/** Locative case for Russian copy (“на Земле”), keyed by body id. */
export const WORLD_LOCATIVE: Record<GlobeBodyId, string> = {
  earth: 'Земле',
  mars: 'Марсе',
  venus: 'Венере',
};

export const worldCaseName = (body: GlobeBodyId) => WORLD_LOCATIVE[body];
