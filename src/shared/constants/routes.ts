export const STATIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  VOICE: '/voice',
  SANDBOX: '/sandbox',
  SANDBOX_DEMO: '/sandbox/demo',
  SANDBOX_ANALYTICS: '/sandbox/analytics',
  SANDBOX_ATLAS: '/sandbox/atlas',
  FAQ: '/faq',
  /** Canonical demo route (under SandboxLayout). */
  DEMO: '/sandbox/demo',
  ANALYTICS: 'analytics',
  ATLAS: 'atlas',
  DEMO_SEGMENT: 'demo',
} as const;

export const DYNAMIC_ROUTES = {
  POST: (postId: string | number) => `/news/${postId}`,
} as const;

export const DYNAMIC_ROUTE_PATTERNS = {
  POST: '/news/:postId',
} as const;
