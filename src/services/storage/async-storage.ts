import RNAsyncStorage from '@react-native-async-storage/async-storage';

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await RNAsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to set key "${key}":`, error);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  try {
    return await RNAsyncStorage.getItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to get key "${key}":`, error);
    return null;
  }
};
const removeItem = async (key: string): Promise<void> => {
  try {
    await RNAsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to remove key "${key}":`, error);
  }
};

const removeMany = async (keys: string[]): Promise<void> => {
  try {
    await RNAsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error(`[AsyncStorage] Failed to remove keys [${keys.join(', ')}]:`, error);
  }
};

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
