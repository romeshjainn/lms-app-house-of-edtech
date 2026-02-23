import { STORAGE_KEYS } from '@/constants';
import { asyncStorage } from '@/services/storage/async-storage';

export async function clearAppStorage() {
  await Promise.all([
    asyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
    asyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    asyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
    asyncStorage.removeItem(STORAGE_KEYS.PROFILE_IMAGE_URI),
    asyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
    asyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ENABLED),
    asyncStorage.removeItem(STORAGE_KEYS.BOOKMARKED_COURSES),
    asyncStorage.removeItem(STORAGE_KEYS.ENROLLED_COURSES),
    asyncStorage.removeItem(STORAGE_KEYS.COMPLETED_COURSES),
  ]);
}
