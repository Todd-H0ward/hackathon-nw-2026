import { createBrowserRouter } from 'react-router';

import { AboutPage } from '@/pages/about';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { PostPage } from '@/pages/post';
import { UIKitPage } from '@/pages/ui-kit';

import { DYNAMIC_ROUTE_PATTERNS, STATIC_ROUTES } from '@/shared/constants';

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
        path: STATIC_ROUTES.ABOUT,
        element: <AboutPage />,
      },

      {
        path: DYNAMIC_ROUTE_PATTERNS.POST,
        element: <PostPage />,
      },
      {
        path: STATIC_ROUTES.UI_KIT,
        element: <UIKitPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
