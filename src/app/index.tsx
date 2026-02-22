import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { COLORS, FONTS, ROUTES } from '@/constants';
import { FONT_SIZES, SPACING } from '@/theme';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(ROUTES.WELCOME);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LMS App</Text>
      <Text style={styles.subtitle}>House of EdTech</Text>
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
});
