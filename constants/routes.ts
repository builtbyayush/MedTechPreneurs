export const ROUTES = {
  /** Public marketing landing page */
  home: "/",
  login: "/login",
  register: "/register",
  logout: "/logout",
  onboarding: "/onboarding",
  /** @deprecated Redirects to app home — use ROUTES.app.home */
  dashboard: "/dashboard",
  offline: "/offline",
  terms: "/terms",
  privacy: "/privacy",
  cookies: "/cookies",
  app: {
    home: "/home",
    discover: "/discover",
    matches: "/matches",
    messages: "/messages",
    profile: "/profile",
    toolkit: "/toolkit",
    settings: "/settings",
  },
} as const;

export function conversationRoute(conversationId: string): string {
  return `${ROUTES.app.messages}/${conversationId}`;
}

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
export type AppShellRoute =
  (typeof ROUTES.app)[keyof typeof ROUTES.app];

/** Authenticated app routes for middleware and navigation */
export const APP_SHELL_ROUTES = Object.values(ROUTES.app);

export function isAppShellRoute(pathname: string): boolean {
  return APP_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
