import { Outlet } from 'react-router';

import { Providers } from '@/components/layouts';

export const App = () => {
  return (
    <Providers>
      <div className="h-full">
        <Outlet />
      </div>
    </Providers>
  );
};
