import { Outlet } from 'react-router';

import { Providers } from '@/components/layouts';

import { PlanetTransitionOverlay } from '@/features/planet-transition';

export const App = () => {
  return (
    <Providers>
      <div className="h-dvh min-h-dvh w-full bg-black">
        <Outlet />
      </div>
      <PlanetTransitionOverlay />
    </Providers>
  );
};
