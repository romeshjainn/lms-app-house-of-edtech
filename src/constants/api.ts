const API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL as string,
  VERSION: 'v1',
  TIMEOUT: 15000,
} as const;

export default API;
