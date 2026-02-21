import RNAsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wraps @react-native-async-storage/async-storage.
 *
 * Use this for non-sensitive persistent data only:
 *  - Onboarding completed flag
 *  - Language preference
 *  - Notification settings
 *  - UI preferences
 *
 * ⚠️  Never store tokens or sensitive user data here.
 *     Use secureStorage for anything sensitive.
 *
 * All values must be strings. Serialize objects with JSON.stringify before
 * storing and JSON.parse after reading.
 *
 * This is the ONLY file that imports AsyncStorage directly.
 * All other files must go through this abstraction.
 */

/**
 * Saves a string value to AsyncStorage.
 * Silently fails on error — never throws.
 */
const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await RNAsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to set key "${key}":`, error);
  }
};

/**
 * Retrieves a string value from AsyncStorage.
 * Returns null if the key does not exist or on error.
 */
const getItem = async (key: string): Promise<string | null> => {
  try {
    return await RNAsyncStorage.getItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to get key "${key}":`, error);
    return null;
  }
};

/**
 * Deletes a single value from AsyncStorage.
 * Silently fails on error — never throws.
 */
const removeItem = async (key: string): Promise<void> => {
  try {
    await RNAsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to remove key "${key}":`, error);
  }
};

/**
 * Deletes multiple values from AsyncStorage in a single operation.
 * More efficient than calling removeItem in a loop.
 * Silently fails on error — never throws.
 */
const removeMany = async (keys: string[]): Promise<void> => {
  try {
    await RNAsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to remove keys [${keys.join(', ')}]:`, error);
  }
};

/**
 * Clears ALL AsyncStorage data for this app.
 * Use only during logout or full app reset flows.
 * Silently fails on error — never throws.
 */
const clear = async (): Promise<void> => {
  try {
    await RNAsyncStorage.clear();
  } catch (error) {
    console.error('[AsyncStorage] Failed to clear storage:', error);
  }
};

export const asyncStorage = {
  setItem,
  getItem,
  removeItem,
  removeMany,
  clear,
};
