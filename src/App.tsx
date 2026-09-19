import { Outlet } from 'react-router';

import { Providers } from '@/components/layouts';
import { SpaceLoadingScreen } from '@/components/space-loading-screen';

export const App = () => {
  return (
    <Providers>
      <SpaceLoadingScreen />
      <div className="h-dvh min-h-dvh w-full">
        <Outlet />
      </div>
    </Providers>
  );
};
