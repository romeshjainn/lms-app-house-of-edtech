import * as ExpoSecureStore from 'expo-secure-store';

/**
 * SecureStorage wraps expo-secure-store.
 *
 * Use this for sensitive data only:
 *  - Auth tokens
 *  - Refresh tokens
 *  - User credentials
 *
 * All values must be strings. Serialize objects with JSON.stringify before
 * storing and JSON.parse after reading.
 *
 * This is the ONLY file that imports expo-secure-store directly.
 * All other files must go through this abstraction.
 */

/**
 * Saves a string value to the secure keychain.
 * Silently fails on error — never throws.
 */
const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await ExpoSecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`[SecureStorage] Failed to set key "${key}":`, error);
  }
};

/**
 * Retrieves a string value from the secure keychain.
 * Returns null if the key does not exist or on error.
 */
const getItem = async (key: string): Promise<string | null> => {
  try {
    return await ExpoSecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[SecureStorage] Failed to get key "${key}":`, error);
    return null;
  }
};

/**
 * Deletes a value from the secure keychain.
 * Silently fails on error — never throws.
 */
const removeItem = async (key: string): Promise<void> => {
  try {
    await ExpoSecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`[SecureStorage] Failed to remove key "${key}":`, error);
  }
};

export const secureStorage = {
  setItem,
  getItem,
  removeItem,
};
