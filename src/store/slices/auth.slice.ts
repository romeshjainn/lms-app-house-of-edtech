import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/services/storage/secure-storage';


interface AuthState {
  token: string | null;

  isAuthenticated: boolean;

  isHydrated: boolean;

  isGuest: boolean;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  isGuest: false,
};

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (): Promise<string | null> => {
    const token = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  },
);

export const setToken = createAsyncThunk(
  'auth/setToken',
  async (token: string): Promise<string> => {
    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return token;
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (): Promise<void> => {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
);


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
        state.token = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.isHydrated = true;
      });

    builder.addCase(setToken.fulfilled, (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.isGuest = false;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = false;
    });
  },
});

export const { enterGuestMode } = authSlice.actions;

export default authSlice.reducer;
