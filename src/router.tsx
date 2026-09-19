import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import {
  AnalyticsPage,
  AtlasPage,
  SandboxLayout,
  SandboxPage,
} from '@/pages/sandbox';

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
        element: <SandboxLayout />,
        children: [
          {
            index: true,
            element: <SandboxPage />,
          },
          {
            path: STATIC_ROUTES.ANALYTICS,
            element: <AnalyticsPage />,
          },
          {
            path: STATIC_ROUTES.ATLAS,
            element: <AtlasPage />,
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
