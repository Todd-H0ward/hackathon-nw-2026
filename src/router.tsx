import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { SandboxPage } from '@/pages/sandbox';

import { STATIC_ROUTES } from '@/shared/constants';

import { App } from './App';

export const router = createBrowserRouter([
  {
    path: STATIC_ROUTES.HOME,
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: STATIC_ROUTES.SANDBOX,
        element: <SandboxPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
