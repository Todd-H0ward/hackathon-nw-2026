import { Outlet } from 'react-router';

import { SpaceLoadingScreen } from '@/features/loading-screen';
import { PlanetTransitionOverlay } from '@/features/planet-transition';

import { Providers } from './providers';

export const App = () => {
  return (
    <Providers>
      <SpaceLoadingScreen />
      <div className="h-dvh min-h-dvh w-full">
        <Outlet />
      </div>
      <PlanetTransitionOverlay />
    </Providers>
  );
};
