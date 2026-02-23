import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '@/constants';
import { asyncStorage } from '@/services/storage/async-storage';
import { secureStorage } from '@/services/storage/secure-storage';
import type { AuthStoreState, AuthUser, LocalUserProfile } from '@/types/auth.types';

function mapToLocalProfile(
  user: AuthUser,
  profileImageUri: string | null = null,
): LocalUserProfile {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatarUrl: null,
    profileImageUri,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

export interface LoginSuccessPayload {
  accessToken: string;
  refreshToken: string;
  profileImageUri?: string | null;
}

const initialState: AuthStoreState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isGuest: false,
};

export const hydrateAuth = createAsyncThunk<{
  accessToken: string | null;
  refreshToken: string | null;
  user: LocalUserProfile | null;
}>('auth/hydrate', async () => {
  const [accessToken, refreshToken, profileImageUri] = await Promise.all([
    secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    asyncStorage.getItem(STORAGE_KEYS.PROFILE_IMAGE_URI),
  ]);
  if (!accessToken) {
    return { accessToken: null, refreshToken: null, user: null };
  }

  try {
    const { authService } = await import('@/services/api/modules/auth.service');
    const apiRes = await authService.getCurrentUser(accessToken);
    const localProfile = mapToLocalProfile(apiRes.data, profileImageUri ?? null);
    await asyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(localProfile));

    return { accessToken, refreshToken, user: localProfile };
  } catch (error) {
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      asyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      asyncStorage.removeItem(STORAGE_KEYS.PROFILE_IMAGE_URI),
    ]);
    return { accessToken: null, refreshToken: null, user: null };
  }
});

export const loginSuccess = createAsyncThunk<
  { accessToken: string; refreshToken: string; user: LocalUserProfile },
  LoginSuccessPayload
>('auth/loginSuccess', async ({ accessToken, refreshToken, profileImageUri = null }) => {
  await Promise.all([
    secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
    secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
  const { authService } = await import('@/services/api/modules/auth.service');
  const apiRes = await authService.getCurrentUser(accessToken);
  const localProfile = mapToLocalProfile(apiRes.data, profileImageUri);
  const tasks: Promise<void>[] = [
    asyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(localProfile)),
  ];
  if (profileImageUri) {
    tasks.push(asyncStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE_URI, profileImageUri));
  }
  await Promise.all(tasks);

  return { accessToken, refreshToken, user: localProfile };
});

export const mergeProfileImage = createAsyncThunk<string | null, string | null>(
  'auth/mergeProfileImage',
  async (profileImageUri) => {
    if (profileImageUri) {
      await asyncStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE_URI, profileImageUri);
    } else {
      await asyncStorage.removeItem(STORAGE_KEYS.PROFILE_IMAGE_URI);
    }
    return profileImageUri;
  },
);

export const logout = createAsyncThunk<void>('auth/logout', async () => {
  await Promise.all([
    secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
    secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    asyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
    asyncStorage.removeItem(STORAGE_KEYS.PROFILE_IMAGE_URI),
  ]);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    enterGuestMode(state) {
      state.isGuest = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.accessToken && !!action.payload.user;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isHydrated = true;
      });
    builder.addCase(loginSuccess.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isGuest = false;
    });
    builder.addCase(mergeProfileImage.fulfilled, (state, action) => {
      if (state.user) {
        state.user.profileImageUri = action.payload;
      }
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isGuest = false;
    });
  },
});

export const { enterGuestMode } = authSlice.actions;

export default authSlice.reducer;
