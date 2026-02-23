import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { biometricService } from '@/services/biometric.service';
import type { NotificationPermissionStatus } from '@/services/notification.service';
import { notificationService } from '@/services/notification.service';
import type { RootState } from '../root-reducer';

export interface PreferencesState {
  biometricEnabled: boolean;
  biometricSupported: boolean;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermissionStatus;
  darkMode: boolean;
  inactivityReminder: boolean;
  permissionRequested: boolean;
}

const initialState: PreferencesState = {
  biometricEnabled: false,
  biometricSupported: false,
  notificationsEnabled: true,
  notificationPermission: 'undetermined',
  darkMode: false,
  inactivityReminder: false,
  permissionRequested: false,
};

export const initBiometricSupport = createAsyncThunk<
  { isSupported: boolean },
  void,
  { state: RootState }
>('preferences/initBiometricSupport', async () => {
  const support = await biometricService.checkSupport();
  return { isSupported: support.isSupported };
});

export const initNotificationStatus = createAsyncThunk<
  { status: NotificationPermissionStatus },
  void
>('preferences/initNotificationStatus', async () => {
  const result = await notificationService.getPermissionStatus();
  return { status: result.status };
});

export const requestNotificationAccess = createAsyncThunk<
  { status: NotificationPermissionStatus; granted: boolean },
  void
>('preferences/requestNotificationAccess', async () => {
  const result = await notificationService.requestPermission();
  return { status: result.status, granted: result.granted };
});

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },

    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },

    setNotificationPermission(state, action: PayloadAction<NotificationPermissionStatus>) {
      state.notificationPermission = action.payload;
    },

    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },

    setInactivityReminder(state, action: PayloadAction<boolean>) {
      state.inactivityReminder = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(initBiometricSupport.fulfilled, (state, action) => {
      state.biometricSupported = action.payload.isSupported;
      if (!action.payload.isSupported) {
        state.biometricEnabled = false;
      }
    });

    builder.addCase(initNotificationStatus.fulfilled, (state, action) => {
      state.notificationPermission = action.payload.status;
      if (action.payload.status === 'denied') {
        state.notificationsEnabled = false;
      }
    });

    builder.addCase(requestNotificationAccess.fulfilled, (state, action) => {
      state.notificationPermission = action.payload.status;
      state.permissionRequested = true;

      if (action.payload.granted) {
        state.notificationsEnabled = true;
      }
    });
  },
});

export const {
  setBiometricEnabled,
  setNotificationsEnabled,
  setNotificationPermission,
  setDarkMode,
  setInactivityReminder,
} = preferencesSlice.actions;

export const selectBiometricEnabled = (state: RootState) => state.preferences.biometricEnabled;
export const selectBiometricSupported = (state: RootState) => state.preferences.biometricSupported;
export const selectNotificationsEnabled = (state: RootState) =>
  state.preferences.notificationsEnabled;
export const selectNotificationPerm = (state: RootState) =>
  state.preferences.notificationPermission;
export const selectDarkMode = (state: RootState) => state.preferences.darkMode;
export const selectInactivityReminder = (state: RootState) => state.preferences.inactivityReminder;
export const selectPermissionRequested = (state: RootState) =>
  state.preferences.permissionRequested;

export default preferencesSlice.reducer;
