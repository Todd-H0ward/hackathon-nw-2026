import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';

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
        lazy: async () => {
          const { SandboxLayout } = await import('@/pages/sandbox');
          return { Component: SandboxLayout };
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const { SandboxPage } = await import('@/pages/sandbox');
              return { Component: SandboxPage };
            },
          },
          {
            path: STATIC_ROUTES.ANALYTICS,
            lazy: async () => {
              const { AnalyticsPage } = await import('@/pages/sandbox');
              return { Component: AnalyticsPage };
            },
          },
          {
            path: STATIC_ROUTES.ATLAS,
            lazy: async () => {
              const { AtlasPage } = await import('@/pages/sandbox');
              return { Component: AtlasPage };
            },
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
