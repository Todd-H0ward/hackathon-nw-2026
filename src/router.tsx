import { createBrowserRouter, Navigate } from 'react-router';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';

import { STATIC_ROUTES } from '@/shared/constants';

import { App } from './App';

/** App route config (lazy-load for heavy pages). */

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════

export const router = createBrowserRouter([
  {
    path: STATIC_ROUTES.HOME,
    element: <App />,
    hydrateFallbackElement: (
      <div role="status" style={{ padding: 24 }}>
        Загрузка лаборатории…
      </div>
    ),
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
            path: STATIC_ROUTES.DEMO_SEGMENT,
            lazy: async () => {
              const { DemoPage } = await import('@/pages/demo');
              return { Component: DemoPage };
            },
          },
          {
            path: STATIC_ROUTES.ANALYTICS,
            lazy: async () => {
              const { AnalyticsPage } = await import('@/pages/analytics');
              return { Component: AnalyticsPage };
            },
          },
          {
            path: STATIC_ROUTES.ATLAS,
            lazy: async () => {
              const { AtlasPage } = await import('@/pages/atlas');
              return { Component: AtlasPage };
            },
          },
        ],
      },
      {
        path: '/demo',
        element: <Navigate to={STATIC_ROUTES.DEMO} replace />,
      },
      {
        path: STATIC_ROUTES.FAQ,
        lazy: async () => {
          const { FaqPage } = await import('@/pages/faq');
          return { Component: FaqPage };
        },
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
