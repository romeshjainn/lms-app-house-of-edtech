import '../../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { COLORS } from '@/constants';
import { AppProviders } from '@/providers/AppProviders';
import { ANALYTICS_EVENTS, trackEvent } from '@/services/analytics.service';
import {
  cancelInactivityReminder,
  scheduleInactivityReminder,
} from '@/services/inactivity.service';
import { useAppSelector } from '@/store';
import { selectInactivityReminder } from '@/store/slices/preferences.slice';
import { UBUNTU_FONTS } from 'assets';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const inactivityEnabled = useAppSelector(selectInactivityReminder);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.APP_OPEN);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (!inactivityEnabled) return;

      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        await scheduleInactivityReminder();
      }

      if (nextState === 'active') {
        await cancelInactivityReminder();
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [inactivityEnabled]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
        animation: 'fade',
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...UBUNTU_FONTS,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigation />
    </AppProviders>
  );
}
