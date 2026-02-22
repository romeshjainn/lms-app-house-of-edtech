const ROUTES = {
  SPLASH: '/',
  WELCOME: '/welcome',

  LOGIN: '/login',
  REGISTER: '/register',

  HOME: '/home',
  PROFILE: '/profile',
  SETTINGS: '/profile/settings',

  COURSES: '/courses',
} as const;

export const courseDetailRoute = (courseId: number): string =>
  `/courses/${courseId}`;

export default ROUTES;
