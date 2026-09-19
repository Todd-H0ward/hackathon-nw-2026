export const STATIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
} as const;

export const DYNAMIC_ROUTES = {
  POST: (postId: string | number) => `/news/${postId}`,
} as const;

export const DYNAMIC_ROUTE_PATTERNS = {
  POST: '/news/:postId',
} as const;
