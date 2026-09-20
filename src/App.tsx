import { Outlet } from 'react-router';

import { SpaceLoadingScreen } from '@/features/loading-screen';
import { PlanetTransitionOverlay } from '@/features/planet-transition';

import { Providers } from './providers';

/** Root app layout: providers, loading screen, and route outlet. */

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

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
