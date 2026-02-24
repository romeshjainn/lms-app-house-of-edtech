import { asyncStorage } from '@/services/storage/async-storage';

export const ANALYTICS_EVENTS = {
  APP_OPEN: 'appOpens',
  AI_QUESTION: 'aiQuestions',
  BOOKMARK_ADDED: 'bookmarksAdded',
  ENROLLMENT_ADDED: 'enrollmentsAdded',
} as const;

export async function trackEvent(event: string) {
  const current = await asyncStorage.getItem(event);
  console.log(`Tracking event: ${event}, current count: ${current}`);
  const count = current ? Number(current) : 0;
  await asyncStorage.setItem(event, String(count + 1));
}
export async function getAnalytics(): Promise<Record<string, number>> {
  const keys = Object.values(ANALYTICS_EVENTS);

  const values = await Promise.all(keys.map((key) => asyncStorage.getItem(key)));

  return keys.reduce<Record<string, number>>((acc, key, index) => {
    acc[key] = values[index] ? Number(values[index]) : 0;
    return acc;
  }, {});
}
