import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { useAppSelector } from '@/store';
import { FONT_SIZES, SPACING } from '@/theme';

const SPLASH_MIN_MS = 2000;

export default function SplashScreen() {
  const { isGuest } = useAppSelector((state) => state.auth);

  const { isHydrated, isAuthenticated } = useAppSelector((state) => state.auth);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated || !minTimeElapsed) return;

    if (isAuthenticated || isGuest) {
      router.replace(ROUTES.HOME as never);
    } else {
      router.replace(ROUTES.WELCOME as never);
    }
  }, [isHydrated, isAuthenticated, isGuest, minTimeElapsed]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LMS App</Text>
      <Text style={styles.subtitle}>House of EdTech</Text>
      <ActivityIndicator style={styles.spinner} color="rgba(255,255,255,0.5)" size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.DISPLAY,
    color: COLORS.WHITE,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.PRIMARY_LIGHT,
  },
  spinner: {
    marginTop: SPACING.LG,
  },
});
