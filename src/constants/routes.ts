const ROUTES = {
  SPLASH: '/',
  WELCOME: '/welcome',

  LOGIN: '/login',
  REGISTER: '/register',

  HOME: '/home',
  PROFILE: '/profile',
  SETTINGS: '/profile/settings',
  MY_COURSES: '/profile/my-courses',
  BOOKMARKS: '/profile/bookmarks',

  COURSES: '/courses',
} as const;

export const courseDetailRoute = (courseId: number): string =>
  `/courses/${courseId}`;

export default ROUTES;
